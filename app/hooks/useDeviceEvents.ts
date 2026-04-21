import { useEventStream } from "@mauroandre/velojs/hooks";
import { useSignalEffect } from "@preact/signals";
import { deviceStateStream } from "../modules/devices/device.stream.js";

export function useDeviceEvents(onStateChange: (ieeeAddress: string, state: Record<string, any>) => void) {
    const { data } = useEventStream(deviceStateStream);

    useSignalEffect(() => {
        const change = data.value;
        if (change) onStateChange(change.ieeeAddress, change.state);
    });
}
