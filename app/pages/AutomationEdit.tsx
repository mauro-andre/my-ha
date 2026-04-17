import { Link } from "@mauroandre/velojs";
import { useLoader, useParams, useNavigate } from "@mauroandre/velojs/hooks";
import type { LoaderArgs, ActionArgs } from "@mauroandre/velojs";
import { useCallback, useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { ArrowLeft, Plus, X } from "../components/icons.js";
import { Select } from "../components/Select.js";
import type { Trigger, Condition, Action } from "../modules/automations/automation.schemas.js";
import * as Automations from "./Automations.js";
import * as css from "./AutomationEdit.css.js";

interface DeviceOption {
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

interface IrCommandOption {
    irDeviceId: string;
    irDeviceName: string;
    commandName: string;
    blasterIeee: string;
    code: string;
}

interface AutomationEditData {
    automation: {
        id: string;
        name: string;
        runOnce: boolean;
        trigger: Trigger;
        conditions: Condition[];
        actions: Action[];
    } | null;
    devices: DeviceOption[];
    irCommands: IrCommandOption[];
}

export const loader = async ({ c }: LoaderArgs) => {
    const id = c.req.param("id");
    const { getAllDevices } = await import("../modules/devices/device.services.js");
    const { getAllIrDevices } = await import("../modules/ir-devices/ir-device.services.js");

    const allDevices = getAllDevices();
    const allIrDevices = await getAllIrDevices();

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

    const irCommands: IrCommandOption[] = [];
    for (const ir of allIrDevices) {
        for (const cmd of ir.commands) {
            irCommands.push({
                irDeviceId: ir.id!,
                irDeviceName: ir.name,
                commandName: cmd.name,
                blasterIeee: cmd.blasterIeee,
                code: cmd.code,
            });
        }
    }

    let automation: AutomationEditData["automation"] = null;
    if (id && id !== "new") {
        const { getAutomation } = await import("../modules/automations/automation.services.js");
        const auto = await getAutomation(id);
        if (auto) {
            automation = {
                id: auto.id!,
                name: auto.name,
                runOnce: auto.runOnce,
                trigger: auto.trigger,
                conditions: auto.conditions,
                actions: auto.actions,
            };
        }
    }

    return { automation, devices, irCommands } satisfies AutomationEditData;
};

export const action_save = async ({ body }: ActionArgs<{
    id?: string;
    name: string;
    runOnce: boolean;
    trigger: Trigger;
    conditions: Condition[];
    actions: Action[];
}>) => {
    if (body.id) {
        const { getAutomation, updateAutomation } = await import("../modules/automations/automation.services.js");
        const auto = await getAutomation(body.id);
        if (!auto) return { error: "Not found" };
        auto.name = body.name;
        auto.runOnce = body.runOnce;
        auto.trigger = body.trigger;
        auto.conditions = body.conditions;
        auto.actions = body.actions;
        await updateAutomation(auto);
        return { ok: true };
    } else {
        const { createAutomation } = await import("../modules/automations/automation.services.js");
        await createAutomation({
            name: body.name,
            runOnce: body.runOnce,
            trigger: body.trigger,
            conditions: body.conditions,
            actions: body.actions,
        });
        return { ok: true };
    }
};

const DAYS = [
    { value: "mon", label: "Mon" },
    { value: "tue", label: "Tue" },
    { value: "wed", label: "Wed" },
    { value: "thu", label: "Thu" },
    { value: "fri", label: "Fri" },
    { value: "sat", label: "Sat" },
    { value: "sun", label: "Sun" },
] as const;

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

export const Component = () => {
    const { data } = useLoader<AutomationEditData>();
    const navigate = useNavigate();

    if (!data.value) return null;

    const { automation, devices, irCommands } = data.value;

    const name = useSignal(automation?.name ?? "");
    const runOnce = useSignal(automation?.runOnce ?? false);

    // Trigger
    const triggerType = useSignal<string>(automation?.trigger.type ?? "schedule");
    const timerSeconds = useSignal(automation?.trigger.type === "timer" ? automation.trigger.seconds : 300);
    const scheduleTime = useSignal(automation?.trigger.type === "schedule" ? automation.trigger.time : "08:00");
    const scheduleDays = useSignal<string[]>(automation?.trigger.type === "schedule" ? automation.trigger.days : []);
    const triggerDevice = useSignal(automation?.trigger.type === "device_state" ? automation.trigger.ieeeAddress : "");
    const triggerProperty = useSignal(automation?.trigger.type === "device_state" ? automation.trigger.property : "");
    const triggerOperator = useSignal(automation?.trigger.type === "device_state" ? automation.trigger.operator : "changed");
    const triggerValue = useSignal(automation?.trigger.type === "device_state" ? String(automation.trigger.value ?? "") : "");

    // Conditions
    const conditions = useSignal<Condition[]>(automation?.conditions ?? []);

    // Actions
    const actions = useSignal<Action[]>(automation?.actions ?? []);

    // Add condition signals
    const addCondType = useSignal("device_state");
    const addCondDevice = useSignal("");
    const addCondProperty = useSignal("");
    const addCondOperator = useSignal("eq");
    const addCondValue = useSignal("");
    const addCondFrom = useSignal("00:00");
    const addCondTo = useSignal("06:00");

    // Add action signals
    const addActionType = useSignal("device_command");
    const addActionDevice = useSignal("");
    const addActionProperty = useSignal("");
    const addActionValue = useSignal("");
    const addActionIrCommand = useSignal("");

    // Editing signals
    const editingCondIndex = useSignal<number | null>(null);
    const editingActionIndex = useSignal<number | null>(null);

    const toggleDay = useCallback((day: string) => {
        const current = scheduleDays.value;
        scheduleDays.value = current.includes(day)
            ? current.filter((d) => d !== day)
            : [...current, day];
    }, []);

    const buildCondition = (): Condition | null => {
        if (addCondType.value === "time_range") {
            return { type: "time_range", from: addCondFrom.value, to: addCondTo.value };
        }
        if (!addCondDevice.value || !addCondProperty.value) return null;
        let value: any = addCondValue.value;
        if (!isNaN(Number(value)) && value !== "") value = Number(value);
        return {
            type: "device_state",
            ieeeAddress: addCondDevice.value,
            property: addCondProperty.value,
            operator: addCondOperator.value as any,
            value,
        };
    };

    const handleSaveCondition = useCallback(() => {
        const cond = buildCondition();
        if (!cond) return;

        if (editingCondIndex.value !== null) {
            const updated = [...conditions.value];
            updated[editingCondIndex.value] = cond;
            conditions.value = updated;
            editingCondIndex.value = null;
        } else {
            conditions.value = [...conditions.value, cond];
        }
    }, []);

    const startEditCondition = useCallback((index: number) => {
        const cond = conditions.value[index];
        if (!cond) return;
        editingCondIndex.value = index;

        if (cond.type === "time_range") {
            addCondType.value = "time_range";
            addCondFrom.value = cond.from;
            addCondTo.value = cond.to;
        } else {
            addCondType.value = "device_state";
            addCondDevice.value = cond.ieeeAddress;
            addCondProperty.value = cond.property;
            addCondOperator.value = cond.operator;
            addCondValue.value = String(cond.value ?? "");
        }
    }, []);

    const cancelEditCondition = useCallback(() => {
        editingCondIndex.value = null;
        addCondType.value = "device_state";
        addCondDevice.value = "";
        addCondProperty.value = "";
        addCondOperator.value = "eq";
        addCondValue.value = "";
    }, []);

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
            const cmd = irCommands.find((c) =>
                `${c.irDeviceId}:${c.commandName}` === addActionIrCommand.value
            );
            if (!cmd) return null;
            return { type: "ir_command", blasterIeee: cmd.blasterIeee, code: cmd.code };
        }
        return null;
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
    }, [irCommands]);

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
            const cmd = irCommands.find((c) => c.blasterIeee === action.blasterIeee && c.code === action.code);
            addActionIrCommand.value = cmd ? `${cmd.irDeviceId}:${cmd.commandName}` : "";
        }
    }, [irCommands]);

    const cancelEditAction = useCallback(() => {
        editingActionIndex.value = null;
        addActionType.value = "device_command";
        addActionDevice.value = "";
        addActionProperty.value = "";
        addActionValue.value = "";
        addActionIrCommand.value = "";
    }, []);

    const handleSave = useCallback(async () => {
        if (!name.value.trim()) return;

        let trigger: Trigger;
        if (triggerType.value === "timer") {
            trigger = { type: "timer", seconds: timerSeconds.value, executeAt: new Date(Date.now() + timerSeconds.value * 1000) };
        } else if (triggerType.value === "schedule") {
            trigger = { type: "schedule", time: scheduleTime.value, days: scheduleDays.value as any };
        } else {
            trigger = {
                type: "device_state",
                ieeeAddress: triggerDevice.value,
                property: triggerProperty.value,
                operator: triggerOperator.value as any,
                value: triggerValue.value || null,
            };
        }

        await action_save({
            body: {
                id: automation?.id,
                name: name.value.trim(),
                runOnce: runOnce.value,
                trigger,
                conditions: conditions.value,
                actions: actions.value,
            },
        });

        navigate("/automations");
    }, [automation]);

    const getDeviceProps = (ieee: string) => {
        return devices.find((d) => d.ieeeAddress === ieee)?.properties ?? [];
    };

    const getDeviceName = (ieee: string) => {
        return devices.find((d) => d.ieeeAddress === ieee)?.friendlyName ?? ieee;
    };

    return (
        <div>
            <Link to={Automations} class={css.backLink}>
                <ArrowLeft size={16} />
                Back to automations
            </Link>

            <h1 class={css.pageTitle}>{automation ? "Edit Automation" : "New Automation"}</h1>

            {/* Name */}
            <div class={css.inputGroup}>
                <label class={css.inputLabel}>Name</label>
                <input
                    class={css.input}
                    value={name.value}
                    onInput={(e) => { name.value = (e.target as HTMLInputElement).value; }}
                    placeholder="e.g. Turn off lights at midnight"
                />
            </div>

            {/* One-shot */}
            <div class={css.checkboxRow}>
                <input
                    type="checkbox"
                    class={css.checkbox}
                    checked={runOnce.value}
                    onChange={() => { runOnce.value = !runOnce.value; }}
                    id="runOnce"
                />
                <label class={css.checkboxLabel} for="runOnce">One-shot (run once then disable)</label>
            </div>

            {/* Trigger */}
            <div class={css.section}>
                <h2 class={css.sectionTitle}>When</h2>
                <div class={css.inputGroup}>
                    <Select
                        options={[
                            { value: "timer", label: "Timer (countdown)" },
                            { value: "schedule", label: "Schedule (time of day)" },
                            { value: "device_state", label: "Device state change" },
                        ]}
                        value={triggerType.value}
                        onChange={(v) => { triggerType.value = v; }}
                        size="small"
                    />
                </div>

                {triggerType.value === "timer" && (
                    <div class={css.inputGroup}>
                        <label class={css.inputLabel}>Minutes</label>
                        <input
                            class={css.input}
                            type="number"
                            min="1"
                            value={Math.round(timerSeconds.value / 60)}
                            onInput={(e) => { timerSeconds.value = Number((e.target as HTMLInputElement).value) * 60; }}
                        />
                    </div>
                )}

                {triggerType.value === "schedule" && (
                    <>
                        <div class={css.inputGroup}>
                            <label class={css.inputLabel}>Time</label>
                            <input
                                class={css.input}
                                type="time"
                                value={scheduleTime.value}
                                onInput={(e) => { scheduleTime.value = (e.target as HTMLInputElement).value; }}
                            />
                        </div>
                        <div class={css.inputGroup}>
                            <label class={css.inputLabel}>Days (empty = every day)</label>
                            <div class={css.daysRow}>
                                {DAYS.map((day) => (
                                    <button
                                        key={day.value}
                                        class={`${css.dayChip} ${scheduleDays.value.includes(day.value) ? css.dayChipActive : ""}`}
                                        onClick={() => toggleDay(day.value)}
                                        type="button"
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {triggerType.value === "device_state" && (
                    <div class={css.row}>
                        <div class={css.fieldSmall}>
                            <Select
                                options={[{ value: "", label: "Device..." }, ...devices.map((d) => ({ value: d.ieeeAddress, label: d.friendlyName }))]}
                                value={triggerDevice.value}
                                onChange={(v) => { triggerDevice.value = v; triggerProperty.value = ""; }}
                                size="small"
                            />
                        </div>
                        {triggerDevice.value && (
                            <div class={css.fieldSmall}>
                                <Select
                                    options={[{ value: "", label: "Property..." }, ...getDeviceProps(triggerDevice.value).map((p) => ({ value: p.property, label: resolvePropertyLabel(devices.find((d) => d.ieeeAddress === triggerDevice.value)!, p.property) }))]}
                                    value={triggerProperty.value}
                                    onChange={(v) => { triggerProperty.value = v; }}
                                    size="small"
                                />
                            </div>
                        )}
                        {triggerProperty.value && (
                            <>
                                <div class={css.fieldSmall}>
                                    <Select
                                        options={[
                                            { value: "changed", label: "Changed" },
                                            { value: "changed_to", label: "Changed to" },
                                            { value: "above", label: "Above" },
                                            { value: "below", label: "Below" },
                                        ]}
                                        value={triggerOperator.value}
                                        onChange={(v) => { triggerOperator.value = v as any; }}
                                        size="small"
                                    />
                                </div>
                                {triggerOperator.value !== "changed" && (
                                    <div class={css.fieldSmall}>
                                        {(() => {
                                            const device = devices.find((d) => d.ieeeAddress === triggerDevice.value);
                                            const options = device && triggerProperty.value ? getValueOptions(device, triggerProperty.value) : null;
                                            if (options) {
                                                return (
                                                    <Select
                                                        options={[{ value: "", label: "Value..." }, ...options]}
                                                        value={triggerValue.value}
                                                        onChange={(v) => { triggerValue.value = v; }}
                                                        size="small"
                                                    />
                                                );
                                            }
                                            return (
                                                <input
                                                    class={css.input}
                                                    placeholder="Value"
                                                    value={triggerValue.value}
                                                    onInput={(e) => { triggerValue.value = (e.target as HTMLInputElement).value; }}
                                                />
                                            );
                                        })()}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Conditions */}
            <div class={css.section}>
                <h2 class={css.sectionTitle}>Only if (optional)</h2>
                {conditions.value.map((cond, i) => (
                    <div
                        key={i}
                        class={`${css.itemCard} ${editingCondIndex.value === i ? css.itemCardEditing : ""}`}
                        onClick={() => startEditCondition(i)}
                    >
                        <div class={css.itemInfo}>
                            {cond.type === "time_range"
                                ? `Time between ${cond.from} and ${cond.to}`
                                : `${getDeviceName(cond.ieeeAddress)} ${cond.property} ${cond.operator} ${cond.value}`
                            }
                        </div>
                        <button class={css.deleteButton} onClick={(e) => { e.stopPropagation(); conditions.value = conditions.value.filter((_, j) => j !== i); editingCondIndex.value = null; }}>
                            <X size={14} />
                        </button>
                    </div>
                ))}
                {editingCondIndex.value !== null && <div class={css.editingLabel}>Editing condition {editingCondIndex.value + 1}</div>}
                <div class={css.inputGroup}>
                    <Select
                        options={[
                            { value: "device_state", label: "Device state" },
                            { value: "time_range", label: "Time range" },
                        ]}
                        value={addCondType.value}
                        onChange={(v) => { addCondType.value = v; }}
                        size="small"
                    />
                </div>
                {addCondType.value === "time_range" ? (
                    <div class={css.row}>
                        <div class={css.fieldSmall}>
                            <input class={css.input} type="time" value={addCondFrom.value} onInput={(e) => { addCondFrom.value = (e.target as HTMLInputElement).value; }} />
                        </div>
                        <div class={css.fieldSmall}>
                            <input class={css.input} type="time" value={addCondTo.value} onInput={(e) => { addCondTo.value = (e.target as HTMLInputElement).value; }} />
                        </div>
                        <button class={css.addButton} onClick={handleSaveCondition} type="button">
                            <Plus size={14} /> {editingCondIndex.value !== null ? "Update" : "Add"}
                        </button>
                        {editingCondIndex.value !== null && (
                            <button class={css.cancelEditButton} onClick={cancelEditCondition} type="button">Cancel</button>
                        )}
                    </div>
                ) : (
                    <div class={css.row}>
                        <div class={css.fieldSmall}>
                            <Select
                                options={[{ value: "", label: "Device..." }, ...devices.map((d) => ({ value: d.ieeeAddress, label: d.friendlyName }))]}
                                value={addCondDevice.value}
                                onChange={(v) => { addCondDevice.value = v; addCondProperty.value = ""; }}
                                size="small"
                            />
                        </div>
                        {addCondDevice.value && (
                            <>
                                <div class={css.fieldSmall}>
                                    <Select
                                        options={[{ value: "", label: "Property..." }, ...getDeviceProps(addCondDevice.value).map((p) => ({ value: p.property, label: resolvePropertyLabel(devices.find((d) => d.ieeeAddress === addCondDevice.value)!, p.property) }))]}
                                        value={addCondProperty.value}
                                        onChange={(v) => { addCondProperty.value = v; }}
                                        size="small"
                                    />
                                </div>
                                <div class={css.fieldSmall}>
                                    <Select
                                        options={[
                                            { value: "eq", label: "Equals" },
                                            { value: "neq", label: "Not equals" },
                                            { value: "gt", label: "Greater than" },
                                            { value: "lt", label: "Less than" },
                                        ]}
                                        value={addCondOperator.value}
                                        onChange={(v) => { addCondOperator.value = v; }}
                                        size="small"
                                    />
                                </div>
                                <div class={css.fieldSmall}>
                                    {(() => {
                                        const device = devices.find((d) => d.ieeeAddress === addCondDevice.value);
                                        const options = device && addCondProperty.value ? getValueOptions(device, addCondProperty.value) : null;
                                        if (options) {
                                            return (
                                                <Select
                                                    options={[{ value: "", label: "Value..." }, ...options]}
                                                    value={addCondValue.value}
                                                    onChange={(v) => { addCondValue.value = v; }}
                                                    size="small"
                                                />
                                            );
                                        }
                                        return <input class={css.input} placeholder="Value" value={addCondValue.value} onInput={(e) => { addCondValue.value = (e.target as HTMLInputElement).value; }} />;
                                    })()}
                                </div>
                                <button class={css.addButton} onClick={handleSaveCondition} type="button">
                                    <Plus size={14} /> Add
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div class={css.section}>
                <h2 class={css.sectionTitle}>Then</h2>
                {actions.value.map((action, i) => (
                    <div
                        key={i}
                        class={`${css.itemCard} ${editingActionIndex.value === i ? css.itemCardEditing : ""}`}
                        onClick={() => startEditAction(i)}
                    >
                        <div class={css.itemInfo}>
                            {action.type === "device_command"
                                ? `${getDeviceName(action.ieeeAddress)} → ${action.property} = ${action.value}`
                                : `IR: send code`
                            }
                        </div>
                        <button class={css.deleteButton} onClick={(e) => { e.stopPropagation(); actions.value = actions.value.filter((_, j) => j !== i); editingActionIndex.value = null; }}>
                            <X size={14} />
                        </button>
                    </div>
                ))}
                {editingActionIndex.value !== null && <div class={css.editingLabel}>Editing action {editingActionIndex.value + 1}</div>}
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
                {addActionType.value === "device_command" ? (
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
                                    <Plus size={14} /> Add
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div class={css.row}>
                        <div class={css.fieldSmall}>
                            <Select
                                options={[
                                    { value: "", label: "Select command..." },
                                    ...irCommands.map((c) => ({
                                        value: `${c.irDeviceId}:${c.commandName}`,
                                        label: `${c.irDeviceName} → ${c.commandName}`,
                                    })),
                                ]}
                                value={addActionIrCommand.value}
                                onChange={(v) => { addActionIrCommand.value = v; }}
                                size="small"
                            />
                        </div>
                        <button class={css.addButton} onClick={handleSaveAction} type="button">
                            <Plus size={14} /> {editingActionIndex.value !== null ? "Update" : "Add"}
                        </button>
                        {editingActionIndex.value !== null && (
                            <button class={css.cancelEditButton} onClick={cancelEditAction} type="button">Cancel</button>
                        )}
                    </div>
                )}
            </div>

            {/* Save */}
            <button class={css.saveButton} onClick={handleSave}>
                {automation ? "Save" : "Create"}
            </button>
        </div>
    );
};
