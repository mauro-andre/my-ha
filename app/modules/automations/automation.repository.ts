import { save, findMany, deleteMany } from "@mauroandre/zodmongo";
import type { Automation } from "./automation.schemas.js";

const COLLECTION = "automations";

export async function saveAutomation(automation: Automation) {
    await save(COLLECTION, automation);
}

export async function findAllAutomations() {
    return findMany<Automation>(COLLECTION);
}

export async function findAutomationById(id: string) {
    const results = await findMany<Automation>(COLLECTION, { id });
    return results[0] ?? null;
}

export async function deleteAutomation(id: string) {
    return deleteMany(COLLECTION, { id });
}
