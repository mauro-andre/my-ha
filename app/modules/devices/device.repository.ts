import { save, findMany, deleteMany } from "@mauroandre/zodmongo";
import type { Device } from "./device.schemas.js";

const COLLECTION = "devices";

export async function saveDevice(device: Device) {
    await save(COLLECTION, device);
}

export async function findAllDevices() {
    return findMany<Device>(COLLECTION);
}

export async function findDeviceByIeee(ieeeAddress: string) {
    const results = await findMany<Device>(COLLECTION, { ieeeAddress });
    return results[0] ?? null;
}

export async function findDeviceByFriendlyName(friendlyName: string) {
    const results = await findMany<Device>(COLLECTION, { friendlyName });
    return results[0] ?? null;
}

export async function findDevicesByArea(areaId: string) {
    return findMany<Device>(COLLECTION, { areaId });
}

export async function deleteDevice(ieeeAddress: string) {
    return deleteMany(COLLECTION, { ieeeAddress });
}
