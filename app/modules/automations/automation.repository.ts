import { save, findMany, deleteMany, getPipeline, toSave } from "@mauroandre/zodmongo";
import { automationSchema } from "./automation.schemas.js";
import type { Automation } from "./automation.schemas.js";

const COLLECTION = "automations";

export async function saveAutomation(automation: Automation) {
    const prepared = toSave(automationSchema, automation);
    await save(COLLECTION, prepared);
    if (prepared.id && !automation.id) automation.id = prepared.id;
}

export async function findAllAutomations() {
    return findMany<Automation>(COLLECTION, getPipeline(automationSchema));
}

export async function findAutomationById(id: string) {
    const results = await findMany<Automation>(COLLECTION, [{ $match: { id } }, ...getPipeline(automationSchema)]);
    return results[0] ?? null;
}

export async function deleteAutomation(id: string) {
    return deleteMany(COLLECTION, { id });
}
