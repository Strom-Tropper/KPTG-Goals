import { Spritesheet } from "pixi.js";

type GameAssetStore = {
    Localization: Spritesheet;
};

export const gameAssets = {} as GameAssetStore;

export async function PreloadAssets(onProgress?: (progress: number) => void) {
    onProgress?.(1);
    return new Map<string, string>();
}
