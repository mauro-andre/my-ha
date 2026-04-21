import { Link } from "@mauroandre/velojs";
import { useLoader } from "@mauroandre/velojs/hooks";
import type { LoaderArgs } from "@mauroandre/velojs";
import { Chip, Pencil } from "../components/icons.js";
import * as css from "./Devices.css.js";

interface DeviceItem {
    ieeeAddress: string;
    friendlyName: string;
    vendor: string;
    model: string;
    category: string;
    areaName: string | null;
}

interface DevicesData {
    devices: DeviceItem[];
}

export const loader = async ({}: LoaderArgs) => {
    const { getAllDevices } = await import("../modules/devices/device.services.js");
    const { getAllAreas } = await import("../modules/areas/area.services.js");
    const areasById = new Map(getAllAreas().map((a) => [a.id, a.name]));
    const devices = getAllDevices().map((d) => ({
        ieeeAddress: d.ieeeAddress,
        friendlyName: d.friendlyName,
        vendor: d.vendor,
        model: d.model,
        category: d.category,
        areaName: d.areaId ? (areasById.get(d.areaId) ?? null) : null,
    }));
    return { devices } satisfies DevicesData;
};

export const Component = () => {
    const { data } = useLoader<DevicesData>();

    if (!data.value) return null;

    const { devices } = data.value;

    return (
        <div>
            <h1 class={css.pageTitle}>Devices</h1>
            <div class={css.list}>
                {devices.map((device) => (
                    <div key={device.ieeeAddress} class={css.card}>
                        <img
                            src={`/assets/devices/${device.model}.png`}
                            alt={device.model}
                            class={css.deviceImage}
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                                (e.target as HTMLImageElement).nextElementSibling?.removeAttribute("style");
                            }}
                        />
                        <div class={css.deviceImageFallback} style={{ display: "none" }}>
                            <Chip size={24} />
                        </div>
                        <div class={css.deviceInfo}>
                            <span class={css.deviceName}>{device.friendlyName}</span>
                            <span class={css.deviceMeta}>{device.model} · {device.vendor}</span>
                            <span class={css.deviceArea}>{device.areaName ?? "No area"}</span>
                        </div>
                        <Link to={`/devices/${device.ieeeAddress}`} class={css.editButton}>
                            <Pencil size={18} />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};
