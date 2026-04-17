import { save, findMany, deleteMany } from "@mauroandre/zodmongo";
import type { Area } from "./area.schemas.js";

const COLLECTION = "areas";

export async function saveArea(area: Area) {
    await save(COLLECTION, area);
}

export async function findAllAreas() {
    return findMany<Area>(COLLECTION);
}

export async function findAreaById(id: string) {
    const results = await findMany<Area>(COLLECTION, { id });
    return results[0] ?? null;
}

export async function deleteArea(id: string) {
    return deleteMany(COLLECTION, { id });
}
