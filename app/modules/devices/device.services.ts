import fs from "node:fs";
import path from "node:path";
import { deviceSchema } from "./device.schemas.js";
import type { Device, Capability, DeviceCategory, GenericCapability, SpecificCapability } from "./device.schemas.js";
import * as repo from "./device.repository.js";
import { publish } from "../../mqtt/client.js";

const IMAGES_DIR = path.resolve("data/images/devices");
const Z2M_CDN = "https://www.zigbee2mqtt.io/images/devices";

// --- In-memory cache for fast access ---

const devicesByIeee = new Map<string, Device>();
const devicesByName = new Map<string, Device>();

export function getDeviceByIeee(ieeeAddress: string) {
    return devicesByIeee.get(ieeeAddress) ?? null;
}

export function getDeviceByName(friendlyName: string) {
    return devicesByName.get(friendlyName) ?? null;
}

export function getAllDevices() {
    return Array.from(devicesByIeee.values());
}

// --- Sync from bridge/devices (discovery) ---

export async function syncDevices(z2mDevices: any[]) {
    const currentIeees = new Set<string>();
    const devices: Device[] = [];

    for (const raw of z2mDevices) {
        if (raw.type === "Coordinator") continue;

        const ieeeAddress = raw.ieee_address;
        currentIeees.add(ieeeAddress);

        const capabilities = parseExposes(raw.definition?.exposes ?? []);
        const category = inferCategory(capabilities);

        const existing = devicesByIeee.get(ieeeAddress);

        const device = deviceSchema.parse({
            id: existing?.id ?? null,
            createdAt: existing?.createdAt ?? null,
            updatedAt: existing?.updatedAt ?? null,
            ieeeAddress,
            friendlyName: raw.friendly_name,
            vendor: raw.definition?.vendor ?? "Unknown",
            model: raw.definition?.model ?? "Unknown",
            description: raw.definition?.description ?? "",
            powerSource: parsePowerSource(raw.power_source),
            type: raw.type,
            capabilities,
            category,
            state: existing?.state ?? {},
            availability: existing?.availability ?? "offline",
            areaId: existing?.areaId,
            displayName: existing?.displayName,
            icon: existing?.icon,
            order: existing?.order,
            hidden: existing?.hidden,
        });

        cacheDevice(device);
        devices.push(device);
    }

    // Remove devices no longer in Z2M
    for (const [ieee, device] of devicesByIeee) {
        if (!currentIeees.has(ieee)) {
            devicesByIeee.delete(ieee);
            devicesByName.delete(device.friendlyName);
        }
    }

    console.log(`[devices] ${currentIeees.size} devices synced`);

    // Request current state from Z2M for each device
    for (const device of devices) {
        requestDeviceState(device);
    }

    // Persist to DB after caching (doesn't block subsequent message processing)
    for (const device of devices) {
        await repo.saveDevice(device);
    }

    // Download device images in background (don't block sync)
    const models = new Set(devices.map((d) => d.model));
    for (const model of models) {
        ensureDeviceImage(model);
    }
}

// --- State updates ---

export async function updateDeviceState(friendlyName: string, newState: Record<string, any>) {
    const device = devicesByName.get(friendlyName);
    if (!device) return;

    const before = { ...device.state };
    device.state = { ...device.state, ...newState };

    await repo.saveDevice(device);

    const changedKeys = Object.keys(newState).filter(
        (key) => JSON.stringify(before[key]) !== JSON.stringify(newState[key])
    );

    if (changedKeys.length > 0) {
        console.log(`[device] ${friendlyName} → ${changedKeys.map((k) => `${k}: ${JSON.stringify(newState[k])}`).join(", ")}`);
    }
}

// --- Availability updates ---

export async function updateDeviceAvailability(friendlyName: string, availability: "online" | "offline") {
    const device = devicesByName.get(friendlyName);
    if (!device) return;

    if (device.availability === availability) return;

    device.availability = availability;
    await repo.saveDevice(device);

    console.log(`[availability] ${friendlyName} → ${availability}`);
}

// --- Initial load from DB ---

export async function loadDevicesFromDb() {
    const devices = await repo.findAllDevices();
    for (const device of devices) {
        cacheDevice(device);
    }
    console.log(`[devices] ${devices.length} devices loaded from DB`);
}

// --- Request state ---

