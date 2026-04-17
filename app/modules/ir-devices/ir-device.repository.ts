import { save, findMany, deleteMany } from "@mauroandre/zodmongo";
import type { IrDevice } from "./ir-device.schemas.js";

const COLLECTION = "ir_devices";

export async function saveIrDevice(device: IrDevice) {
    await save(COLLECTION, device);
}

export async function findAllIrDevices() {
    return findMany<IrDevice>(COLLECTION);
}

export async function findIrDeviceById(id: string) {
    const results = await findMany<IrDevice>(COLLECTION, { id });
    return results[0] ?? null;
}

export async function deleteIrDevice(id: string) {
    return deleteMany(COLLECTION, { id });
}
