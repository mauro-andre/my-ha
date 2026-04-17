import { Link } from "@mauroandre/velojs";
import { useLoader } from "@mauroandre/velojs/hooks";
import type { LoaderArgs, ActionArgs } from "@mauroandre/velojs";
import { useCallback, useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { ArrowLeft, Chip, Pencil } from "../components/icons.js";
import { DeviceControl } from "../components/controls/DeviceControl.js";
import { Select } from "../components/Select.js";
import { getIcon } from "../components/icon-registry.js";
import { useDeviceEvents } from "../hooks/useDeviceEvents.js";
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
        displayLabels: Record<string, string>;
        areaId: string | null;
    } | null;
    areas: Array<{ id: string; name: string; icon: string | null }>;
}

export const loader = async ({ c }: LoaderArgs) => {
    const ieee = c.req.param("ieee");
    const { getDeviceByIeee } = await import("../modules/devices/device.services.js");
    const { getAllAreas } = await import("../modules/areas/area.services.js");
    const device = getDeviceByIeee(ieee ?? "");

    const areas = getAllAreas().map((a) => ({ id: a.id!, name: a.name, icon: a.icon ?? null }));

    if (!device) return { device: null, areas } satisfies DeviceData;

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
            displayLabels: device.displayLabels ?? {},
            areaId: device.areaId ?? null,
        },
        areas,
    } satisfies DeviceData;
};

export const action_rename = async ({ body }: ActionArgs<{ ieee: string; newName: string }>) => {
    const { renameDevice } = await import("../modules/devices/device.services.js");
    renameDevice(body.ieee, body.newName);
    return { ok: true };
};

export const action_setArea = async ({ body }: ActionArgs<{ ieee: string; areaId: string }>) => {
    const { setDeviceArea } = await import("../modules/devices/device.services.js");
    await setDeviceArea(body.ieee, body.areaId || null);
    return { ok: true };
};

export const action_setLabel = async ({ body }: ActionArgs<{ ieee: string; property: string; label: string }>) => {
    const { setDisplayLabel } = await import("../modules/devices/device.services.js");
    await setDisplayLabel(body.ieee, body.property, body.label);
    return { ok: true };
};

export const action_command = async ({ body }: ActionArgs<{ ieee: string; property: string; value: unknown }>) => {
    const { sendDeviceCommand } = await import("../modules/devices/device.services.js");
    sendDeviceCommand(body.ieee, { [body.property]: body.value });
    return { ok: true };
};

function resolveLabel(cap: GenericCapability, displayLabels: Record<string, string>): string {
    if (displayLabels[cap.property]) return displayLabels[cap.property]!;
    if (cap.endpoint) return `${cap.label} ${cap.endpoint.toUpperCase()}`;
    return cap.label;
}

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

    useDeviceEvents(useCallback((ieeeAddress, _state) => {
        if (data.value?.device?.ieeeAddress === ieeeAddress) {
            refetch();
        }
    }, [refetch]));

    if (!data.value) return null;

    const { device, areas } = data.value;

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
    const editingLabel = useSignal<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const labelInputRef = useRef<HTMLInputElement>(null);

    const handleCommand = useCallback(async (property: string, value: unknown) => {
        await action_command({ body: { ieee: device.ieeeAddress, property, value } });
    }, [device.ieeeAddress]);

    const handleAreaChange = useCallback(async (areaId: string) => {
        await action_setArea({ body: { ieee: device.ieeeAddress, areaId } });
        refetch();
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

    const startEditingLabel = useCallback((property: string, currentLabel: string) => {
        editingLabel.value = property;
        setTimeout(() => {
            if (labelInputRef.current) {
                labelInputRef.current.value = currentLabel;
                labelInputRef.current.focus();
                labelInputRef.current.select();
            }
        }, 0);
    }, []);

    const confirmLabelRename = useCallback(async () => {
        const property = editingLabel.value;
        if (!property) return;
        const newLabel = labelInputRef.current?.value.trim();
        if (!newLabel) {
            editingLabel.value = null;
            return;
        }
        await action_setLabel({ body: { ieee: device.ieeeAddress, property, label: newLabel } });
        editingLabel.value = null;
        refetch();
    }, [device.ieeeAddress, refetch]);

    const handleLabelKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Enter") confirmLabelRename();
        if (e.key === "Escape") editingLabel.value = null;
    }, [confirmLabelRename]);

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
                        {settable.map((cap) => {
                            const label = resolveLabel(cap, device.displayLabels);
                            return (
                                <div key={cap.property} class={css.controlWrapper}>
                                    <DeviceControl
                                        capability={cap}
                                        label={label}
                                        value={device.state[cap.property]}
                                        ieeeAddress={device.ieeeAddress}
                                        onCommand={handleCommand}
                                    />
                                    {editingLabel.value === cap.property ? (
                                        <input
                                            ref={labelInputRef}
                                            class={css.nameInput}
                                            onKeyDown={handleLabelKeyDown}
                                            onBlur={() => confirmLabelRename()}
                                        />
                                    ) : (
                                        <button class={css.editNameButton} onClick={() => startEditingLabel(cap.property, label)}>
                                            <Pencil size={14} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div class={css.section}>
                <h2 class={css.sectionTitle}>Info</h2>
                <div class={css.infoGrid}>
                    <div class={css.infoCard}>
                        <span class={css.infoLabel}>Area</span>
                        <Select
                            options={[
                                { value: "", label: "No area" },
                                ...areas.map((a) => ({
                                    value: a.id,
                                    label: a.name,
                                    icon: a.icon ? getIcon(a.icon) ?? undefined : undefined,
                                })),
                            ]}
                            value={device.areaId ?? ""}
                            onChange={handleAreaChange}
                            size="small"
                        />
                    </div>
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
