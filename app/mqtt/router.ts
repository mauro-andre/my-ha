import { syncDevices, updateDeviceState, updateDeviceAvailability } from "../modules/devices/device.services.js";

const TOPIC_PREFIX = "zigbee2mqtt/";

let devicesReady = false;
const pendingMessages: Array<{ path: string; parsed: unknown }> = [];

function processPending() {
    for (const { path, parsed } of pendingMessages) {
        if (path.endsWith("/availability")) {
            const deviceName = path.replace("/availability", "");
            const state = (parsed as any).state;
            updateDeviceAvailability(deviceName, state);
        } else {
            updateDeviceState(path, parsed as Record<string, any>);
        }
    }
    pendingMessages.length = 0;
}

export function routeMessage(topic: string, payload: Buffer) {
    if (!topic.startsWith(TOPIC_PREFIX)) return;

    const path = topic.slice(TOPIC_PREFIX.length);
    let parsed: unknown;

    try {
        parsed = JSON.parse(payload.toString());
    } catch {
        return;
    }

    // Bridge topics
    if (path === "bridge/state") {
        const state = (parsed as any).state;
        console.log(`[bridge] Z2M ${state}`);
        return;
    }

    if (path === "bridge/info") {
        console.log("[bridge] Info received");
        return;
    }

    if (path === "bridge/devices") {
        syncDevices(parsed as any[]).then(() => {
            devicesReady = true;
            processPending();
        });
        return;
    }

    if (path === "bridge/groups") {
        const groups = parsed as any[];
        console.log(`[bridge] ${groups.length} groups`);
        return;
    }

    if (path === "bridge/event") {
        const event = parsed as any;
        console.log(`[bridge] Event: ${event.type} → ${event.data?.friendly_name ?? ""}`);
        return;
    }

    if (path === "bridge/logging") {
        const log = parsed as any;
        if (log.level === "error" || log.level === "warning") {
            console.log(`[bridge][${log.level}] ${log.message}`);
        }
        return;
    }

    if (path.startsWith("bridge/")) return;

    // Queue messages until device registry is ready
    if (!devicesReady) {
        pendingMessages.push({ path, parsed });
        return;
    }

    // Availability
    if (path.endsWith("/availability")) {
        const deviceName = path.replace("/availability", "");
        const state = (parsed as any).state;
        updateDeviceAvailability(deviceName, state);
        return;
    }

    // Device state
    updateDeviceState(path, parsed as Record<string, any>);
}
