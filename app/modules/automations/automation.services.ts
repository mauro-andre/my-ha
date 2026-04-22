import { automationSchema } from "./automation.schemas.js";
import type { Automation, Trigger, Condition } from "./automation.schemas.js";
import type { Action } from "../actions/action.schemas.js";
import * as repo from "./automation.repository.js";
import { getDeviceByIeee, onStateChange } from "../devices/device.services.js";
import { runActions } from "../actions/action.services.js";

// --- In-memory state ---

let automationsCache: Automation[] = [];
const activeTimers = new Map<string, ReturnType<typeof setTimeout>>();

// --- Load ---

export async function loadAutomations() {
    automationsCache = await repo.findAllAutomations();
    console.log(`[automations] ${automationsCache.length} automations loaded`);
}

// --- CRUD ---

export async function createAutomation(data: {
    name: string;
    trigger: Trigger;
    conditions: Condition[];
    actions: Action[];
    runOnce: boolean;
}) {
    const trigger = data.trigger.type === "timer"
        ? { ...data.trigger, executeAt: new Date(Date.now() + data.trigger.seconds * 1000) }
        : data.trigger;

    const automation = automationSchema.parse({
        id: null,
        createdAt: null,
        updatedAt: null,
        name: data.name,
        enabled: true,
        runOnce: data.runOnce,
        trigger,
        conditions: data.conditions,
        actions: data.actions,
        lastTriggeredAt: null,
        triggerCount: 0,
    });

    await repo.saveAutomation(automation);
    automationsCache.push(automation);

    if (automation.trigger.type === "timer") {
        restoreTimer(automation);
    } else if (automation.trigger.type === "schedule") {
        scheduleNextRun(automation);
    }

    return automation;
}

export function getAllAutomations() {
    return automationsCache;
}

export async function getAutomation(id: string) {
    return automationsCache.find((a) => a.id === id) ?? null;
}

export async function updateAutomation(automation: Automation) {
    await repo.saveAutomation(automation);
    const index = automationsCache.findIndex((a) => a.id === automation.id);
    if (index >= 0) {
        automationsCache[index] = automation;
    }
}

export async function deleteAutomation(id: string) {
    clearTimer(id);
    await repo.deleteAutomation(id);
    automationsCache = automationsCache.filter((a) => a.id !== id);
}

export async function toggleAutomation(id: string) {
    const automation = automationsCache.find((a) => a.id === id);
    if (!automation) return null;

    automation.enabled = !automation.enabled;
    await repo.saveAutomation(automation);

    if (!automation.enabled) {
        clearTimer(id);
    } else if (automation.trigger.type === "timer") {
        restoreTimer(automation);
    } else if (automation.trigger.type === "schedule") {
        scheduleNextRun(automation);
    }

    return automation;
}

// --- Execution ---

function runAutomation(automation: Automation) {
    console.log(`[automations] Executing "${automation.name}"`);

    runActions(automation.actions);

    automation.lastTriggeredAt = new Date();
    automation.triggerCount += 1;
    repo.saveAutomation(automation);

    if (automation.runOnce) {
        automation.enabled = false;
        clearTimer(automation.id!);
        repo.saveAutomation(automation);
        console.log(`[automations] "${automation.name}" disabled (one-shot)`);
    }
}

function evaluateConditions(conditions: Condition[]): boolean {
    for (const cond of conditions) {
        if (cond.type === "time_range") {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, "0");
            const minutes = String(now.getMinutes()).padStart(2, "0");
            const currentTime = `${hours}:${minutes}`;

            // Handle overnight ranges (e.g. 22:00 to 06:00)
            if (cond.from <= cond.to) {
                if (currentTime < cond.from || currentTime > cond.to) return false;
            } else {
                if (currentTime < cond.from && currentTime > cond.to) return false;
            }
            continue;
        }

        if (cond.type === "device_state") {
            const device = getDeviceByIeee(cond.ieeeAddress);
            if (!device) return false;

            const currentValue = device.state[cond.property];

            switch (cond.operator) {
                case "eq": if (currentValue !== cond.value) return false; break;
                case "neq": if (currentValue === cond.value) return false; break;
                case "gt": if (!(currentValue > cond.value)) return false; break;
                case "lt": if (!(currentValue < cond.value)) return false; break;
                case "gte": if (!(currentValue >= cond.value)) return false; break;
                case "lte": if (!(currentValue <= cond.value)) return false; break;
            }
        }
    }
    return true;
}

// --- Timer trigger ---

