import { useLoader } from "@mauroandre/velojs/hooks";
import type { LoaderArgs, ActionArgs } from "@mauroandre/velojs";
import { useCallback } from "preact/hooks";
import { DeviceControl } from "../components/controls/DeviceControl.js";
import { CommandControl } from "../components/controls/CommandControl.js";
import { QuickTimer } from "../components/QuickTimer.js";
import { useDeviceEvents } from "../hooks/useDeviceEvents.js";
import { getIcon } from "../components/icon-registry.js";
import { Play } from "../components/icons.js";
import type { GenericCapability } from "../modules/devices/device.schemas.js";
import * as css from "./Home.css.js";

interface ControlCapability {
    kind: string;
    name?: string;
    label?: string;
    property?: string;
    access?: number;
    category?: string | null;
    endpoint?: string | null;
    valueOn?: unknown;
    valueOff?: unknown;
    valueToggle?: string | null;
    valueMin?: number | null;
    valueMax?: number | null;
    valueStep?: number | null;
    unit?: string | null;
    values?: string[] | null;
    features?: ControlCapability[];
}

interface DeviceData {
    ieeeAddress: string;
    friendlyName: string;
    model: string;
    state: Record<string, any>;
    displayLabels: Record<string, string>;
    capabilities: ControlCapability[];
}

interface IrDeviceData {
    id: string;
    name: string;
    commands: Array<{ name: string; code: string; blasterIeee: string }>;
}

interface SceneData {
    id: string;
    name: string;
    icon: string | null;
}

interface AreaData {
    id: string;
    name: string;
    icon: string | null;
    devices: DeviceData[];
    irDevices: IrDeviceData[];
    scenes: SceneData[];
}

interface DashboardData {
    globalScenes: SceneData[];
    areas: AreaData[];
    unassigned: AreaData | null;
}

export const loader = async ({}: LoaderArgs) => {
    const { getAllDevices } = await import("../modules/devices/device.services.js");
    const { getAllAreas } = await import("../modules/areas/area.services.js");
    const { getAllIrDevices } = await import("../modules/ir-devices/ir-device.services.js");
    const { getAllScenes } = await import("../modules/scenes/scene.services.js");

    const allAreas = getAllAreas();
    const allDevices = getAllDevices();
    const allIrDevices = await getAllIrDevices();
    const allScenes = await getAllScenes();

    const scenesByArea = new Map<string, SceneData[]>();
    const globalScenes: SceneData[] = [];
    for (const s of allScenes) {
        const sceneData: SceneData = { id: s.id!, name: s.name, icon: s.icon ?? null };
        const areaId = s.area?.id;
        if (areaId) {
            const list = scenesByArea.get(areaId) ?? [];
            list.push(sceneData);
            scenesByArea.set(areaId, list);
        } else {
            globalScenes.push(sceneData);
        }
    }

    const areas: AreaData[] = allAreas.map((area) => ({
        id: area.id!,
        name: area.name,
        icon: area.icon ?? null,
        devices: allDevices
            .filter((d) => d.areaId === area.id)
            .map((d) => ({
                ieeeAddress: d.ieeeAddress,
                friendlyName: d.friendlyName,
                model: d.model,
                state: d.state,
                displayLabels: d.displayLabels ?? {},
                capabilities: d.capabilities,
            })),
        irDevices: allIrDevices
            .filter((d) => d.areaId === area.id)
            .map((d) => ({
                id: d.id!,
                name: d.name,
                commands: d.commands,
            })),
        scenes: scenesByArea.get(area.id!) ?? [],
    })).filter((a) => a.devices.length > 0 || a.irDevices.length > 0 || a.scenes.length > 0);

    const unassignedDevices = allDevices
        .filter((d) => !d.areaId)
        .map((d) => ({
            ieeeAddress: d.ieeeAddress,
            friendlyName: d.friendlyName,
            model: d.model,
            state: d.state,
            displayLabels: d.displayLabels ?? {},
            capabilities: d.capabilities,
        }));

    const unassignedIrDevices = allIrDevices
        .filter((d) => !d.areaId)
        .map((d) => ({
            id: d.id!,
            name: d.name,
            commands: d.commands,
        }));

    const unassigned: AreaData | null =
        (unassignedDevices.length > 0 || unassignedIrDevices.length > 0)
            ? { id: "__unassigned", name: "Unassigned", icon: null, devices: unassignedDevices, irDevices: unassignedIrDevices, scenes: [] }
            : null;

    return { globalScenes, areas, unassigned } satisfies DashboardData;
};

export const action_command = async ({ body }: ActionArgs<{ ieee: string; property: string; value: unknown }>) => {
    const { sendDeviceCommand } = await import("../modules/devices/device.services.js");
    sendDeviceCommand(body.ieee, { [body.property]: body.value });
    return { ok: true };
};

export const action_irSend = async ({ body }: ActionArgs<{ blasterIeee: string; code: string }>) => {
    const { sendIrCode } = await import("../modules/ir-devices/ir-device.services.js");
    sendIrCode(body.blasterIeee, body.code);
    return { ok: true };
};

export const action_runScene = async ({ body }: ActionArgs<{ id: string }>) => {
    const { runScene } = await import("../modules/scenes/scene.services.js");
    await runScene(body.id);
    return { ok: true };
};

