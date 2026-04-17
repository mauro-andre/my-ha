import { dbSchema, embeddedSchema } from "@mauroandre/zodmongo";
import { z } from "zod/v4";

// --- Triggers ---

const timerTriggerSchema = embeddedSchema({
    type: z.literal("timer"),
    seconds: z.number(),
    executeAt: z.date(),
});

const scheduleTriggerSchema = embeddedSchema({
    type: z.literal("schedule"),
    time: z.string(), // "HH:MM"
    days: z.array(z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"])),
});

const deviceStateTriggerSchema = embeddedSchema({
    type: z.literal("device_state"),
    ieeeAddress: z.string(),
    property: z.string(),
    operator: z.enum(["changed", "changed_to", "changed_from", "above", "below"]),
    value: z.any().nullable().optional(),
});

const triggerSchema = z.union([timerTriggerSchema, scheduleTriggerSchema, deviceStateTriggerSchema]);

export type Trigger = z.infer<typeof triggerSchema>;
export type TimerTrigger = z.infer<typeof timerTriggerSchema>;
export type ScheduleTrigger = z.infer<typeof scheduleTriggerSchema>;
export type DeviceStateTrigger = z.infer<typeof deviceStateTriggerSchema>;

// --- Conditions ---

const deviceStateConditionSchema = embeddedSchema({
    type: z.literal("device_state"),
    ieeeAddress: z.string(),
    property: z.string(),
    operator: z.enum(["eq", "neq", "gt", "lt", "gte", "lte"]),
    value: z.any(),
});

const timeRangeConditionSchema = embeddedSchema({
    type: z.literal("time_range"),
    from: z.string(), // "HH:MM"
    to: z.string(),   // "HH:MM"
});

const conditionSchema = z.union([deviceStateConditionSchema, timeRangeConditionSchema]);

export type Condition = z.infer<typeof conditionSchema>;
export type DeviceStateCondition = z.infer<typeof deviceStateConditionSchema>;
export type TimeRangeCondition = z.infer<typeof timeRangeConditionSchema>;

// --- Actions ---

const deviceCommandActionSchema = embeddedSchema({
    type: z.literal("device_command"),
    ieeeAddress: z.string(),
    property: z.string(),
    value: z.any(),
});

const irCommandActionSchema = embeddedSchema({
    type: z.literal("ir_command"),
    blasterIeee: z.string(),
    code: z.string(),
});

const actionSchema = z.union([deviceCommandActionSchema, irCommandActionSchema]);

export type Action = z.infer<typeof actionSchema>;

// --- Automation ---

export const automationSchema = dbSchema({
    name: z.string(),
    enabled: z.boolean(),
    runOnce: z.boolean(),
    trigger: triggerSchema,
    conditions: z.array(conditionSchema),
    actions: z.array(actionSchema),
    lastTriggeredAt: z.date().nullable().optional(),
    triggerCount: z.number(),
});

export type Automation = z.infer<typeof automationSchema>;
