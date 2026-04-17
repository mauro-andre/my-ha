import { linkedControlSchema } from "./linked-control.schemas.js";
import type { LinkedControl, LinkedMember } from "./linked-control.schemas.js";
import * as repo from "./linked-control.repository.js";
import { getDeviceByIeee, onStateChange } from "../devices/device.services.js";
import { publish } from "../../mqtt/client.js";

// --- Sync state per linked control ---

interface SyncState {
    running: boolean;
    targetValue: unknown;
    timeout: ReturnType<typeof setTimeout> | null;
}

const syncStates = new Map<string, SyncState>();

function getSyncState(controlId: string): SyncState {
    let state = syncStates.get(controlId);
    if (!state) {
        state = { running: false, targetValue: null, timeout: null };
        syncStates.set(controlId, state);
    }
    return state;
}

// --- In-memory cache ---

let controlsCache: LinkedControl[] = [];

export async function loadLinkedControls() {
    controlsCache = await repo.findAllLinkedControls();
    console.log(`[linked] ${controlsCache.length} linked controls loaded`);
}

// --- CRUD ---

export async function createLinkedControl(name: string) {
    const control = linkedControlSchema.parse({
        id: null,
        createdAt: null,
        updatedAt: null,
        name,
        capabilityKind: "",
        members: [],
    });

    await repo.saveLinkedControl(control);
    controlsCache.push(control);
    return control;
}

export async function getAllLinkedControls() {
    return controlsCache;
}

export async function getLinkedControl(id: string) {
    return controlsCache.find((c) => c.id === id) ?? null;
}

export async function deleteLinkedControl(id: string) {
    await repo.deleteLinkedControl(id);
    controlsCache = controlsCache.filter((c) => c.id !== id);
    syncStates.delete(id);
}

export async function updateLinkedControl(control: LinkedControl) {
    await repo.saveLinkedControl(control);
    const index = controlsCache.findIndex((c) => c.id === control.id);
    if (index >= 0) {
        controlsCache[index] = control;
    }
}

export async function addMember(controlId: string, member: LinkedMember) {
    const control = controlsCache.find((c) => c.id === controlId);
    if (!control) return null;

    // Set capability kind from first member
    if (control.members.length === 0) {
        const device = getDeviceByIeee(member.ieeeAddress);
        if (device) {
            const cap = findCapability(device, member.property);
            if (cap) {
                control.capabilityKind = cap.kind;
            }
        }
    }

    control.members.push(member);
    await repo.saveLinkedControl(control);
    return control;
}

export async function removeMember(controlId: string, index: number) {
    const control = controlsCache.find((c) => c.id === controlId);
    if (!control) return null;

    control.members.splice(index, 1);

    // Reset kind if no members left
    if (control.members.length === 0) {
        control.capabilityKind = "";
    }

    await repo.saveLinkedControl(control);
    return control;
}

// --- Sync engine ---

function handleStateChange(ieeeAddress: string, changedKeys: string[], state: Record<string, any>) {
    for (const control of controlsCache) {
        if (control.members.length < 2) continue;

        const triggerMember = control.members.find(
            (m) => m.ieeeAddress === ieeeAddress && changedKeys.includes(m.property)
        );

        if (!triggerMember) continue;

        const sync = getSyncState(control.id!);
        const newValue = state[triggerMember.property];

        // If running, don't propagate — just check convergence
        if (sync.running) {
            checkConvergence(control, sync);
            return;
        }

        // Start sync
        sync.running = true;
        sync.targetValue = newValue;

        console.log(`[linked] "${control.name}" sync started: ${triggerMember.property} → ${JSON.stringify(newValue)}`);

        // Send to all other members
        for (const member of control.members) {
            if (member.ieeeAddress === ieeeAddress && member.property === triggerMember.property) continue;

            const device = getDeviceByIeee(member.ieeeAddress);
            if (!device) continue;

            // Only send if different
            if (device.state[member.property] === newValue) continue;

            publish(`zigbee2mqtt/${device.friendlyName}/set`, {
                [member.property]: newValue,
            });
        }

        // Timeout fallback
        sync.timeout = setTimeout(() => {
            console.log(`[linked] "${control.name}" sync timeout, resetting`);
            sync.running = false;
            sync.targetValue = null;
            sync.timeout = null;
        }, 10000);

        // Check if already converged (some were already in target state)
        checkConvergence(control, sync);
    }
}

function checkConvergence(control: LinkedControl, sync: SyncState) {
    const allInSync = control.members.every((member) => {
        const device = getDeviceByIeee(member.ieeeAddress);
        if (!device) return true; // Skip offline devices
        return device.state[member.property] === sync.targetValue;
    });

    if (allInSync) {
        console.log(`[linked] "${control.name}" sync complete`);
        sync.running = false;
        sync.targetValue = null;
        if (sync.timeout) {
            clearTimeout(sync.timeout);
            sync.timeout = null;
        }
    }
}

// --- Helper ---

function findCapability(device: any, property: string) {
    for (const cap of device.capabilities) {
        if ("features" in cap) {
            const feature = cap.features.find((f: any) => f.property === property);
            if (feature) return feature;
        } else if (cap.property === property) {
            return cap;
        }
    }
    return null;
}

// --- Initialize ---

export function initLinkedControls() {
    onStateChange(handleStateChange);
}