function requestDeviceState(device: Device) {
    const gettableProperties = getGettableProperties(device.capabilities);
    if (gettableProperties.length === 0) return;

    const payload: Record<string, string> = {};
    for (const property of gettableProperties) {
        payload[property] = "";
    }

    publish(`zigbee2mqtt/${device.friendlyName}/get`, payload);
}

function getGettableProperties(capabilities: Capability[]): string[] {
    const properties: string[] = [];

    for (const cap of capabilities) {
        if ("features" in cap) {
            for (const feature of cap.features) {
                if ((feature.access & 4) && !feature.category) {
                    properties.push(feature.property);
                }
            }
        } else {
            if ((cap.access & 4) && !cap.category) {
                properties.push(cap.property);
            }
        }
    }

    return properties;
}

// --- Device images ---

async function ensureDeviceImage(model: string) {
    const filePath = path.join(IMAGES_DIR, `${model}.png`);
    if (fs.existsSync(filePath)) return;

    try {
        const url = `${Z2M_CDN}/${encodeURIComponent(model)}.png`;
        const response = await fetch(url, { redirect: "follow" });

        if (!response.ok) {
            console.log(`[images] Failed to download ${model}: ${response.status}`);
            return;
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        fs.mkdirSync(IMAGES_DIR, { recursive: true });
        fs.writeFileSync(filePath, buffer);
        console.log(`[images] Downloaded ${model}`);
    } catch (err) {
        console.log(`[images] Error downloading ${model}: ${(err as Error).message}`);
    }
}

export function getDeviceImagePath(model: string): string | null {
    const filePath = path.join(IMAGES_DIR, `${model}.png`);
    return fs.existsSync(filePath) ? filePath : null;
}

// --- Internal helpers ---

function cacheDevice(device: Device) {
    devicesByIeee.set(device.ieeeAddress, device);
    devicesByName.set(device.friendlyName, device);
}

function parsePowerSource(raw?: string): "mains" | "battery" | "dc" | "unknown" {
    if (!raw) return "unknown";
    const lower = raw.toLowerCase();
    if (lower.includes("mains")) return "mains";
    if (lower.includes("battery")) return "battery";
    if (lower.includes("dc")) return "dc";
    return "unknown";
}

function inferCategory(capabilities: Capability[]): DeviceCategory {
    for (const cap of capabilities) {
        if ("features" in cap) {
            if (cap.kind === "light") return "light";
            if (cap.kind === "switch") return "switch";
            if (cap.kind === "climate") return "climate";
            if (cap.kind === "cover") return "cover";
            if (cap.kind === "lock") return "lock";
            if (cap.kind === "fan") return "fan";
        }
    }

    const generics = capabilities.filter((c) => !("features" in c)) as GenericCapability[];
    if (generics.some((c) => c.name === "action")) return "button";
    if (generics.some((c) => c.name === "occupancy")) return "sensor";
    if (generics.some((c) => c.name === "temperature" || c.name === "humidity")) return "sensor";
    if (generics.some((c) => c.name === "contact")) return "sensor";
    if (generics.some((c) => c.name === "illuminance")) return "sensor";

    return "unknown";
}

function parseExposes(exposes: any[]): Capability[] {
    const capabilities: Capability[] = [];

    for (const expose of exposes) {
        const type = expose.type;

        // Specific types (light, switch, climate, etc.)
        if (["light", "switch", "fan", "cover", "lock", "climate"].includes(type)) {
            const specific: SpecificCapability = {
                kind: type,
                endpoint: expose.endpoint,
                features: (expose.features ?? []).map(parseGenericCapability),
            };
            capabilities.push(specific);
            continue;
        }

        // Generic types
        if (["binary", "numeric", "enum", "text", "composite"].includes(type)) {
            capabilities.push(parseGenericCapability(expose));
        }
    }

    return capabilities;
}

function parseGenericCapability(raw: any): GenericCapability {
    return {
        kind: raw.type,
        name: raw.name,
        label: raw.label ?? raw.name,
        property: raw.property,
        access: raw.access ?? 1,
        category: raw.category,
        endpoint: raw.endpoint,
        valueOn: raw.value_on,
        valueOff: raw.value_off,
        valueToggle: raw.value_toggle,
        valueMin: raw.value_min,
        valueMax: raw.value_max,
        valueStep: raw.value_step,
        unit: raw.unit,
        values: raw.values,
    };
}
