import { gameAssets } from "@/modules/game/engine/game.assets";
import { Texture } from "pixi.js";

export function getLocalizationTexture(textureName: string) {
    return gameAssets.Localization?.textures[textureName] ?? Texture.EMPTY;
}
