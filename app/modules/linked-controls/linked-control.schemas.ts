import { dbSchema, embeddedSchema } from "@mauroandre/zodmongo";
import { z } from "zod/v4";

export const linkedMemberSchema = embeddedSchema({
    ieeeAddress: z.string(),
    property: z.string(),
});

export type LinkedMember = z.infer<typeof linkedMemberSchema>;

export const linkedControlSchema = dbSchema({
    name: z.string(),
    capabilityKind: z.string(),
    members: z.array(linkedMemberSchema),
});

export type LinkedControl = z.infer<typeof linkedControlSchema>;
