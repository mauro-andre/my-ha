import { Link } from "@mauroandre/velojs";
import { useLoader, useNavigate } from "@mauroandre/velojs/hooks";
import type { LoaderArgs, ActionArgs } from "@mauroandre/velojs";
import { useCallback } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { ArrowLeft, Play, X } from "../components/icons.js";
import { Select } from "../components/Select.js";
import { IconPicker } from "../components/IconPicker.js";
import { ConfirmModal } from "../components/ConfirmModal.js";
import { ActionsEditor } from "../components/ActionsEditor.js";
import { getIcon } from "../components/icon-registry.js";
import type { DeviceOption, IrDeviceOption } from "../components/ActionsEditor.js";
import type { Action } from "../modules/actions/action.schemas.js";
import * as Scenes from "./Scenes.js";
import * as css from "./SceneEdit.css.js";

interface SceneEditData {
    scene: {
        id: string;
        name: string;
        icon: string | null;
        areaId: string | null;
        actions: Action[];
    } | null;
    areas: Array<{ id: string; name: string; icon: string | null }>;
    devices: DeviceOption[];
    irDevices: IrDeviceOption[];
}

export const loader = async ({ c }: LoaderArgs) => {
    const id = c.req.param("id");
    const { getAllDevices } = await import("../modules/devices/device.services.js");
    const { getAllIrDevices } = await import("../modules/ir-devices/ir-device.services.js");
    const { getAllAreas } = await import("../modules/areas/area.services.js");

    const allDevices = getAllDevices();
    const allIrDevices = await getAllIrDevices();
    const allAreas = getAllAreas();

    const devices: DeviceOption[] = allDevices.map((d) => {
        const properties: DeviceOption["properties"] = [];
        for (const cap of d.capabilities) {
            if ("features" in cap) {
                for (const f of cap.features) {
                    if ((f.access & 2) && !f.category) {
                        properties.push({ property: f.property, kind: f.kind, label: f.label, endpoint: f.endpoint, valueOn: f.valueOn, valueOff: f.valueOff, values: f.values });
                    }
                }
            } else if ((cap.access & 2) && !cap.category) {
                properties.push({ property: cap.property, kind: cap.kind, label: cap.label, endpoint: cap.endpoint, valueOn: cap.valueOn, valueOff: cap.valueOff, values: cap.values });
            }
        }
        return { ieeeAddress: d.ieeeAddress, friendlyName: d.friendlyName, displayLabels: d.displayLabels ?? {}, properties };
    }).filter((d) => d.properties.length > 0);

    const irDevices: IrDeviceOption[] = allIrDevices
        .filter((ir) => ir.commands.length > 0)
        .map((ir) => ({
            id: ir.id!,
            name: ir.name,
            commands: ir.commands.map((cmd) => ({
                name: cmd.name,
                blasterIeee: cmd.blasterIeee,
                code: cmd.code,
            })),
        }));

    const areas = allAreas.map((a) => ({ id: a.id!, name: a.name, icon: a.icon ?? null }));

    let scene: SceneEditData["scene"] = null;
    if (id && id !== "new") {
        const { getScene } = await import("../modules/scenes/scene.services.js");
        const s = await getScene(id);
        if (s) {
            scene = {
                id: s.id!,
                name: s.name,
                icon: s.icon ?? null,
                areaId: s.area?.id ?? null,
                actions: s.actions,
            };
        }
    }

    return { scene, areas, devices, irDevices } satisfies SceneEditData;
};

export const action_save = async ({ body }: ActionArgs<{
    id?: string;
    name: string;
    icon: string | null;
    areaId: string | null;
    actions: Action[];
}>) => {
    if (body.id) {
        const { getScene, updateScene } = await import("../modules/scenes/scene.services.js");
        const { getArea } = await import("../modules/areas/area.services.js");
        const scene = await getScene(body.id);
        if (!scene) return { error: "Not found" };
        scene.name = body.name;
        scene.icon = body.icon;
        scene.area = body.areaId ? await getArea(body.areaId) : null;
        scene.actions = body.actions;
        await updateScene(scene);
        return { ok: true };
    } else {
        const { createScene } = await import("../modules/scenes/scene.services.js");
        const scene = await createScene({
            name: body.name,
            icon: body.icon,
            areaId: body.areaId,
            actions: body.actions,
        });
        return { ok: true, id: scene.id };
    }
};

