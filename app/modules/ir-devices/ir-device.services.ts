import { irDeviceSchema } from "./ir-device.schemas.js";
import type { IrDevice, IrCommand } from "./ir-device.schemas.js";
import * as repo from "./ir-device.repository.js";
import { publish } from "../../mqtt/client.js";
import { getDeviceByIeee } from "../devices/device.services.js";

// --- CRUD ---

export async function createIrDevice(name: string, blasters: string[]) {
    const device = irDeviceSchema.parse({
        id: null,
        createdAt: null,
        updatedAt: null,
        name,
        blasters,
        commands: [],
    });

    await repo.saveIrDevice(device);
    return device;
}

export async function getIrDevice(id: string) {
    return repo.findIrDeviceById(id);
}

export async function getAllIrDevices() {
    return repo.findAllIrDevices();
}

export async function deleteIrDevice(id: string) {
    return repo.deleteIrDevice(id);
}

export async function updateIrDevice(device: IrDevice) {
    await repo.saveIrDevice(device);
}

// --- Commands ---

export async function addCommand(deviceId: string, command: IrCommand) {
    const device = await repo.findIrDeviceById(deviceId);
    if (!device) return null;

    device.commands.push(command);
    await repo.saveIrDevice(device);
    return device;
}

export async function removeCommand(deviceId: string, commandIndex: number) {
    const device = await repo.findIrDeviceById(deviceId);
    if (!device) return null;

    device.commands.splice(commandIndex, 1);
    await repo.saveIrDevice(device);
    return device;
}

// --- IR actions ---

export function sendIrCode(blasterIeee: string, code: string) {
    const blaster = getDeviceByIeee(blasterIeee);
    if (!blaster) {
        console.log(`[ir] Blaster ${blasterIeee} not found`);
        return;
    }

    publish(`zigbee2mqtt/${blaster.friendlyName}/set`, {
        ir_code_to_send: code,
    });

    console.log(`[ir] Code sent via ${blaster.friendlyName}`);
}

export function startLearning(blasterIeee: string) {
    const blaster = getDeviceByIeee(blasterIeee);
    if (!blaster) {
        console.log(`[ir] Blaster ${blasterIeee} not found`);
        return;
    }

    publish(`zigbee2mqtt/${blaster.friendlyName}/set`, {
        learn_ir_code: "ON",
    });

    console.log(`[ir] Learning mode started on ${blaster.friendlyName}`);
}

export function getLearnedCode(blasterIeee: string): string | null {
    const blaster = getDeviceByIeee(blasterIeee);
    if (!blaster) return null;

    return blaster.state["learned_ir_code"] ?? null;
}
