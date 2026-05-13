import { findMany, deleteMany, getDb } from "@mauroandre/zodmongo";
import { ObjectId } from "mongodb";
import type { Device } from "./device.schemas.js";

const COLLECTION = "devices";

export async function saveDevice(device: Device) {
    // WHY: zodmongo's save() upserts by _id only. syncDevices can fire
    // concurrently while Z2M republishes bridge/devices during a new device's
    // interview, leading to duplicate inserts before the in-memory cache catches
    // up. Upserting by ieeeAddress (the natural key) makes saves idempotent
    // regardless of cache state. A unique index on ieeeAddress (created in DB)
    // serializes concurrent upserts; in the rare race where two upserts both
    // miss the existing doc and try to insert, MongoDB raises E11000 — we catch
    // it and fall back to a plain update, which then hits the doc the first
    // insert just created.
    const db = getDb();
    const now = new Date();
    const { id, createdAt, updatedAt, ...rest } = device;

    try {
        const result = await db.collection(COLLECTION).findOneAndUpdate(
            { ieeeAddress: device.ieeeAddress },
            { $set: { ...rest, updatedAt: now }, $setOnInsert: { createdAt: now } },
            { upsert: true, returnDocument: "after" }
        );
        if (result && !device.id) device.id = (result._id as ObjectId).toString();
    } catch (err: any) {
        if (err?.code !== 11000) throw err;
        // E11000 duplicate key — another concurrent upsert won the insert race.
        // Plain update (no upsert) hits the existing doc.
        await db.collection(COLLECTION).updateOne(
            { ieeeAddress: device.ieeeAddress },
            { $set: { ...rest, updatedAt: now } }
        );
        if (!device.id) {
            const existing = await db.collection(COLLECTION).findOne({ ieeeAddress: device.ieeeAddress }, { projection: { _id: 1 } });
            if (existing) device.id = (existing._id as ObjectId).toString();
        }
    }
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
