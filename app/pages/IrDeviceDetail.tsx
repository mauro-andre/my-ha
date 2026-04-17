import { Link } from "@mauroandre/velojs";
import { useLoader } from "@mauroandre/velojs/hooks";
import type { LoaderArgs, ActionArgs } from "@mauroandre/velojs";
import { useCallback, useRef, useEffect } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { ArrowLeft, Aerial, Pencil, Plus, X } from "../components/icons.js";
import { Select } from "../components/Select.js";
import { ConfirmModal } from "../components/ConfirmModal.js";
import { CommandControl } from "../components/controls/CommandControl.js";
import * as IrDevices from "./IrDevices.js";
import * as css from "./IrDeviceDetail.css.js";

interface BlasterInfo {
    ieeeAddress: string;
    friendlyName: string;
}

interface CommandData {
    name: string;
    code: string;
    blasterIeee: string;
}

interface IrDeviceData {
    device: {
        id: string;
        name: string;
        blasters: string[];
        commands: CommandData[];
    } | null;
    blasterNames: Record<string, string>;
    availableBlasters: BlasterInfo[];
}

export const loader = async ({ c }: LoaderArgs) => {
    const id = c.req.param("id");
    const { getIrDevice } = await import("../modules/ir-devices/ir-device.services.js");
    const { getAllDevices } = await import("../modules/devices/device.services.js");

    const device = await getIrDevice(id ?? "");
    if (!device) return { device: null, blasterNames: {}, availableBlasters: [] } satisfies IrDeviceData;

    const allDevices = getAllDevices();
    const blasterNames: Record<string, string> = {};
    for (const d of allDevices) {
        blasterNames[d.ieeeAddress] = d.friendlyName;
    }

    const availableBlasters = allDevices
        .filter((d) => d.capabilities.some((c) =>
            !("features" in c) && c.name === "ir_code_to_send"
        ))
        .map((d) => ({ ieeeAddress: d.ieeeAddress, friendlyName: d.friendlyName }));

    return {
        device: {
            id: device.id!,
            name: device.name,
            blasters: device.blasters,
            commands: device.commands,
        },
        blasterNames,
        availableBlasters,
    } satisfies IrDeviceData;
};

export const action_addBlaster = async ({ body }: ActionArgs<{ id: string; blasterIeee: string }>) => {
    const { getIrDevice, updateIrDevice } = await import("../modules/ir-devices/ir-device.services.js");
    const device = await getIrDevice(body.id);
    if (!device) return { error: "Device not found" };
    if (!device.blasters.includes(body.blasterIeee)) {
        device.blasters.push(body.blasterIeee);
        await updateIrDevice(device);
    }
    return { ok: true };
};

export const action_removeBlaster = async ({ body }: ActionArgs<{ id: string; blasterIeee: string }>) => {
    const { getIrDevice, updateIrDevice } = await import("../modules/ir-devices/ir-device.services.js");
    const device = await getIrDevice(body.id);
    if (!device) return { error: "Device not found" };
    device.blasters = device.blasters.filter((b) => b !== body.blasterIeee);
    await updateIrDevice(device);
    return { ok: true };
};

export const action_rename = async ({ body }: ActionArgs<{ id: string; name: string }>) => {
    const { getIrDevice, updateIrDevice } = await import("../modules/ir-devices/ir-device.services.js");
    const device = await getIrDevice(body.id);
    if (!device) return { error: "Device not found" };
    device.name = body.name;
    await updateIrDevice(device);
    return { ok: true };
};

export const action_renameCommand = async ({ body }: ActionArgs<{ id: string; index: number; name: string }>) => {
    const { getIrDevice, updateIrDevice } = await import("../modules/ir-devices/ir-device.services.js");
    const device = await getIrDevice(body.id);
    if (!device || !device.commands[body.index]) return { error: "Not found" };
    device.commands[body.index]!.name = body.name;
    await updateIrDevice(device);
    return { ok: true };
};

