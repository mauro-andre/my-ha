import { useCallback } from "preact/hooks";
import { useSignal } from "@preact/signals";
import type { Signal } from "@preact/signals";
import { Plus, X } from "./icons.js";
import { Select } from "./Select.js";
import type { Action } from "../modules/actions/action.schemas.js";
import * as css from "./ActionsEditor.css.js";

export interface DeviceOption {
    ieeeAddress: string;
    friendlyName: string;
    properties: Array<{
        property: string;
        kind: string;
        label: string;
        endpoint?: string | null;
        valueOn?: unknown;
        valueOff?: unknown;
        values?: string[] | null;
    }>;
    displayLabels: Record<string, string>;
}

export interface IrDeviceOption {
    id: string;
    name: string;
    commands: Array<{ name: string; blasterIeee: string; code: string }>;
}

interface ActionsEditorProps {
    actions: Signal<Action[]>;
    devices: DeviceOption[];
    irDevices: IrDeviceOption[];
}

function getValueOptions(device: DeviceOption, property: string): Array<{ value: string; label: string }> | null {
    const prop = device.properties.find((p) => p.property === property);
    if (!prop) return null;
    if (prop.kind === "binary") {
        return [
            { value: String(prop.valueOn ?? "ON"), label: String(prop.valueOn ?? "ON") },
            { value: String(prop.valueOff ?? "OFF"), label: String(prop.valueOff ?? "OFF") },
        ];
    }
    if (prop.kind === "enum" && prop.values) {
        return prop.values.map((v) => ({ value: v, label: v }));
    }
    return null;
}

function resolvePropertyLabel(device: DeviceOption, property: string): string {
    if (device.displayLabels[property]) return device.displayLabels[property]!;
    const prop = device.properties.find((p) => p.property === property);
    if (!prop) return property;
    if (prop.endpoint) return `${prop.label} ${prop.endpoint.toUpperCase()}`;
    return prop.label;
}

