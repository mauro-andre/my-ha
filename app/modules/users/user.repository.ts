import { save, findMany, deleteMany } from "@mauroandre/zodmongo";
import type { User } from "./user.schemas.js";

const COLLECTION = "users";

export async function saveUser(user: User) {
    await save(COLLECTION, user);
}

export async function findAllUsers() {
    return findMany<User>(COLLECTION);
}

export async function findUserById(id: string) {
    const results = await findMany<User>(COLLECTION, { id });
    return results[0] ?? null;
}

export async function findUserByEmail(email: string) {
    const results = await findMany<User>(COLLECTION, { email });
    return results[0] ?? null;
}

export async function deleteUser(id: string) {
    return deleteMany(COLLECTION, { id });
}
