import { dbSchema } from "@mauroandre/zodmongo";
import { z } from "zod/v4";

export const areaSchema = dbSchema({
    name: z.string(),
    icon: z.string().nullable().optional(),
    order: z.number().nullable().optional(),
});

export type Area = z.infer<typeof areaSchema>;
