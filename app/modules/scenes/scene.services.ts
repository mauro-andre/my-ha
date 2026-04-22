import { sceneSchema } from "./scene.schemas.js";
import type { Scene } from "./scene.schemas.js";
import type { Action } from "../actions/action.schemas.js";
import * as repo from "./scene.repository.js";
import { getArea } from "../areas/area.services.js";
import { runActions } from "../actions/action.services.js";

export async function getAllScenes() {
    return repo.findAllScenes();
}

export async function getScene(id: string) {
    return repo.findSceneById(id);
}

export async function createScene(data: {
    name: string;
    icon?: string | null;
    areaId?: string | null;
    actions?: Action[];
}) {
    const area = data.areaId ? await getArea(data.areaId) : null;

    const scene = sceneSchema.parse({
        id: null,
        createdAt: null,
        updatedAt: null,
        name: data.name,
        icon: data.icon ?? null,
        area,
        order: null,
        actions: data.actions ?? [],
    });

    await repo.saveScene(scene);
    return scene;
}

export async function updateScene(scene: Scene) {
    await repo.saveScene(scene);
    return scene;
}

export async function setSceneArea(id: string, areaId: string | null) {
    const scene = await repo.findSceneById(id);
    if (!scene) return null;
    scene.area = areaId ? await getArea(areaId) : null;
    await repo.saveScene(scene);
    return scene;
}

export async function deleteScene(id: string) {
    await repo.deleteScene(id);
}

export async function runScene(id: string) {
    const scene = await repo.findSceneById(id);
    if (!scene) {
        console.warn(`[scenes] runScene: scene ${id} not found`);
        return;
    }
    console.log(`[scenes] Running "${scene.name}"`);
    runActions(scene.actions);
}
