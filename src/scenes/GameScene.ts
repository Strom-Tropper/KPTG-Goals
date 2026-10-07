import { Application, Container, Graphics, Renderer } from "pixi.js";
import type { Scene } from "@/scenes/Scene";
import { drawGraphicsRect } from "@/shared/utils/drawGrapicsRect";
import { createText, FONT_FAMILY } from "@/shared/utils/text/createText";

const FIELD_COLOR = 0x2f8f3c;

export class GameScene implements Scene {
    private readonly app: Application<Renderer>;
    private readonly root = new Container();
    private readonly field = new Graphics();
    private readonly title = createText({
        text: "GOAL",
        fontFamily: FONT_FAMILY.EB_GARAMOND,
        fontSize: 72,
        fill: 0xffffff,
        align: "center",
    });
    private destroyed = false;

    constructor(
        app: Application<Renderer>,
        _token: string,
        _initialLanguage: string,
        _audioUrls: ReadonlyMap<string, string>,
    ) {
        this.app = app;
        this.root.label = "GoalScene";
        this.field.label = "GoalField";
        this.title.anchor.set(0.5);
        this.root.addChild(this.field, this.title);
        this.app.stage.addChild(this.root);
        this.layout();
        this.app.renderer.on("resize", this.layout);
    }

    pause(): void {}

    resume(): void {}

    destroy(): void {
        if (this.destroyed) return;

        this.destroyed = true;
        this.app.renderer.off("resize", this.layout);
        this.root.destroy({ children: true });
    }

    private layout = (): void => {
        const width = this.app.screen.width;
        const height = this.app.screen.height;

        drawGraphicsRect(
            this.field,
            { left: 0, top: 0, width, height },
            FIELD_COLOR,
        );
        this.title.position.set(width / 2, height / 2);
    };
}
