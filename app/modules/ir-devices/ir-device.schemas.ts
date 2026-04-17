import { dbSchema, embeddedSchema } from "@mauroandre/zodmongo";
import { z } from "zod/v4";

export const irCommandSchema = embeddedSchema({
    name: z.string(),
    code: z.string(),
    blasterIeee: z.string(),
});

export type IrCommand = z.infer<typeof irCommandSchema>;

export const irDeviceSchema = dbSchema({
    name: z.string(),
    blasters: z.array(z.string()), // IEEE addresses of IR blasters
    commands: z.array(irCommandSchema),
    areaId: z.string().nullable().optional(),
    icon: z.string().nullable().optional(),
    order: z.number().nullable().optional(),
});

export type IrDevice = z.infer<typeof irDeviceSchema>;
