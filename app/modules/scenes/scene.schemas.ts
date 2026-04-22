import { dbSchema, relation } from "@mauroandre/zodmongo";
import { z } from "zod/v4";
import { actionSchema } from "../actions/action.schemas.js";
import { areaSchema } from "../areas/area.schemas.js";

export const sceneSchema = dbSchema({
    name: z.string(),
    icon: z.string().nullable().optional(),
    area: relation(areaSchema, { collection: "areas" }).nullable().optional(),
    order: z.number().nullable().optional(),
    actions: z.array(actionSchema),
});

export type Scene = z.infer<typeof sceneSchema>;
