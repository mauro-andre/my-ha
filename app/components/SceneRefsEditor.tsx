import { useCallback } from "preact/hooks";
import { useSignal } from "@preact/signals";
import type { Signal } from "@preact/signals";
import { Plus, X, Play } from "./icons.js";
import { Select } from "./Select.js";
import { getIcon } from "./icon-registry.js";
import * as css from "./ActionsEditor.css.js";

export interface SceneOption {
    id: string;
    name: string;
    icon: string | null;
}

interface SceneRefsEditorProps {
    sceneIds: Signal<string[]>;
    scenes: SceneOption[];
}

export function SceneRefsEditor({ sceneIds, scenes }: SceneRefsEditorProps) {
    const adding = useSignal("");

    const available = scenes.filter((s) => !sceneIds.value.includes(s.id));
    const selectedScenes = sceneIds.value
        .map((id) => scenes.find((s) => s.id === id))
        .filter((s): s is SceneOption => Boolean(s));

    const handleAdd = useCallback(() => {
        if (!adding.value) return;
        sceneIds.value = [...sceneIds.value, adding.value];
        adding.value = "";
    }, []);

    const handleRemove = useCallback((id: string) => {
        sceneIds.value = sceneIds.value.filter((s) => s !== id);
    }, []);

    return (
        <>
            {selectedScenes.map((scene) => {
                const Icon = scene.icon ? getIcon(scene.icon) ?? Play : Play;
                return (
                    <div key={scene.id} class={css.itemCard}>
                        <div class={css.itemInfo}>
                            <Icon size={14} /> {scene.name}
                        </div>
                        <button class={css.deleteButton} onClick={(e) => { e.stopPropagation(); handleRemove(scene.id); }}>
                            <X size={14} />
                        </button>
                    </div>
                );
            })}

            {available.length > 0 ? (
                <div class={css.row}>
                    <div class={css.fieldSmall}>
                        <Select
                            options={[
                                { value: "", label: "Scene..." },
                                ...available.map((s) => ({
                                    value: s.id,
                                    label: s.name,
                                    icon: s.icon ? getIcon(s.icon) ?? undefined : undefined,
                                })),
                            ]}
                            value={adding.value}
                            onChange={(v) => { adding.value = v; }}
                            size="small"
                        />
                    </div>
                    <button class={css.addButton} onClick={handleAdd} type="button" disabled={!adding.value}>
                        <Plus size={14} /> Add
                    </button>
                </div>
            ) : (
                selectedScenes.length === 0 && <div class={css.editingLabel}>No scenes available.</div>
            )}
        </>
    );
}