export const action_delete = async ({ body }: ActionArgs<{ id: string }>) => {
    const { deleteScene } = await import("../modules/scenes/scene.services.js");
    await deleteScene(body.id);
    return { ok: true };
};

export const action_run = async ({ body }: ActionArgs<{ id: string }>) => {
    const { runScene } = await import("../modules/scenes/scene.services.js");
    await runScene(body.id);
    return { ok: true };
};

export const Component = () => {
    const { data } = useLoader<SceneEditData>();
    const navigate = useNavigate();

    if (!data.value) return null;

    const { scene, areas, devices, irDevices } = data.value;

    const name = useSignal(scene?.name ?? "");
    const icon = useSignal<string | null>(scene?.icon ?? null);
    const areaId = useSignal<string>(scene?.areaId ?? "");
    const actions = useSignal<Action[]>(scene?.actions ?? []);
    const deleteOpen = useSignal(false);

    const handleSave = useCallback(async () => {
        if (!name.value.trim()) return;

        const result = await action_save({
            body: {
                id: scene?.id,
                name: name.value.trim(),
                icon: icon.value,
                areaId: areaId.value || null,
                actions: actions.value,
            },
        });

        if (scene?.id) {
            navigate("/scenes");
        } else if (result && typeof result === "object" && "id" in result && result.id) {
            navigate(`/scenes/${result.id}`);
        }
    }, [scene]);

    const handleRun = useCallback(async () => {
        if (!scene?.id) return;
        await action_run({ body: { id: scene.id } });
    }, [scene]);

    const handleConfirmDelete = useCallback(async () => {
        if (!scene?.id) return;
        await action_delete({ body: { id: scene.id } });
        navigate("/scenes");
    }, [scene]);

    return (
        <div>
            <Link to={Scenes} class={css.backLink}>
                <ArrowLeft size={16} />
                Back to scenes
            </Link>

            <h1 class={css.pageTitle}>{scene ? "Edit Scene" : "New Scene"}</h1>

            <div class={css.inputGroup}>
                <label class={css.inputLabel}>Name</label>
                <input
                    class={css.input}
                    value={name.value}
                    onInput={(e) => { name.value = (e.target as HTMLInputElement).value; }}
                    placeholder="e.g. Movie mode"
                />
            </div>

            <div class={css.inputGroup}>
                <label class={css.inputLabel}>Icon</label>
                <IconPicker
                    value={icon.value ?? undefined}
                    onChange={(v) => { icon.value = v; }}
                    placeholder="Select icon..."
                />
            </div>

            <div class={css.inputGroup}>
                <label class={css.inputLabel}>Area</label>
                <Select
                    options={[
                        { value: "", label: "No area" },
                        ...areas.map((a) => ({
                            value: a.id,
                            label: a.name,
                            icon: a.icon ? getIcon(a.icon) ?? undefined : undefined,
                        })),
                    ]}
                    value={areaId.value}
                    onChange={(v) => { areaId.value = v; }}
                    size="small"
                />
            </div>

            <div class={css.section}>
                <h2 class={css.sectionTitle}>Actions</h2>
                <ActionsEditor actions={actions} devices={devices} irDevices={irDevices} />
            </div>

            <div class={css.actionsRow}>
                <button class={css.saveButton} onClick={handleSave}>
                    {scene ? "Save" : "Create"}
                </button>
                {scene && (
                    <button class={css.runButton} onClick={handleRun}>
                        <Play size={16} />
                        Run now
                    </button>
                )}
                {scene && (
                    <button class={css.deleteButton} onClick={() => { deleteOpen.value = true; }}>
                        <X size={16} />
                        Delete
                    </button>
                )}
            </div>

            {deleteOpen.value && (
                <ConfirmModal
                    title="Delete scene"
                    message="Are you sure you want to delete this scene?"
                    confirmLabel="Delete"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => { deleteOpen.value = false; }}
                />
            )}
        </div>
    );
};
