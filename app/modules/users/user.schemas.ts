import { dbSchema } from "@mauroandre/zodmongo";
import { z } from "zod/v4";

export const userRoleEnum = z.enum(["master", "user"]);
export type UserRole = z.infer<typeof userRoleEnum>;

export const userSchema = dbSchema({
    email: z.string().email(),
    passwordHash: z.string(),
    name: z.string(),
    role: userRoleEnum,
});

export type User = z.infer<typeof userSchema>;

export const publicUserSchema = z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    role: userRoleEnum,
});

export type PublicUser = z.infer<typeof publicUserSchema>;
