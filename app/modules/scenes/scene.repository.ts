import { save, findMany, deleteMany, getPipeline, toSave } from "@mauroandre/zodmongo";
import { sceneSchema } from "./scene.schemas.js";
import type { Scene } from "./scene.schemas.js";

const COLLECTION = "scenes";

export async function saveScene(scene: Scene) {
    const prepared = toSave(sceneSchema, scene);
    await save(COLLECTION, prepared);
    if (prepared.id && !scene.id) scene.id = prepared.id;
}

export async function findAllScenes() {
    return findMany<Scene>(COLLECTION, getPipeline(sceneSchema));
}

export async function findSceneById(id: string) {
    const results = await findMany<Scene>(COLLECTION, [{ $match: { id } }, ...getPipeline(sceneSchema)]);
    return results[0] ?? null;
}

export async function deleteScene(id: string) {
    return deleteMany(COLLECTION, { id });
}