function restoreTimer(automation: Automation) {
    if (automation.trigger.type !== "timer" || !automation.enabled) return;
    clearTimer(automation.id!);

    const executeAt = new Date(automation.trigger.executeAt).getTime();
    const remaining = executeAt - Date.now();

    if (remaining <= 0) {
        // Already expired
        if (automation.runOnce) {
            automation.enabled = false;
            repo.saveAutomation(automation);
            console.log(`[automations] Timer "${automation.name}" expired while offline, disabled`);
        }
        return;
    }

    const timeout = setTimeout(() => {
        activeTimers.delete(automation.id!);
        if (!automation.enabled) return;

        if (automation.conditions.length > 0 && !evaluateConditions(automation.conditions)) {
            console.log(`[automations] "${automation.name}" conditions not met, skipping`);
            if (automation.runOnce) {
                automation.enabled = false;
                repo.saveAutomation(automation);
            }
            return;
        }

        runAutomation(automation);
    }, remaining);

    activeTimers.set(automation.id!, timeout);
    console.log(`[automations] Timer restored: "${automation.name}" in ${Math.round(remaining / 1000)}s`);
}

function clearTimer(id: string) {
    const timer = activeTimers.get(id);
    if (timer) {
        clearTimeout(timer);
        activeTimers.delete(id);
    }
}

// --- Schedule trigger ---

const DAY_NAMES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

function getNextScheduleMs(time: string, days: string[]): number {
    const [hours, minutes] = time.split(":").map(Number);
    const now = new Date();

    for (let offset = 0; offset < 8; offset++) {
        const target = new Date(now);
        target.setDate(target.getDate() + offset);
        target.setHours(hours!, minutes!, 0, 0);

        if (target.getTime() <= now.getTime()) continue;

        if (days.length > 0) {
            const dayName = DAY_NAMES[target.getDay()]!;
            if (!days.includes(dayName)) continue;
        }

        return target.getTime() - now.getTime();
    }

    return 24 * 60 * 60 * 1000; // Fallback: 24h
}

export function getNextScheduleDate(time: string, days: string[]): Date {
    const ms = getNextScheduleMs(time, days);
    return new Date(Date.now() + ms);
}

function scheduleNextRun(automation: Automation) {
    if (automation.trigger.type !== "schedule" || !automation.enabled) return;
    clearTimer(automation.id!);

    const trigger = automation.trigger;
    const ms = getNextScheduleMs(trigger.time, trigger.days);

    const timeout = setTimeout(() => {
        activeTimers.delete(automation.id!);
        if (!automation.enabled) return;

        if (automation.conditions.length > 0 && !evaluateConditions(automation.conditions)) {
            console.log(`[automations] "${automation.name}" conditions not met, skipping`);
        } else {
            runAutomation(automation);
        }

        // Schedule next run (unless one-shot that got disabled)
        if (automation.enabled) {
            scheduleNextRun(automation);
        }
    }, ms);

    activeTimers.set(automation.id!, timeout);
    console.log(`[automations] Schedule set: "${automation.name}" in ${Math.round(ms / 1000)}s`);
}

// --- Device state trigger ---

function handleDeviceStateChange(ieeeAddress: string, changedKeys: string[], state: Record<string, any>) {
    for (const automation of automationsCache) {
        if (!automation.enabled) continue;
        if (automation.trigger.type !== "device_state") continue;

        const trigger = automation.trigger;
        if (trigger.ieeeAddress !== ieeeAddress) continue;
        if (!changedKeys.includes(trigger.property)) continue;

        const newValue = state[trigger.property];

        switch (trigger.operator) {
            case "changed":
                break;
            case "changed_to":
                if (newValue !== trigger.value) continue;
                break;
            case "changed_from":
                continue; // Not supported without previous value tracking
            case "above":
                if (!(typeof newValue === "number" && newValue > (trigger.value as number))) continue;
                break;
            case "below":
                if (!(typeof newValue === "number" && newValue < (trigger.value as number))) continue;
                break;
        }

        if (automation.conditions.length > 0 && !evaluateConditions(automation.conditions)) {
            console.log(`[automations] "${automation.name}" conditions not met, skipping`);
            continue;
        }

        runAutomation(automation);
    }
}

// --- Initialize ---

export function initAutomations() {
    onStateChange(handleDeviceStateChange);

    // Restore active timers and schedules
    for (const automation of automationsCache) {
        if (!automation.enabled) continue;
        if (automation.trigger.type === "timer") {
            restoreTimer(automation);
        } else if (automation.trigger.type === "schedule") {
            scheduleNextRun(automation);
        }
    }

    console.log("[automations] Engine initialized");
}
