import { useLoader } from "@mauroandre/velojs/hooks";
import type { LoaderArgs, ActionArgs } from "@mauroandre/velojs";
import { useCallback, useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { Plus, Pencil } from "../components/icons.js";
import { IconPicker } from "../components/IconPicker.js";
import { getIcon } from "../components/icon-registry.js";
import { ConfirmModal } from "../components/ConfirmModal.js";
import * as css from "./Areas.css.js";

interface AreaItem {
    id: string;
    name: string;
    icon: string | null;
    deviceCount: number;
}

interface AreasData {
    areas: AreaItem[];
}

export const loader = async ({}: LoaderArgs) => {
    const { getAllAreas } = await import("../modules/areas/area.services.js");
    const { getAllDevices } = await import("../modules/devices/device.services.js");
    const { getAllIrDevices } = await import("../modules/ir-devices/ir-device.services.js");

    const areas = getAllAreas();
    const devices = getAllDevices();
    const irDevices = await getAllIrDevices();

    return {
        areas: areas.map((a) => ({
            id: a.id!,
            name: a.name,
            icon: a.icon ?? null,
            deviceCount:
                devices.filter((d) => d.areaId === a.id).length +
                irDevices.filter((d) => d.areaId === a.id).length,
        })),
    } satisfies AreasData;
};

export const action_create = async ({ body }: ActionArgs<{ name: string; icon?: string }>) => {
    const { createArea } = await import("../modules/areas/area.services.js");
    await createArea(body.name, body.icon);
    return { ok: true };
};

export const action_rename = async ({ body }: ActionArgs<{ id: string; name: string }>) => {
    const { renameArea } = await import("../modules/areas/area.services.js");
    await renameArea(body.id, body.name);
    return { ok: true };
};

export const action_setIcon = async ({ body }: ActionArgs<{ id: string; icon: string }>) => {
    const { setAreaIcon } = await import("../modules/areas/area.services.js");
    await setAreaIcon(body.id, body.icon);
    return { ok: true };
};

export const action_delete = async ({ body }: ActionArgs<{ id: string }>) => {
    const { deleteArea } = await import("../modules/areas/area.services.js");
    await deleteArea(body.id);
    return { ok: true };
};

export const Component = () => {
    const { data, refetch } = useLoader<AreasData>();
    const createModalOpen = useSignal(false);
    const createIcon = useSignal("");
    const editArea = useSignal<AreaItem | null>(null);
    const editingName = useSignal(false);
    const deleteTarget = useSignal<string | null>(null);
    const nameRef = useRef<HTMLInputElement>(null);
    const editNameRef = useRef<HTMLInputElement>(null);

    if (!data.value) return null;

    const { areas } = data.value;

    // Create
    const handleCreate = useCallback(async () => {
        const name = nameRef.current?.value.trim();
        if (!name) return;
        await action_create({ body: { name, icon: createIcon.value || undefined } });
        createModalOpen.value = false;
        createIcon.value = "";
        refetch();
    }, [refetch]);

    const handleCreateKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Enter") handleCreate();
        if (e.key === "Escape") createModalOpen.value = false;
    }, [handleCreate]);

    // Rename
    const startEditingName = useCallback(() => {
        editingName.value = true;
        setTimeout(() => {
            if (editNameRef.current && editArea.value) {
                editNameRef.current.value = editArea.value.name;
                editNameRef.current.focus();
                editNameRef.current.select();
            }
        }, 0);
    }, []);

    const confirmRename = useCallback(async () => {
        if (!editArea.value) return;
        const newName = editNameRef.current?.value.trim();
        if (!newName || newName === editArea.value.name) {
            editingName.value = false;
            return;
        }
        await action_rename({ body: { id: editArea.value.id, name: newName } });
        editingName.value = false;
        refetch();
    }, [refetch]);

    const handleSetIcon = useCallback(async (icon: string) => {
        if (!editArea.value) return;
        await action_setIcon({ body: { id: editArea.value.id, icon } });
        refetch();
    }, [refetch]);

    const handleRenameKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Enter") confirmRename();
        if (e.key === "Escape") editingName.value = false;
    }, [confirmRename]);

    // Delete
    const handleConfirmDelete = useCallback(async () => {
        if (!deleteTarget.value) return;
        const id = deleteTarget.value;
        await action_delete({ body: { id } });
        if (editArea.value?.id === id) editArea.value = null;
        deleteTarget.value = null;
        refetch();
    }, [refetch]);

    return (
        <div>
            <div class={css.header}>
                <h1 class={css.pageTitle}>Areas</h1>
                <button class={css.addButton} onClick={() => {
                    createModalOpen.value = true;
                    setTimeout(() => nameRef.current?.focus(), 0);
                }}>
                    <Plus size={16} />
                    Add
                </button>
            </div>

            {areas.length === 0 ? (
                <div class={css.emptyState}>
                    No areas yet. Create rooms to organize your devices.
                </div>
            ) : (
                <div class={css.list}>
                    {areas.map((area) => (
                        <div key={area.id} class={css.card} onClick={() => {
                            editArea.value = area;
                            editingName.value = false;
                        }}>
                            <div class={css.cardIcon}>
                                {(() => {
                                    const Icon = area.icon ? getIcon(area.icon) : null;
                                    return Icon ? <Icon size={32} /> : <span style={{ fontSize: "2rem" }}>🏠</span>;
                                })()}
                            </div>
                            <div class={css.cardName}>{area.name}</div>
                            <div class={css.cardMeta}>
                                {area.deviceCount} device{area.deviceCount !== 1 ? "s" : ""}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create modal */}
            {createModalOpen.value && (
                <div class={css.overlay} onClick={() => { createModalOpen.value = false; }}>
                    <div class={css.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 class={css.modalTitle}>New Area</h3>
                        <div class={css.inputGroup}>
                            <label class={css.inputLabel}>Icon</label>
                            <IconPicker
                                value={createIcon.value}
                                onChange={(v) => { createIcon.value = v; }}
                            />
                        </div>
                        <div class={css.inputGroup}>
                            <label class={css.inputLabel}>Name</label>
                            <input
                                ref={nameRef}
                                class={css.input}
                                placeholder="e.g. Living Room"
                                onKeyDown={handleCreateKeyDown}
                            />
                        </div>
                        <div class={css.modalActions}>
                            <button class={css.cancelButton} onClick={() => { createModalOpen.value = false; }}>
                                Cancel
                            </button>
                            <button class={css.saveButton} onClick={handleCreate}>
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit modal */}
            {editArea.value && (
                <div class={css.overlay} onClick={() => { editArea.value = null; }}>
                    <div class={css.modal} onClick={(e) => e.stopPropagation()}>
                        {editingName.value ? (
                            <input
                                ref={editNameRef}
                                class={css.input}
                                onKeyDown={handleRenameKeyDown}
                                onBlur={() => confirmRename()}
                            />
                        ) : (
                            <div class={css.nameRow}>
                                <h3 class={css.modalTitle}>{editArea.value.name}</h3>
                                <button class={css.editNameButton} onClick={startEditingName}>
                                    <Pencil size={16} />
                                </button>
                            </div>
                        )}
                        <div class={css.inputGroup}>
                            <label class={css.inputLabel}>Icon</label>
                            <IconPicker
                                value={editArea.value.icon ?? ""}
                                onChange={handleSetIcon}
                            />
                        </div>
                        <div class={css.cardMeta}>
                            {editArea.value.deviceCount} device{editArea.value.deviceCount !== 1 ? "s" : ""} assigned
                        </div>
                        <div class={css.modalActions}>
                            <button class={css.deleteButton} onClick={() => { deleteTarget.value = editArea.value!.id; }}>
                                Delete
                            </button>
                            <button class={css.cancelButton} onClick={() => { editArea.value = null; }} style={{ marginLeft: "auto" }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirmation */}
            {deleteTarget.value && (
                <ConfirmModal
                    title="Delete area"
                    message="Are you sure you want to delete this area? Devices will become unassigned."
                    confirmLabel="Delete"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => { deleteTarget.value = null; }}
                />
            )}
        </div>
    );
};