export const action_addCommand = async ({ body }: ActionArgs<{ id: string; name: string; code: string; blasterIeee: string }>) => {
    const { addCommand } = await import("../modules/ir-devices/ir-device.services.js");
    await addCommand(body.id, { name: body.name, code: body.code, blasterIeee: body.blasterIeee });
    return { ok: true };
};

export const action_removeCommand = async ({ body }: ActionArgs<{ id: string; index: number }>) => {
    const { removeCommand } = await import("../modules/ir-devices/ir-device.services.js");
    await removeCommand(body.id, body.index);
    return { ok: true };
};

export const action_sendCode = async ({ body }: ActionArgs<{ blasterIeee: string; code: string }>) => {
    const { sendIrCode } = await import("../modules/ir-devices/ir-device.services.js");
    sendIrCode(body.blasterIeee, body.code);
    return { ok: true };
};

export const action_startLearn = async ({ body }: ActionArgs<{ blasterIeee: string }>) => {
    const { startLearning } = await import("../modules/ir-devices/ir-device.services.js");
    startLearning(body.blasterIeee);
    return { ok: true };
};


export const Component = () => {
    const { data, refetch } = useLoader<IrDeviceData>();
    const learning = useSignal(false);
    const learnedCode = useSignal<string | null>(null);
    const modalOpen = useSignal(false);
    const editing = useSignal(false);
    const deleteTarget = useSignal<{ type: "command"; index: number } | { type: "blaster"; ieee: string } | null>(null);
    const blasterModalOpen = useSignal(false);
    const editingCommandIndex = useSignal<number | null>(null);
    const commandEditRef = useRef<HTMLInputElement>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const commandNameRef = useRef<HTMLInputElement>(null);
    const addBlasterIeee = useSignal("");

    if (!data.value) return null;

    const { device, blasterNames, availableBlasters } = data.value;

    if (!device) {
        return (
            <div>
                <Link to={IrDevices} class={css.backLink}>
                    <ArrowLeft size={16} />
                    Back to remotes
                </Link>
                <p>Device not found.</p>
            </div>
        );
    }

    const defaultBlaster = device.blasters[0] ?? "";

    const startEditing = useCallback(() => {
        editing.value = true;
        setTimeout(() => {
            if (nameInputRef.current) {
                nameInputRef.current.value = device.name;
                nameInputRef.current.focus();
                nameInputRef.current.select();
            }
        }, 0);
    }, [device.name]);

    const confirmRename = useCallback(async () => {
        const newName = nameInputRef.current?.value.trim();
        if (!newName || newName === device.name) {
            editing.value = false;
            return;
        }
        await action_rename({ body: { id: device.id, name: newName } });
        editing.value = false;
        refetch();
    }, [device.id, device.name, refetch]);

    const handleNameKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Enter") confirmRename();
        if (e.key === "Escape") editing.value = false;
    }, [confirmRename]);

    const handleAddBlaster = useCallback(async () => {
        const ieee = addBlasterIeee.value;
        if (!ieee) return;
        await action_addBlaster({ body: { id: device.id, blasterIeee: ieee } });
        blasterModalOpen.value = false;
        refetch();
    }, [device.id, refetch]);

    const openLearnModal = useCallback(() => {
        modalOpen.value = true;
        learning.value = false;
        learnedCode.value = null;
    }, []);

    // SSE: listen for learned IR codes
    useEffect(() => {
        if (typeof window === "undefined" || !defaultBlaster) return;

        const es = new EventSource("/api/devices/events");

        es.addEventListener("state_change", (e) => {
            const data = JSON.parse(e.data);
            if (data.ieeeAddress === defaultBlaster && data.changedKeys.includes("learned_ir_code")) {
                const code = data.state.learned_ir_code;
                if (code && learning.value) {
                    learnedCode.value = code;
                    learning.value = false;
                }
            }
        });

        return () => es.close();
    }, [defaultBlaster]);

    const handleStartLearn = useCallback(async () => {
        learning.value = true;
        learnedCode.value = null;
        await action_startLearn({ body: { blasterIeee: defaultBlaster } });

        // Timeout after 30 seconds
        setTimeout(() => {
            if (learning.value) {
                learning.value = false;
            }
        }, 30000);
    }, [defaultBlaster]);

    const handleSaveCommand = useCallback(async () => {
        const name = commandNameRef.current?.value.trim();
        const code = learnedCode.value;
        if (!name || !code) return;

        await action_addCommand({
            body: { id: device.id, name, code, blasterIeee: defaultBlaster },
        });

        modalOpen.value = false;
        refetch();
    }, [device.id, defaultBlaster, refetch]);

    const handleSend = useCallback(async (command: CommandData) => {
        await action_sendCode({ body: { blasterIeee: command.blasterIeee, code: command.code } });
    }, []);

    const startEditingCommand = useCallback((index: number, currentName: string) => {
        editingCommandIndex.value = index;
        setTimeout(() => {
            if (commandEditRef.current) {
                commandEditRef.current.value = currentName;
                commandEditRef.current.focus();
                commandEditRef.current.select();
            }
        }, 0);
    }, []);

    const confirmRenameCommand = useCallback(async () => {
        const index = editingCommandIndex.value;
        if (index === null) return;
        const newName = commandEditRef.current?.value.trim();
        if (!newName || newName === device.commands[index]?.name) {
            editingCommandIndex.value = null;
            return;
        }
        await action_renameCommand({ body: { id: device.id, index, name: newName } });
        editingCommandIndex.value = null;
        refetch();
    }, [device.id, device.commands, refetch]);

    const handleCommandKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Enter") confirmRenameCommand();
        if (e.key === "Escape") editingCommandIndex.value = null;
    }, [confirmRenameCommand]);

    const handleConfirmDelete = useCallback(async () => {
        const target = deleteTarget.value;
        if (!target) return;

        if (target.type === "command") {
            await action_removeCommand({ body: { id: device.id, index: target.index } });
        } else if (target.type === "blaster") {
            await action_removeBlaster({ body: { id: device.id, blasterIeee: target.ieee } });
        }

        deleteTarget.value = null;
        refetch();
    }, [device.id, refetch]);

    return (
        <div>
            <Link to={IrDevices} class={css.backLink}>
                <ArrowLeft size={16} />
                Back to remotes
            </Link>

            <div class={css.header}>
                <div class={css.headerIcon}>
                    <Aerial size={32} />
                </div>
                <div class={css.headerInfo}>
                    {editing.value ? (
                        <input
                            ref={nameInputRef}
                            class={css.nameInput}
                            onKeyDown={handleNameKeyDown}
                            onBlur={() => confirmRename()}
                        />
                    ) : (
                        <div class={css.nameRow}>
                            <span class={css.deviceName}>{device.name}</span>
                            <button class={css.editNameButton} onClick={startEditing}>
                                <Pencil size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div class={css.section}>
                <div class={css.sectionHeader}>
                    <h2 class={css.sectionTitle}>Blasters</h2>
                    <button class={css.addButton} onClick={() => {
                        const unassigned = availableBlasters.filter((b) => !device.blasters.includes(b.ieeeAddress));
                        if (unassigned[0]) addBlasterIeee.value = unassigned[0].ieeeAddress;
                        blasterModalOpen.value = true;
                    }}>
                        <Plus size={16} />
                        Add
                    </button>
                </div>
                {device.blasters.length === 0 ? (
                    <div class={css.emptyState}>
                        No blasters assigned. Add one to send IR codes.
                    </div>
                ) : (
                    <div class={css.commandList}>
                        {device.blasters.map((ieee) => (
                            <div key={ieee} class={css.commandCard}>
                                <div class={css.commandInfo}>
                                    <div class={css.commandName}>{blasterNames[ieee] ?? ieee}</div>
                                    <div class={css.commandCode}>{ieee}</div>
                                </div>
                                <button class={css.deleteButton} onClick={() => { deleteTarget.value = { type: "blaster", ieee }; }}>
                                    <X size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div class={css.section}>
                <div class={css.sectionHeader}>
                    <h2 class={css.sectionTitle}>Commands</h2>
                    <button class={css.addButton} onClick={openLearnModal}>
                        <Plus size={16} />
                        Learn
                    </button>
                </div>

                {device.commands.length === 0 ? (
                    <div class={css.emptyState}>
                        No commands yet. Click "Learn" to capture an IR code.
                    </div>
                ) : (
                    <div class={css.commandList}>
                        {device.commands.map((cmd, i) => (
                            <div key={i} class={css.commandWrapper}>
                                <CommandControl
                                    label={cmd.name}
                                    onFire={() => handleSend(cmd)}
                                />
                                <div class={css.commandMeta}>
                                    <button class={css.actionButton} onClick={() => startEditingCommand(i, cmd.name)}>
                                        <Pencil size={14} />
                                    </button>
                                    <button class={css.deleteButton} onClick={() => { deleteTarget.value = { type: "command", index: i }; }}>
                                        <X size={14} />
                                    </button>
                                </div>
                                {editingCommandIndex.value === i && (
                                    <input
                                        ref={commandEditRef}
                                        class={css.commandNameInput}
                                        onKeyDown={handleCommandKeyDown}
                                        onBlur={() => confirmRenameCommand()}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {modalOpen.value && (
                <div class={css.overlay} onClick={() => { modalOpen.value = false; }}>
                    <div class={css.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 class={css.modalTitle}>Learn IR Code</h3>

                        <div class={css.inputGroup}>
                            <label class={css.inputLabel}>Command name</label>
                            <input
                                ref={commandNameRef}
                                class={css.input}
                                placeholder="e.g. Turn On 24°C"
                            />
                        </div>

                        {!learnedCode.value ? (
                            <>
                                <button class={css.learnButton} onClick={handleStartLearn} disabled={learning.value}>
                                    <Aerial size={16} />
                                    {learning.value ? "Waiting for signal..." : "Start Learning"}
                                </button>
                                {learning.value && (
                                    <div class={css.learningStatus}>
                                        Point your remote at the IR blaster and press a button...
                                    </div>
                                )}
                            </>
                        ) : (
                            <div class={css.codePreview}>
                                {learnedCode.value}
                            </div>
                        )}

                        <div class={css.modalActions}>
                            <button class={css.cancelButton} onClick={() => { modalOpen.value = false; }}>
                                Cancel
                            </button>
                            {learnedCode.value && (
                                <button class={css.saveButton} onClick={handleSaveCommand}>
                                    Save Command
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {blasterModalOpen.value && (
                <div class={css.overlay} onClick={() => { blasterModalOpen.value = false; }}>
                    <div class={css.modal} onClick={(e) => e.stopPropagation()}>
                        {(() => {
                            const unassigned = availableBlasters
                                .filter((b) => !device.blasters.includes(b.ieeeAddress));
                            const hasOptions = unassigned.length > 0;
                            return (
                                <>
                                    <h3 class={css.modalTitle}>Add Blaster</h3>
                                    {hasOptions ? (
                                        <div class={css.inputGroup}>
                                            <label class={css.inputLabel}>IR Blaster</label>
                                            <Select
                                                options={unassigned.map((b) => ({ value: b.ieeeAddress, label: b.friendlyName }))}
                                                value={addBlasterIeee.value}
                                                onChange={(v) => { addBlasterIeee.value = v; }}
                                            />
                                        </div>
                                    ) : (
                                        <p class={css.emptyState}>No available blasters to add.</p>
                                    )}
                                    <div class={css.modalActions}>
                                        <button class={css.cancelButton} onClick={() => { blasterModalOpen.value = false; }}>
                                            Cancel
                                        </button>
                                        <button class={css.saveButton} onClick={handleAddBlaster} disabled={!hasOptions}>
                                            Add
                                        </button>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            {deleteTarget.value && (
                <ConfirmModal
                    title={deleteTarget.value.type === "command" ? "Remove command" : "Remove blaster"}
                    message={deleteTarget.value.type === "command"
                        ? "Are you sure you want to remove this command? This action cannot be undone."
                        : "Are you sure you want to remove this blaster from the device?"}
                    confirmLabel="Remove"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => { deleteTarget.value = null; }}
                />
            )}
        </div>
    );
};
