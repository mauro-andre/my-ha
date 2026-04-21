import { createEventStream } from "@mauroandre/velojs";

export interface DeviceStateChange {
    ieeeAddress: string;
    changedKeys: string[];
    state: Record<string, any>;
}

export const deviceStateStream = createEventStream<DeviceStateChange>({
    path: "/api/devices/events",
    broadcast: true,
    source: async (emit, { abortSignal }) => {
        const { onStateChange } = await import("./device.services.js");
        const unsubscribe = onStateChange((ieeeAddress, changedKeys, state) => {
            emit({ ieeeAddress, changedKeys, state });
        });
        abortSignal.addEventListener("abort", () => unsubscribe());
        await new Promise<void>((resolve) => {
            abortSignal.addEventListener("abort", () => resolve());
        });
    },
});
