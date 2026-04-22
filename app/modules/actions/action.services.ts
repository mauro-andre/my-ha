import type { Action } from "./action.schemas.js";
import { getDeviceByIeee } from "../devices/device.services.js";
import { sendIrCode } from "../ir-devices/ir-device.services.js";
import { publish } from "../../mqtt/client.js";

// Spacing between actions prevents Zigbee radio congestion when running
// scenes/automations that fan out to many devices. Without it, commands
// to devices at the edge of range are frequently dropped.
// Tune via ACTION_SPACING_MS env var; default is 500ms.
const ACTION_SPACING_MS = (() => {
    const raw = Number(process.env["ACTION_SPACING_MS"]);
    return Number.isFinite(raw) && raw >= 0 ? raw : 500;
})();

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function runSingleAction(action: Action) {
    if (action.type === "device_command") {
        const device = getDeviceByIeee(action.ieeeAddress);
        if (device) {
            publish(`zigbee2mqtt/${device.friendlyName}/set`, {
                [action.property]: action.value,
            });
        }
    } else if (action.type === "ir_command") {
        sendIrCode(action.blasterIeee, action.code);
    }
}

export async function runActions(actions: Action[]) {
    for (let i = 0; i < actions.length; i++) {
        if (i > 0) await sleep(ACTION_SPACING_MS);
        runSingleAction(actions[i]!);
    }
}
