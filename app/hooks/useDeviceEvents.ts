import { useEffect } from "preact/hooks";

export function useDeviceEvents(onStateChange: (ieeeAddress: string, state: Record<string, any>) => void) {
    useEffect(() => {
        if (typeof window === "undefined") return;

        const es = new EventSource("/api/devices/events");

        es.addEventListener("state_change", (e) => {
            const data = JSON.parse(e.data);
            onStateChange(data.ieeeAddress, data.state);
        });

        return () => es.close();
    }, []);
}