export function ActionsEditor({ actions, devices, irDevices }: ActionsEditorProps) {
    const addActionType = useSignal("device_command");
    const addActionDevice = useSignal("");
    const addActionProperty = useSignal("");
    const addActionValue = useSignal("");
    const addActionIrDevice = useSignal("");
    const addActionIrCommand = useSignal("");
    const editingActionIndex = useSignal<number | null>(null);

    const getDeviceProps = (ieee: string) => {
        return devices.find((d) => d.ieeeAddress === ieee)?.properties ?? [];
    };

    const getDeviceName = (ieee: string) => {
        return devices.find((d) => d.ieeeAddress === ieee)?.friendlyName ?? ieee;
    };

    const buildAction = (): Action | null => {
        if (addActionType.value === "device_command") {
            if (!addActionDevice.value || !addActionProperty.value) return null;
            let value: any = addActionValue.value;
            if (!isNaN(Number(value)) && value !== "") value = Number(value);
            return {
                type: "device_command",
                ieeeAddress: addActionDevice.value,
                property: addActionProperty.value,
                value,
            };
        }
        if (addActionType.value === "ir_command") {
            const irDev = irDevices.find((d) => d.id === addActionIrDevice.value);
            const cmd = irDev?.commands.find((c) => c.name === addActionIrCommand.value);
            if (!cmd) return null;
            return { type: "ir_command", blasterIeee: cmd.blasterIeee, code: cmd.code };
        }
        return null;
    };

    const resetAddFields = () => {
        addActionDevice.value = "";
        addActionProperty.value = "";
        addActionValue.value = "";
        addActionIrDevice.value = "";
        addActionIrCommand.value = "";
    };

    const handleSaveAction = useCallback(() => {
        const action = buildAction();
        if (!action) return;

        if (editingActionIndex.value !== null) {
            const updated = [...actions.value];
            updated[editingActionIndex.value] = action;
            actions.value = updated;
            editingActionIndex.value = null;
        } else {
            actions.value = [...actions.value, action];
        }

        resetAddFields();
    }, [irDevices]);

    const startEditAction = useCallback((index: number) => {
        const action = actions.value[index];
        if (!action) return;
        editingActionIndex.value = index;

        if (action.type === "device_command") {
            addActionType.value = "device_command";
            addActionDevice.value = action.ieeeAddress;
            addActionProperty.value = action.property;
            addActionValue.value = String(action.value ?? "");
        } else if (action.type === "ir_command") {
            addActionType.value = "ir_command";
            for (const irDev of irDevices) {
                const cmd = irDev.commands.find((c) => c.blasterIeee === action.blasterIeee && c.code === action.code);
                if (cmd) {
                    addActionIrDevice.value = irDev.id;
                    addActionIrCommand.value = cmd.name;
                    break;
                }
            }
        }
    }, [irDevices]);

    const cancelEditAction = useCallback(() => {
        editingActionIndex.value = null;
        addActionType.value = "device_command";
        resetAddFields();
    }, []);

    const renderActionLabel = (action: Action) => {
        if (action.type === "device_command") {
            const device = devices.find((d) => d.ieeeAddress === action.ieeeAddress);
            const propLabel = device ? resolvePropertyLabel(device, action.property) : action.property;
            return `${getDeviceName(action.ieeeAddress)} → ${propLabel} = ${action.value}`;
        }
        if (action.type === "ir_command") {
            for (const irDev of irDevices) {
                const cmd = irDev.commands.find((c) => c.blasterIeee === action.blasterIeee && c.code === action.code);
                if (cmd) return `${irDev.name} → ${cmd.name}`;
            }
            return "IR: send code";
        }
        return "";
    };

    return (
        <>
            {actions.value.map((action, i) => (
                <div
                    key={i}
                    class={`${css.itemCard} ${editingActionIndex.value === i ? css.itemCardEditing : ""}`}
                    onClick={() => startEditAction(i)}
                >
                    <div class={css.itemInfo}>{renderActionLabel(action)}</div>
                    <button class={css.deleteButton} onClick={(e) => { e.stopPropagation(); actions.value = actions.value.filter((_, j) => j !== i); editingActionIndex.value = null; }}>
                        <X size={14} />
                    </button>
                </div>
            ))}
            <div class={css.addForm}>
                <div class={css.addFormTitle}>
                    {editingActionIndex.value !== null ? `Editing action ${editingActionIndex.value + 1}` : "New action"}
                </div>
                <div class={css.inputGroup}>
                    <Select
                        options={[
                            { value: "device_command", label: "Device command" },
                            { value: "ir_command", label: "IR command" },
                        ]}
                        value={addActionType.value}
                        onChange={(v) => { addActionType.value = v; }}
                        size="small"
                    />
                </div>
                {addActionType.value === "device_command" && (
                    <div class={css.row}>
                        <div class={css.fieldSmall}>
                            <Select
                                options={[{ value: "", label: "Device..." }, ...devices.map((d) => ({ value: d.ieeeAddress, label: d.friendlyName }))]}
                                value={addActionDevice.value}
                                onChange={(v) => { addActionDevice.value = v; addActionProperty.value = ""; }}
                                size="small"
                            />
                        </div>
                        {addActionDevice.value && (
                            <>
                                <div class={css.fieldSmall}>
                                    <Select
                                        options={[{ value: "", label: "Property..." }, ...getDeviceProps(addActionDevice.value).map((p) => ({ value: p.property, label: resolvePropertyLabel(devices.find((d) => d.ieeeAddress === addActionDevice.value)!, p.property) }))]}
                                        value={addActionProperty.value}
                                        onChange={(v) => { addActionProperty.value = v; }}
                                        size="small"
                                    />
                                </div>
                                <div class={css.fieldSmall}>
                                    {(() => {
                                        const device = devices.find((d) => d.ieeeAddress === addActionDevice.value);
                                        const options = device && addActionProperty.value ? getValueOptions(device, addActionProperty.value) : null;
                                        if (options) {
                                            return (
                                                <Select
                                                    options={[{ value: "", label: "Value..." }, ...options]}
                                                    value={addActionValue.value}
                                                    onChange={(v) => { addActionValue.value = v; }}
                                                    size="small"
                                                />
                                            );
                                        }
                                        return <input class={css.input} placeholder="Value" value={addActionValue.value} onInput={(e) => { addActionValue.value = (e.target as HTMLInputElement).value; }} />;
                                    })()}
                                </div>
                                <button class={css.addButton} onClick={handleSaveAction} type="button">
                                    <Plus size={14} /> {editingActionIndex.value !== null ? "Update" : "Add"}
                                </button>
                                {editingActionIndex.value !== null && (
                                    <button class={css.cancelEditButton} onClick={cancelEditAction} type="button">Cancel</button>
                                )}
                            </>
                        )}
                    </div>
                )}
                {addActionType.value === "ir_command" && (
                    <div class={css.row}>
                        <div class={css.fieldSmall}>
                            <Select
                                options={[
                                    { value: "", label: "IR Device..." },
                                    ...irDevices.map((d) => ({ value: d.id, label: d.name })),
                                ]}
                                value={addActionIrDevice.value}
                                onChange={(v) => { addActionIrDevice.value = v; addActionIrCommand.value = ""; }}
                                size="small"
                            />
                        </div>
                        {addActionIrDevice.value && (
                            <div class={css.fieldSmall}>
                                <Select
                                    options={[
                                        { value: "", label: "Command..." },
                                        ...(irDevices.find((d) => d.id === addActionIrDevice.value)?.commands.map((c) => ({
                                            value: c.name,
                                            label: c.name,
                                        })) ?? []),
                                    ]}
                                    value={addActionIrCommand.value}
                                    onChange={(v) => { addActionIrCommand.value = v; }}
                                    size="small"
                                />
                            </div>
                        )}
                        <button class={css.addButton} onClick={handleSaveAction} type="button">
                            <Plus size={14} /> {editingActionIndex.value !== null ? "Update" : "Add"}
                        </button>
                        {editingActionIndex.value !== null && (
                            <button class={css.cancelEditButton} onClick={cancelEditAction} type="button">Cancel</button>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
