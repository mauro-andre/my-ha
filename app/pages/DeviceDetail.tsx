import { Link } from "@mauroandre/velojs";
import { useLoader } from "@mauroandre/velojs/hooks";
import type { LoaderArgs, ActionArgs } from "@mauroandre/velojs";
import { useCallback, useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { ArrowLeft, Chip, Pencil } from "../components/icons.js";
import { DeviceControl } from "../components/controls/DeviceControl.js";
import type { GenericCapability } from "../modules/devices/device.schemas.js";
import * as Devices from "./Devices.js";
import * as css from "./DeviceDetail.css.js";

interface CapabilityData {
    kind: string;
    endpoint?: string | null;
    features?: GenericCapability[];
    // GenericCapability fields
    name?: string;
    label?: string;
    property?: string;
    access?: number;
    category?: string | null;
    valueOn?: unknown;
    valueOff?: unknown;
    valueToggle?: string | null;
    valueMin?: number | null;
    valueMax?: number | null;
    valueStep?: number | null;
    unit?: string | null;
    values?: string[] | null;
}

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
        capabilities: CapabilityData[];
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
            capabilities: device.capabilities,
        },
    } satisfies DeviceData;
};

export const action_rename = async ({ body }: ActionArgs<{ ieee: string; newName: string }>) => {
    const { renameDevice } = await import("../modules/devices/device.services.js");
    renameDevice(body.ieee, body.newName);
    return { ok: true };
};

export const action_command = async ({ body }: ActionArgs<{ ieee: string; property: string; value: unknown }>) => {
    const { sendDeviceCommand } = await import("../modules/devices/device.services.js");
    sendDeviceCommand(body.ieee, { [body.property]: body.value });
    return { ok: true };
};

function getSettableCapabilities(capabilities: CapabilityData[]): GenericCapability[] {
    const result: GenericCapability[] = [];

    for (const cap of capabilities) {
        if ("features" in cap && cap.features) {
            for (const feature of cap.features) {
                if ((feature.access & 2) && !feature.category) {
                    result.push(feature);
                }
            }
        } else if (cap.property && (cap.access ?? 0) & 2 && !cap.category) {
            result.push(cap as GenericCapability);
        }
    }

    return result;
}

export const Component = () => {
    const { data, refetch } = useLoader<DeviceData>();

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

    const settable = getSettableCapabilities(device.capabilities);
    const linkquality = device.state["linkquality"];
    const editing = useSignal(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleCommand = useCallback(async (property: string, value: unknown) => {
        await action_command({ body: { ieee: device.ieeeAddress, property, value } });
        setTimeout(() => refetch(), 500);
    }, [device.ieeeAddress, refetch]);

    const startEditing = useCallback(() => {
        editing.value = true;
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.value = device.friendlyName;
                inputRef.current.focus();
                inputRef.current.select();
            }
        }, 0);
    }, [device.friendlyName]);

    const confirmRename = useCallback(async () => {
        const newName = inputRef.current?.value.trim();
        if (!newName || newName === device.friendlyName) {
            editing.value = false;
            return;
        }
        await action_rename({ body: { ieee: device.ieeeAddress, newName } });
        editing.value = false;
        setTimeout(() => refetch(), 1000);
    }, [device.ieeeAddress, device.friendlyName, refetch]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Enter") confirmRename();
        if (e.key === "Escape") editing.value = false;
    }, [confirmRename]);

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
                    {editing.value ? (
                        <input
                            ref={inputRef}
                            class={css.nameInput}
                            onKeyDown={handleKeyDown}
                            onBlur={() => confirmRename()}
                        />
                    ) : (
                        <div class={css.nameRow}>
                            <span class={css.deviceName}>{device.friendlyName}</span>
                            <button class={css.editNameButton} onClick={startEditing}>
                                <Pencil size={16} />
                            </button>
                        </div>
                    )}
                    <span class={css.deviceMeta}>{device.model} · {device.vendor}</span>
                    <span class={css.deviceMeta}>{device.description}</span>
                </div>
            </div>

            {settable.length > 0 && (
                <div class={css.section}>
                    <h2 class={css.sectionTitle}>Controls</h2>
                    <div class={css.controlsGrid}>
                        {settable.map((cap) => (
                            <DeviceControl
                                key={cap.property}
                                capability={cap}
                                value={device.state[cap.property]}
                                onCommand={handleCommand}
                            />
                        ))}
                    </div>
                </div>
            )}

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
        </div>
    );
};
