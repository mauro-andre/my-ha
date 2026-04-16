import { Link } from "@mauroandre/velojs";
import { useLoader, useParams } from "@mauroandre/velojs/hooks";
import type { LoaderArgs } from "@mauroandre/velojs";
import { ArrowLeft, Chip } from "../components/icons.js";
import * as Devices from "./Devices.js";
import * as css from "./DeviceDetail.css.js";

interface DeviceData {
    device: {
        ieeeAddress: string;
        friendlyName: string;
        vendor: string;
        model: string;
        description: string;
        powerSource: string;
        type: string;
        category: string;
        availability: string;
        state: Record<string, any>;
    } | null;
}

export const loader = async ({ c }: LoaderArgs) => {
    const ieee = c.req.param("ieee");
    const { getDeviceByIeee } = await import("../modules/devices/device.services.js");
    const device = getDeviceByIeee(ieee ?? "");

    if (!device) return { device: null } satisfies DeviceData;

    return {
        device: {
            ieeeAddress: device.ieeeAddress,
            friendlyName: device.friendlyName,
            vendor: device.vendor,
            model: device.model,
            description: device.description,
            powerSource: device.powerSource,
            type: device.type,
            category: device.category,
            availability: device.availability,
            state: device.state,
        },
    } satisfies DeviceData;
};

function formatStateValue(value: unknown): string {
    if (value === null || value === undefined) return "—";
    if (typeof value === "boolean") return value ? "ON" : "OFF";
    return String(value);
}

function isOnValue(value: unknown): boolean | null {
    if (value === "ON" || value === true) return true;
    if (value === "OFF" || value === false) return false;
    return null;
}

export const Component = () => {
    const { data } = useLoader<DeviceData>();

    if (!data.value) return null;

    const { device } = data.value;

    if (!device) {
        return (
            <div>
                <Link to={Devices} class={css.backLink}>
                    <ArrowLeft size={16} />
                    Back to devices
                </Link>
                <p>Device not found.</p>
            </div>
        );
    }

    const stateEntries = Object.entries(device.state).filter(
        ([key]) => key !== "linkquality"
    );
    const linkquality = device.state["linkquality"];

    return (
        <div>
            <Link to={Devices} class={css.backLink}>
                <ArrowLeft size={16} />
                Back to devices
            </Link>

            <div class={css.header}>
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
                    <Chip size={40} />
                </div>
                <div class={css.headerInfo}>
                    <span class={css.deviceName}>{device.friendlyName}</span>
                    <span class={css.deviceMeta}>{device.model} · {device.vendor}</span>
                    <span class={css.deviceMeta}>{device.description}</span>
                </div>
            </div>

            <div class={css.section}>
                <h2 class={css.sectionTitle}>Info</h2>
                <div class={css.infoGrid}>
                    <div class={css.infoCard}>
                        <span class={css.infoLabel}>IEEE Address</span>
                        <span class={css.infoValue}>{device.ieeeAddress}</span>
                    </div>
                    <div class={css.infoCard}>
                        <span class={css.infoLabel}>Category</span>
                        <span class={css.infoValue}>{device.category}</span>
                    </div>
                    <div class={css.infoCard}>
                        <span class={css.infoLabel}>Power Source</span>
                        <span class={css.infoValue}>{device.powerSource}</span>
                    </div>
                    <div class={css.infoCard}>
                        <span class={css.infoLabel}>Type</span>
                        <span class={css.infoValue}>{device.type}</span>
                    </div>
                    {linkquality != null && (
                        <div class={css.infoCard}>
                            <span class={css.infoLabel}>Link Quality</span>
                            <span class={css.infoValue}>{linkquality} / 255</span>
                        </div>
                    )}
                    <div class={css.infoCard}>
                        <span class={css.infoLabel}>Availability</span>
                        <span class={css.infoValue}>{device.availability}</span>
                    </div>
                </div>
            </div>

            {stateEntries.length > 0 && (
                <div class={css.section}>
                    <h2 class={css.sectionTitle}>State</h2>
                    <div class={css.stateGrid}>
                        {stateEntries.map(([key, value]) => {
                            const onOff = isOnValue(value);
                            return (
                                <div key={key} class={css.stateCard}>
                                    <span class={css.stateProperty}>{key}</span>
                                    <span class={`${css.stateValue} ${onOff === true ? css.badgeOn : onOff === false ? css.badgeOff : ""}`}>
                                        {formatStateValue(value)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
