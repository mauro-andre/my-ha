import { save, findMany, deleteMany } from "@mauroandre/zodmongo";
import type { LinkedControl } from "./linked-control.schemas.js";

const COLLECTION = "linked_controls";

export async function saveLinkedControl(control: LinkedControl) {
    await save(COLLECTION, control);
}

export async function findAllLinkedControls() {
    return findMany<LinkedControl>(COLLECTION);
}

export async function findLinkedControlById(id: string) {
    const results = await findMany<LinkedControl>(COLLECTION, { id });
    return results[0] ?? null;
}

export async function deleteLinkedControl(id: string) {
    return deleteMany(COLLECTION, { id });
}