function getSettableCapabilities(capabilities: ControlCapability[]): GenericCapability[] {
    const result: GenericCapability[] = [];
    for (const cap of capabilities) {
        if ("features" in cap && cap.features) {
            for (const feature of cap.features) {
                if ((feature.access ?? 0) & 2 && !feature.category) {
                    result.push(feature as GenericCapability);
                }
            }
        } else if (cap.property && (cap.access ?? 0) & 2 && !cap.category) {
            result.push(cap as GenericCapability);
        }
    }
    return result;
}

function resolveLabel(cap: GenericCapability, displayLabels: Record<string, string>): string {
    if (displayLabels[cap.property]) return displayLabels[cap.property]!;
    if (cap.endpoint) return `${cap.label} ${cap.endpoint.toUpperCase()}`;
    return cap.label;
}

export const Component = () => {
    const { data, refetch } = useLoader<DashboardData>();

    useDeviceEvents(useCallback((_ieee, _state) => {
        refetch();
    }, [refetch]));

    if (!data.value) return null;

    const { globalScenes, areas, unassigned } = data.value;

    const handleCommand = useCallback(async (ieee: string, property: string, value: unknown) => {
        await action_command({ body: { ieee, property, value } });
    }, []);

    const handleIrSend = useCallback(async (blasterIeee: string, code: string) => {
        await action_irSend({ body: { blasterIeee, code } });
    }, []);

    const handleRunScene = useCallback(async (id: string) => {
        await action_runScene({ body: { id } });
    }, []);

    const renderScene = (scene: SceneData) => {
        const Icon = scene.icon ? getIcon(scene.icon) ?? Play : Play;
        const timerKey = `scene:${scene.id}`;
        return (
            <CommandControl
                key={scene.id}
                label={scene.name}
                Icon={Icon}
                onFire={() => handleRunScene(scene.id)}
                timerKey={timerKey}
                modalExtra={
                    <QuickTimer
                        actionKey={timerKey}
                        valueOptions={[{ value: "Run", label: "Run" }]}
                        sceneId={scene.id}
                        label={scene.name}
                    />
                }
            />
        );
    };

    if (globalScenes.length === 0 && areas.length === 0 && !unassigned) {
        return (
            <div>
                <h1 class={css.pageTitle}>Dashboard</h1>
                <div class={css.emptyState}>
                    No devices yet. Add devices and assign them to areas to see them here.
                </div>
            </div>
        );
    }

    const renderArea = (area: AreaData) => {
        const AreaIcon = area.icon ? getIcon(area.icon) : null;

        return (
            <div key={area.id} class={css.areaSection}>
                <div class={css.areaHeader}>
                    {AreaIcon && (
                        <span class={css.areaIcon}>
                            <AreaIcon size={24} />
                        </span>
                    )}
                    <span class={css.areaName}>{area.name}</span>
                </div>

                {area.scenes.length > 0 && (
                    <div class={css.scenesRow}>
                        {area.scenes.map(renderScene)}
                    </div>
                )}

                {area.devices.map((device) => {
                    const settable = getSettableCapabilities(device.capabilities);
                    if (settable.length === 0) return null;

                    return (
                        <div key={device.ieeeAddress} class={css.deviceGroup}>
                            <div class={css.deviceHeader}>
                                <img
                                    src={`/assets/devices/${device.model}.png`}
                                    alt={device.model}
                                    class={css.deviceImage}
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                />
                                <span class={css.deviceName}>{device.friendlyName}</span>
                            </div>
                            <div class={css.controlsGrid}>
                                {settable.map((cap) => (
                                    <DeviceControl
                                        key={cap.property}
                                        capability={cap}
                                        label={resolveLabel(cap, device.displayLabels)}
                                        value={device.state[cap.property]}
                                        ieeeAddress={device.ieeeAddress}
                                        onCommand={(prop, val) => handleCommand(device.ieeeAddress, prop, val)}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}

                {area.irDevices.map((irDevice) => {
                    if (irDevice.commands.length === 0) return null;

                    return (
                        <div key={irDevice.id} class={css.deviceGroup}>
                            <div class={css.deviceHeader}>
                                <span class={css.deviceName}>{irDevice.name}</span>
                            </div>
                            <div class={css.controlsGrid}>
                                {irDevice.commands.map((cmd, i) => (
                                    <CommandControl
                                        key={i}
                                        label={cmd.name}
                                        onFire={() => handleIrSend(cmd.blasterIeee, cmd.code)}
                                        timerKey={`ir:${cmd.blasterIeee}:${cmd.code}`}
                                        modalExtra={
                                            <QuickTimer
                                                actionKey={`ir:${cmd.blasterIeee}:${cmd.code}`}
                                                valueOptions={[{ value: cmd.name, label: cmd.name }]}
                                                buildAction={() => ({
                                                    type: "ir_command",
                                                    blasterIeee: cmd.blasterIeee,
                                                    code: cmd.code,
                                                })}
                                                label={cmd.name}
                                            />
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div>
            <h1 class={css.pageTitle}>Dashboard</h1>
            {globalScenes.length > 0 && (
                <div class={css.globalScenes}>
                    <div class={css.scenesRow}>
                        {globalScenes.map(renderScene)}
                    </div>
                </div>
            )}
            {areas.map(renderArea)}
            {unassigned && renderArea(unassigned)}
        </div>
    );
};
