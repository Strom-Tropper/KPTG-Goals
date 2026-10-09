import { Application, Assets, Container, NineSliceSprite, Renderer, Sprite, Texture } from "pixi.js";
import Popup from "@/components/base/Popup";
import { goalLabel, labeledButton, type ButtonSkin } from "@/components/GameControls";
import { GOAL_EXPLODE, GOAL_INK, GOAL_KNOB_EDGE } from "@/shared/constants/goal";
import { i18n } from "@/shared/i18n/I18nManager";
import { format } from "@/shared/utils/formatNumber";
import type { GoalRoundResult } from "@/modules/game/engine/game.types";
import plateUrl from "../../raw-assets/board{m}{copy}/popup-plate.svg";
import closeUrl from "../../raw-assets/board{m}{copy}/popup-close.svg";
import buttonFaceUrl from "../../raw-assets/board{m}{copy}/button-face.svg";
import buttonFaceHoverUrl from "../../raw-assets/board{m}{copy}/button-face-hover.svg";
import buttonFaceActiveUrl from "../../raw-assets/board{m}{copy}/button-face-active.svg";

const PLATE_WIDTH = 640;
const NOTICE_HEIGHT = 280;
const RESULT_HEIGHT = 420;
const CLOSE_SIZE = 48;
const MESSAGE_SIZE = 22;
const BUTTON_WIDTH = 160;
const BUTTON_HEIGHT = 52;
const BUTTON_GAP = 24;

export class GameNoticePopup extends Popup {
    private static instance: GameNoticePopup | null = null;
    private readonly app: Application<Renderer>;
    private readonly body = new Container();
    private plate: NineSliceSprite | null = null;
    private closeMark: Sprite | null = null;
    private skin: ButtonSkin | null = null;
    private ready: Promise<void> | null = null;

    private constructor(app: Application<Renderer>) {
        super({
            closeOnEscape: true,
            closeOnOverlay: true,
            ticker: app.ticker ?? null,
        });

        this.app = app;
        this.label = "GameNoticePopup";
        this.zIndex = 20;
        this.content.addChild(this.body);
        this.place();
        this.app.renderer.on("resize", this.place);
    }

    static show(app: Application<Renderer>, message: string): void {
        const popup = GameNoticePopup.open(app);
        void popup.paint().then(() => {
            popup.fillNotice(message);
            popup.show();
        });
    }

    static showResult(app: Application<Renderer>, result: GoalRoundResult): void {
        const popup = GameNoticePopup.open(app);
        void popup.paint().then(() => {
            popup.fillResult(result);
            popup.show();
        });
    }

    static close(): void {
        const popup = GameNoticePopup.instance;
        if (!popup) return;

        popup.app.renderer.off("resize", popup.place);
        popup.destroy();
        GameNoticePopup.instance = null;
    }

    private static open(app: Application<Renderer>): GameNoticePopup {
        const popup = GameNoticePopup.instance ?? new GameNoticePopup(app);
        GameNoticePopup.instance = popup;
        if (!popup.parent) app.stage.addChild(popup);
        popup.place();
        return popup;
    }

    private paint(): Promise<void> {
        if (this.ready) return this.ready;

        this.ready = Promise.all([
            Assets.load<Texture>({ src: plateUrl, data: { resolution: 2 } }),
            Assets.load<Texture>({ src: closeUrl, data: { resolution: 2 } }),
            Assets.load<Texture>({ src: buttonFaceUrl, data: { resolution: 2 } }),
            Assets.load<Texture>({ src: buttonFaceHoverUrl, data: { resolution: 2 } }),
            Assets.load<Texture>({ src: buttonFaceActiveUrl, data: { resolution: 2 } }),
        ]).then(([plateTexture, closeTexture, face, hover, active]) => {
            if (this.destroyed) return;

            const slice = 36;
            const plate = new NineSliceSprite({
                texture: plateTexture,
                leftWidth: slice,
                topHeight: slice,
                rightWidth: slice,
                bottomHeight: slice,
                width: PLATE_WIDTH,
                height: NOTICE_HEIGHT,
            });
            plate.position.set(-PLATE_WIDTH / 2, -NOTICE_HEIGHT / 2);
            this.plate = plate;
            this.skin = { normal: face, hover, active: face };
            this.content.addChildAt(plate, 0);

            const close = new Sprite(closeTexture);
            close.anchor.set(0.5);
            close.width = CLOSE_SIZE;
            close.height = CLOSE_SIZE;
            close.position.set(PLATE_WIDTH / 2 - 36, -NOTICE_HEIGHT / 2 + 36);
            close.eventMode = "static";
            close.cursor = "pointer";
            close.on("pointertap", () => this.hide());
            this.closeMark = close;
            this.content.addChild(close);
        });
        return this.ready;
    }

    private fillNotice(message: string): void {
        this.sizePlate(NOTICE_HEIGHT);
        this.body.removeChildren();
        const text = goalLabel(message, 0, -36, MESSAGE_SIZE, GOAL_INK);
        text.style.wordWrap = true;
        text.style.wordWrapWidth = PLATE_WIDTH - 160;
        this.body.addChild(text);
        if (!this.skin) return;

        const row = BUTTON_WIDTH * 2 + BUTTON_GAP;
        const x = -row / 2;
        const y = 28;
        this.body.addChild(
            labeledButton(x, y, BUTTON_WIDTH, BUTTON_HEIGHT, [i18n.t("goal.ok")], true, () => this.hide(), false, this.skin),
        );
        this.body.addChild(
            labeledButton(
                x + BUTTON_WIDTH + BUTTON_GAP,
                y,
                BUTTON_WIDTH,
                BUTTON_HEIGHT,
                [i18n.t("goal.cancel")],
                true,
                () => this.hide(),
                false,
                this.skin,
            ),
        );
    }

    private fillResult(result: GoalRoundResult): void {
        this.sizePlate(RESULT_HEIGHT);
        this.body.removeChildren();
        const tone = result.won ? GOAL_KNOB_EDGE : GOAL_EXPLODE;
        const amount = format(result.amount);
        const signed = result.won ? `+${amount}` : `-${amount}`;
        this.body.addChild(
            goalLabel(i18n.t(result.won ? "goal.winTitle" : "goal.loseTitle"), 0, -130, 40, tone),
            goalLabel(i18n.t("goal.betLine", { amount: format(result.bet) }), 0, -52, 26, GOAL_INK),
            goalLabel(
                i18n.t(result.won ? "goal.winLine" : "goal.loseLine", { amount: signed }),
                0,
                -8,
                26,
                tone,
            ),
            goalLabel(i18n.t("goal.balanceLine", { amount: format(result.balance) }), 0, 36, 26, GOAL_INK),
        );
        if (!this.skin) return;

        this.body.addChild(
            labeledButton(
                -BUTTON_WIDTH / 2,
                88,
                BUTTON_WIDTH,
                BUTTON_HEIGHT,
                [i18n.t("goal.close")],
                true,
                () => this.hide(),
                false,
                this.skin,
            ),
        );
    }

    private sizePlate(height: number): void {
        if (!this.plate) return;

        this.plate.height = height;
        this.plate.position.set(-PLATE_WIDTH / 2, -height / 2);
        this.closeMark?.position.set(PLATE_WIDTH / 2 - 36, -height / 2 + 36);
    }

    private readonly place = (): void => {
        this.content.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
    };
}
