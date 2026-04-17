import { areaSchema } from "./area.schemas.js";
import type { Area } from "./area.schemas.js";
import * as repo from "./area.repository.js";

let areasCache: Area[] = [];

export async function loadAreas() {
    areasCache = await repo.findAllAreas();
    console.log(`[areas] ${areasCache.length} areas loaded`);
}

export async function createArea(name: string, icon?: string) {
    const area = areaSchema.parse({
        id: null,
        createdAt: null,
        updatedAt: null,
        name,
        icon: icon ?? null,
    });

    await repo.saveArea(area);
    areasCache.push(area);
    return area;
}

export function getAllAreas() {
    return areasCache;
}

export async function getArea(id: string) {
    return areasCache.find((a) => a.id === id) ?? null;
}

export async function renameArea(id: string, name: string) {
    const area = areasCache.find((a) => a.id === id);
    if (!area) return null;
    area.name = name;
    await repo.saveArea(area);
    return area;
}

export async function setAreaIcon(id: string, icon: string) {
    const area = areasCache.find((a) => a.id === id);
    if (!area) return null;
    area.icon = icon;
    await repo.saveArea(area);
    return area;
}

export async function deleteArea(id: string) {
    await repo.deleteArea(id);
    areasCache = areasCache.filter((a) => a.id !== id);
}
