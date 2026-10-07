import { Application, Renderer } from "pixi.js";
import { GameScene } from "@/scenes/GameScene";

export class SceneManager {
    constructor(
        _app: Application<Renderer>,
        private readonly gameScene: GameScene,
    ) {}

    destroy() {
        this.gameScene.destroy();
    }
}
