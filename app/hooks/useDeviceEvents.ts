import { useEventStream } from "@mauroandre/velojs/hooks";
import { useSignalEffect } from "@preact/signals";
import { useRef } from "preact/hooks";
import { deviceStateStream } from "../modules/devices/device.stream.js";
import type { DeviceStateChange } from "../modules/devices/device.stream.js";

export function useDeviceEvents(onStateChange: (ieeeAddress: string, state: Record<string, any>) => void) {
    const { data } = useEventStream(deviceStateStream);
    const lastProcessed = useRef<DeviceStateChange | null>(null);

    useSignalEffect(() => {
        const change = data.value;
        if (!change || change === lastProcessed.current) return;
        lastProcessed.current = change;
        onStateChange(change.ieeeAddress, change.state);
    });
}
