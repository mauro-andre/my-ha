import { embeddedSchema } from "@mauroandre/zodmongo";
import { z } from "zod/v4";

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

export const actionSchema = z.union([deviceCommandActionSchema, irCommandActionSchema]);

export type DeviceCommandAction = z.infer<typeof deviceCommandActionSchema>;
export type IrCommandAction = z.infer<typeof irCommandActionSchema>;
export type Action = z.infer<typeof actionSchema>;
