import { Application, Assets, Container, NineSliceSprite, Renderer, Sprite, Texture } from "pixi.js";
import Popup from "@/components/base/Popup";
import { goalLabel } from "@/components/GameControls";
import { GOAL_COLUMN_COUNT, GOAL_SLOT_COUNT } from "@/modules/game/engine/game.constants";
import { goalHistoryFaces } from "@/modules/game/engine/game.session";
import type { GoalHistoryRow } from "@/modules/game/engine/game.types";
import { gameCell } from "@/scenes/GameCells";
import { loadGameBoardArt, type GameBoardArt } from "@/scenes/GameBoardArt";
import { GOAL_INK, GOAL_KNOB_EDGE } from "@/shared/constants/goal";
import { i18n } from "@/shared/i18n/I18nManager";
import { format } from "@/shared/utils/formatNumber";
import type { MainGameLayoutMode } from "@/components/layouts";
import plateUrl from "../../../raw-assets/board{m}{copy}/popup-plate.svg";
import closeUrl from "../../../raw-assets/board{m}{copy}/popup-close.svg";

const PANEL_WIDTH = 980;
const PANEL_HEIGHT = 640;
const CLOSE_SIZE = 48;
const CELL = 72;
const GAP = 10;

export type BetHistoryDetailView = Popup & {
    setData: (row: GoalHistoryRow) => void;
    setLayout: (mode: MainGameLayoutMode) => void;
};

export function createBetHistoryDetailPopup(app: Application<Renderer>): BetHistoryDetailView {
    const view = new Popup({
        closeOnEscape: true,
        closeOnOverlay: true,
        ticker: app.ticker ?? null,
    }) as BetHistoryDetailView;

    view.label = "BetHistoryDetailPopup";
    view.zIndex = 40;
    const body = new Container();
    const grid = new Container();
    view.content.addChild(body);
    let plate: NineSliceSprite | null = null;
    let closeMark: Sprite | null = null;
    let art: GameBoardArt | null = null;
    let row: GoalHistoryRow | null = null;

    const place = () => {
        view.content.position.set(app.screen.width / 2, app.screen.height / 2);
    };

    const fitted = () => ({
        width: Math.min(PANEL_WIDTH, Math.max(360, app.screen.width - 48)),
        height: Math.min(PANEL_HEIGHT, Math.max(320, app.screen.height - 48)),
    });

    const sizePlate = (width: number, height: number) => {
        if (!plate) return;
        plate.width = width;
        plate.height = height;
        plate.position.set(-width / 2, -height / 2);
        closeMark?.position.set(width / 2 - 36, -height / 2 + 36);
    };

    const paint = () => {
        const { width, height } = fitted();
        sizePlate(width, height);
        body.removeChildren();
        if (!row) return;

        const top = -height / 2;
        body.addChild(goalLabel(row.roundId, 0, top + 48, 28, GOAL_KNOB_EDGE));
        const ending = endingLabel(row.ending);
        const summary = [
            ending,
            i18n.t("goal.betLine", { amount: format(row.bet) }),
            i18n.t("goal.winLine", { amount: format(row.win) }),
        ]
            .filter(Boolean)
            .join("   ");
        body.addChild(goalLabel(summary, 0, top + 88, 20, GOAL_INK));

        grid.removeChildren();
        if (!art) return;

        const scale = Math.min(
            1,
            (width - 80) / (GOAL_COLUMN_COUNT * (CELL + GAP)),
            (height - 180) / (GOAL_SLOT_COUNT * (CELL + GAP)),
        );
        const cell = CELL * scale;
        const gap = GAP * scale;
        const gridW = GOAL_COLUMN_COUNT * cell + (GOAL_COLUMN_COUNT - 1) * gap;
        grid.position.set(-gridW / 2, top + 120);
        const faces = goalHistoryFaces(row.board, row.turns, row.ending);
        for (let column = 0; column < GOAL_COLUMN_COUNT; column += 1) {
            for (let slot = 0; slot < GOAL_SLOT_COUNT; slot += 1) {
                const face = faces[column]?.[slot] ?? { tile: "normal" as const, mark: "none" as const };
                const x = column * (cell + gap);
                const y = slot * (cell + gap);
                grid.addChild(gameCell(art, face, x, y, cell));
            }
        }
        body.addChild(grid);
    };

    const ready = Promise.all([
        Assets.load<Texture>({ src: plateUrl, data: { resolution: 2 } }),
        Assets.load<Texture>({ src: closeUrl, data: { resolution: 2 } }),
        loadGameBoardArt(),
    ]).then(([plateTexture, closeTexture, loaded]) => {
        if (view.destroyed) return;
        art = loaded;
        plate = new NineSliceSprite({
            texture: plateTexture,
            leftWidth: 36,
            topHeight: 36,
            rightWidth: 36,
            bottomHeight: 36,
            width: PANEL_WIDTH,
            height: PANEL_HEIGHT,
        });
        view.content.addChildAt(plate, 0);
        const close = new Sprite(closeTexture);
        close.anchor.set(0.5);
        close.width = CLOSE_SIZE;
        close.height = CLOSE_SIZE;
        close.eventMode = "static";
        close.cursor = "pointer";
        close.on("pointertap", () => view.hide());
        closeMark = close;
        view.content.addChild(close);
        place();
        paint();
    });

    view.setData = (next) => {
        row = next;
        void ready.then(() => {
            if (!view.destroyed) paint();
        });
    };
    view.setLayout = () => {
        place();
        paint();
    };
    view.show = (callback) => {
        void ready.then(() => {
            if (view.destroyed) return;
            place();
            paint();
            Popup.prototype.show.call(view, callback);
        });
    };

    const onResize = () => view.setLayout("landscape");
    app.renderer.on("resize", onResize);
    view.on("destroyed", () => {
        app.renderer.off("resize", onResize);
    });
    place();
    return view;
}

function endingLabel(ending: string): string {
    if (!ending) return "";
    const key = `goal.ending.${ending}`;
    const label = i18n.t(key);
    return label === key ? ending : label;
}
