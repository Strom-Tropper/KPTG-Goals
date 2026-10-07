import { Rectangle, Sprite, Texture } from "pixi.js";
import { syncCanvasCursor } from "@/shared/utils/syncCanvasCursor";

export type ButtonTextureStates = {
    normal: Texture;
    hover?: Texture;
    pressed?: Texture;
    disabled?: Texture;
};

export class Button extends Sprite {
    private normalTexture: Texture;
    private hoverTexture: Texture;
    private pressedTexture: Texture;
    private disabledTexture?: Texture;
    private isEnabled: boolean = true;

    constructor(textures: ButtonTextureStates, initialEnabled = true) {
        super(textures.normal);

        this.normalTexture = textures.normal;
        this.hoverTexture = textures.hover ?? textures.normal;
        this.pressedTexture = textures.pressed ?? textures.normal;
        this.disabledTexture = textures.disabled;

        this.setupHitArea();
        this.setupEventListeners();
        this.setEnabled(initialEnabled);
    }

    private setupHitArea(): void {
        const bounds = this.getLocalBounds();
        this.hitArea = new Rectangle(
            bounds.x,
            bounds.y,
            bounds.width,
            bounds.height,
        );
    }

    private setupEventListeners(): void {
        this.on("pointerover", () => {
            if (!this.isEnabled) return;
            this.texture = this.hoverTexture;
        })
            .on("pointerout", () => {
                if (!this.isEnabled) return;
                this.texture = this.normalTexture;
            })
            .on("pointerdown", () => {
                if (!this.isEnabled) return;
                this.texture = this.pressedTexture;
            })
            .on("pointerup", () => {
                if (!this.isEnabled) return;
                this.texture = this.hoverTexture;
            })
            .on("pointerupoutside", () => {
                if (!this.isEnabled) return;
                this.texture = this.normalTexture;
            })
            .on("pointercancel", () => {
                if (!this.isEnabled) return;
                this.texture = this.normalTexture;
            });
    }

    private applyRestingTexture(): void {
        if (!this.isEnabled && this.disabledTexture) {
            this.texture = this.disabledTexture;
            return;
        }
        this.texture = this.normalTexture;
    }

    public setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
        this.eventMode = enabled ? "static" : "none";
        this.interactive = enabled;
        this.cursor = enabled ? "pointer" : "not-allowed";
        this.applyRestingTexture();
        syncCanvasCursor();
    }

    public setTextures(textures: ButtonTextureStates): void {
        this.normalTexture = textures.normal;
        this.hoverTexture = textures.hover ?? textures.normal;
        this.pressedTexture = textures.pressed ?? textures.normal;
        this.disabledTexture = textures.disabled;
        this.applyRestingTexture();
    }

    public getIsEnabled(): boolean {
        return this.isEnabled;
    }

    public resetVisualState(): void {
        this.applyRestingTexture();
    }

    public updateHitArea(): void {
        const bounds = this.getLocalBounds();
        this.hitArea = new Rectangle(
            bounds.x,
            bounds.y,
            bounds.width,
            bounds.height,
        );
    }
}
