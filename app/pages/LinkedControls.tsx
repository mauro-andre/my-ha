import { useLoader } from "@mauroandre/velojs/hooks";
import type { LoaderArgs, ActionArgs } from "@mauroandre/velojs";
import { useCallback, useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { Link as LinkIcon, Plus, X } from "../components/icons.js";
import { Select } from "../components/Select.js";
import { ConfirmModal } from "../components/ConfirmModal.js";
import * as css from "./LinkedControls.css.js";

interface MemberData {
    ieeeAddress: string;
    property: string;
}

interface LinkedControlItem {
    id: string;
    name: string;
    capabilityKind: string;
    members: MemberData[];
}

interface DeviceOption {
    ieeeAddress: string;
    friendlyName: string;
    displayLabels: Record<string, string>;
    properties: Array<{ property: string; kind: string; label: string; endpoint?: string | null }>;
}

interface LinkedControlsData {
    controls: LinkedControlItem[];
    devices: DeviceOption[];
}

export const loader = async ({}: LoaderArgs) => {
    const { getAllLinkedControls } = await import("../modules/linked-controls/linked-control.services.js");
    const { getAllDevices } = await import("../modules/devices/device.services.js");

    const controls = await getAllLinkedControls();
    const allDevices = getAllDevices();

    const devices: DeviceOption[] = allDevices.map((d) => {
        const properties: DeviceOption["properties"] = [];
        for (const cap of d.capabilities) {
            if ("features" in cap) {
                for (const f of cap.features) {
                    if ((f.access & 2) && !f.category) {
                        properties.push({ property: f.property, kind: f.kind, label: f.label, endpoint: f.endpoint });
                    }
                }
            } else if ((cap.access & 2) && !cap.category) {
                properties.push({ property: cap.property, kind: cap.kind, label: cap.label, endpoint: cap.endpoint });
            }
        }
        return {
            ieeeAddress: d.ieeeAddress,
            friendlyName: d.friendlyName,
            displayLabels: d.displayLabels ?? {},
            properties,
        };
    }).filter((d) => d.properties.length > 0);

    return {
        controls: controls.map((c) => ({
            id: c.id!,
            name: c.name,
            capabilityKind: c.capabilityKind,
            members: c.members,
        })),
        devices,
    } satisfies LinkedControlsData;
};

export const action_create = async ({ body }: ActionArgs<{ name: string }>) => {
    const { createLinkedControl } = await import("../modules/linked-controls/linked-control.services.js");
    const control = await createLinkedControl(body.name);
    return { ok: true, id: control.id };
};

export const action_delete = async ({ body }: ActionArgs<{ id: string }>) => {
    const { deleteLinkedControl } = await import("../modules/linked-controls/linked-control.services.js");
    await deleteLinkedControl(body.id);
    return { ok: true };
};

export const action_addMember = async ({ body }: ActionArgs<{ id: string; ieeeAddress: string; property: string }>) => {
    const { addMember } = await import("../modules/linked-controls/linked-control.services.js");
    const control = await addMember(body.id, { ieeeAddress: body.ieeeAddress, property: body.property });
    if (!control) return { error: "Not found" };
    return {
        ok: true,
        control: { id: control.id!, name: control.name, capabilityKind: control.capabilityKind, members: control.members },
    };
};

export const action_removeMember = async ({ body }: ActionArgs<{ id: string; index: number }>) => {
    const { removeMember } = await import("../modules/linked-controls/linked-control.services.js");
    const control = await removeMember(body.id, body.index);
    if (!control) return { error: "Not found" };
    return {
        ok: true,
        control: { id: control.id!, name: control.name, capabilityKind: control.capabilityKind, members: control.members },
    };
};

export const Component = () => {
    const { data, refetch } = useLoader<LinkedControlsData>();
    const createModalOpen = useSignal(false);
    const editControl = useSignal<LinkedControlItem | null>(null);
    const deleteTarget = useSignal<string | null>(null);
    const selectedDevice = useSignal("");
    const selectedProperty = useSignal("");
    const nameRef = useRef<HTMLInputElement>(null);

    if (!data.value) return null;

    const { controls, devices } = data.value;

    // Create
    const handleCreate = useCallback(async () => {
        const name = nameRef.current?.value.trim();
        if (!name) return;
        await action_create({ body: { name } });
        createModalOpen.value = false;
        refetch();
    }, [refetch]);

    const handleCreateKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Enter") handleCreate();
        if (e.key === "Escape") createModalOpen.value = false;
    }, [handleCreate]);

    // Delete
    const handleConfirmDelete = useCallback(async () => {
        if (!deleteTarget.value) return;
        const idToDelete = deleteTarget.value;
        await action_delete({ body: { id: idToDelete } });
        if (editControl.value?.id === idToDelete) editControl.value = null;
        deleteTarget.value = null;
        refetch();
    }, [refetch]);

    // Add member
    const handleAddMember = useCallback(async () => {
        if (!editControl.value || !selectedDevice.value || !selectedProperty.value) return;
        const result = await action_addMember({
            body: {
                id: editControl.value.id,
                ieeeAddress: selectedDevice.value,
                property: selectedProperty.value,
            },
        }) as any;
        if (result.control) editControl.value = result.control;
        selectedDevice.value = "";
        selectedProperty.value = "";
        refetch();
    }, [refetch]);

    // Remove member
    const handleRemoveMember = useCallback(async (index: number) => {
        if (!editControl.value) return;
        const result = await action_removeMember({ body: { id: editControl.value.id, index } }) as any;
        if (result.control) editControl.value = result.control;
        refetch();
    }, [refetch]);

    // Update editControl when data changes
    if (editControl.value && data.value) {
        const updated = controls.find((c) => c.id === editControl.value!.id);
        if (updated) {
            editControl.value = updated;
        }
    }

    // Resolve display label for a member
    const resolveMemberLabel = (ieee: string, property: string) => {
        const device = devices.find((d) => d.ieeeAddress === ieee);
        if (!device) return property;
        if (device.displayLabels[property]) return device.displayLabels[property]!;
        const prop = device.properties.find((p) => p.property === property);
        if (!prop) return property;
        if (prop.endpoint) return `${prop.label} ${prop.endpoint.toUpperCase()}`;
        return prop.label;
    };

    // Filter properties by capability kind
    const getFilteredProperties = (deviceIeee: string) => {
        const device = devices.find((d) => d.ieeeAddress === deviceIeee);
        if (!device) return [];

        const kind = editControl.value?.capabilityKind;
        if (!kind) return device.properties;
        return device.properties.filter((p) => p.kind === kind);
    };

    // Get device name by ieee
    const getDeviceName = (ieee: string) => {
        return devices.find((d) => d.ieeeAddress === ieee)?.friendlyName ?? ieee;
    };

    return (
        <div>
            <div class={css.header}>
                <h1 class={css.pageTitle}>Linked Controls</h1>
                <button class={css.addButton} onClick={() => {
                    createModalOpen.value = true;
                    setTimeout(() => nameRef.current?.focus(), 0);
                }}>
                    <Plus size={16} />
                    New
                </button>
            </div>

            {controls.length === 0 ? (
                <div class={css.emptyState}>
                    No linked controls yet. Create one to sync switches.
                </div>
            ) : (
                <div class={css.list}>
                    {controls.map((control) => (
                        <div key={control.id} class={css.card} onClick={() => { editControl.value = control; }}>
                            <div class={css.cardIcon}>
                                <LinkIcon size={24} />
                            </div>
                            <div class={css.cardInfo}>
                                <div class={css.cardName}>{control.name}</div>
                                <div class={css.cardMeta}>
                                    {control.members.length} members{control.capabilityKind ? ` · ${control.capabilityKind}` : ""}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create modal */}
            {createModalOpen.value && (
                <div class={css.overlay} onClick={() => { createModalOpen.value = false; }}>
                    <div class={css.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 class={css.modalTitle}>New Linked Control</h3>
                        <div class={css.inputGroup}>
                            <label class={css.inputLabel}>Name</label>
                            <input
                                ref={nameRef}
                                class={css.input}
                                placeholder="e.g. Bedroom main light sync"
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
            {editControl.value && (
                <div class={css.overlay} onClick={() => { editControl.value = null; }}>
                    <div class={css.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 class={css.modalTitle}>{editControl.value.name}</h3>

                        <div>
                            <h4 class={css.sectionTitle}>Members</h4>
                            {editControl.value.members.length === 0 ? (
                                <div class={css.cardMeta}>No members yet. Add devices to sync.</div>
                            ) : (
                                <div class={css.memberList}>
                                    {editControl.value.members.map((member, i) => (
                                        <div key={i} class={css.memberCard}>
                                            <div>
                                                <div class={css.memberInfo}>{getDeviceName(member.ieeeAddress)}</div>
                                                <div class={css.memberProperty}>{resolveMemberLabel(member.ieeeAddress, member.property)}</div>
                                            </div>
                                            <button class={css.deleteButton} onClick={() => handleRemoveMember(i)}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div class={css.addMemberRow}>
                            <div class={css.inputLabel}>Add member</div>
                            <div class={css.addMemberSelects}>
                                <div class={css.selectWrapper}>
                                    <Select
                                        options={[
                                            { value: "", label: "Select device..." },
                                            ...devices.map((d) => ({ value: d.ieeeAddress, label: d.friendlyName })),
                                        ]}
                                        value={selectedDevice.value}
                                        onChange={(v) => {
                                            selectedDevice.value = v;
                                            selectedProperty.value = "";
                                        }}
                                        size="small"
                                    />
                                </div>
                                {selectedDevice.value && (
                                    <div class={css.selectWrapper}>
                                        <Select
                                            options={[
                                                { value: "", label: "Select property..." },
                                                ...getFilteredProperties(selectedDevice.value).map((p) => ({
                                                    value: p.property,
                                                    label: resolveMemberLabel(selectedDevice.value, p.property),
                                                })),
                                            ]}
                                            value={selectedProperty.value}
                                            onChange={(v) => { selectedProperty.value = v; }}
                                            size="small"
                                        />
                                    </div>
                                )}
                                <button
                                    class={css.addButton}
                                    onClick={handleAddMember}
                                    disabled={!selectedDevice.value || !selectedProperty.value}
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>

                        <div class={css.modalActions}>
                            <button
                                class={css.deleteButton}
                                onClick={() => { deleteTarget.value = editControl.value!.id; }}
                                style={{ marginRight: "auto", padding: "0.5rem 1rem", fontSize: "0.8125rem" }}
                            >
                                Delete
                            </button>
                            <button class={css.cancelButton} onClick={() => { editControl.value = null; }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirmation */}
            {deleteTarget.value && (
                <ConfirmModal
                    title="Delete linked control"
                    message="Are you sure you want to delete this linked control? All member associations will be removed."
                    confirmLabel="Delete"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => { deleteTarget.value = null; }}
                />
            )}
        </div>
    );
};
