import { Link } from "@mauroandre/velojs";
import { useLoader } from "@mauroandre/velojs/hooks";
import type { LoaderArgs, ActionArgs } from "@mauroandre/velojs";
import { useCallback } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { Plus, Pencil, X, Play } from "../components/icons.js";
import { ConfirmModal } from "../components/ConfirmModal.js";
import { getIcon } from "../components/icon-registry.js";
import * as SceneEdit from "./SceneEdit.js";
import * as css from "./Scenes.css.js";

interface SceneItem {
    id: string;
    name: string;
    icon: string | null;
    areaName: string | null;
    actionCount: number;
}

interface ScenesData {
    scenes: SceneItem[];
}

export const loader = async ({}: LoaderArgs) => {
    const { getAllScenes } = await import("../modules/scenes/scene.services.js");
    const scenes = await getAllScenes();

    return {
        scenes: scenes.map((s) => ({
            id: s.id!,
            name: s.name,
            icon: s.icon ?? null,
            areaName: s.area?.name ?? null,
            actionCount: s.actions.length,
        })),
    } satisfies ScenesData;
};

export const action_delete = async ({ body }: ActionArgs<{ id: string }>) => {
    const { deleteScene } = await import("../modules/scenes/scene.services.js");
    await deleteScene(body.id);
    return { ok: true };
};

export const Component = () => {
    const { data, refetch } = useLoader<ScenesData>();
    const deleteTarget = useSignal<string | null>(null);

    if (!data.value) return null;

    const { scenes } = data.value;

    const handleConfirmDelete = useCallback(async () => {
        if (!deleteTarget.value) return;
        await action_delete({ body: { id: deleteTarget.value } });
        deleteTarget.value = null;
        refetch();
    }, [refetch]);

    return (
        <div>
            <div class={css.header}>
                <h1 class={css.pageTitle}>Scenes</h1>
                <Link to="/scenes/new" class={css.addButton}>
                    <Plus size={16} />
                    New
                </Link>
            </div>

            {scenes.length === 0 ? (
                <div class={css.emptyState}>
                    No scenes yet. Create one to run a set of actions with a single tap.
                </div>
            ) : (
                <div class={css.list}>
                    {scenes.map((scene) => {
                        const Icon = scene.icon ? getIcon(scene.icon) ?? Play : Play;
                        return (
                            <div key={scene.id} class={css.card}>
                                <div class={css.cardIcon}>
                                    <Icon size={20} />
                                </div>
                                <div class={css.cardInfo}>
                                    <div class={css.cardName}>{scene.name}</div>
                                    <div class={css.cardMeta}>
                                        {scene.actionCount} action{scene.actionCount !== 1 ? "s" : ""}
                                    </div>
                                    <div class={css.cardArea}>{scene.areaName ?? "No area"}</div>
                                </div>
                                <div class={css.cardActions}>
                                    <Link to={`/scenes/${scene.id}`} class={css.editButton}>
                                        <Pencil size={16} />
                                    </Link>
                                    <button class={css.deleteButton} onClick={() => { deleteTarget.value = scene.id; }}>
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {deleteTarget.value && (
                <ConfirmModal
                    title="Delete scene"
                    message="Are you sure you want to delete this scene?"
                    confirmLabel="Delete"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => { deleteTarget.value = null; }}
                />
            )}
        </div>
    );
};
