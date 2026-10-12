import { Application, Assets, Container, Graphics, NineSliceSprite, Renderer, Sprite, Texture } from "pixi.js";
import Popup from "@/components/base/Popup";
import { goalLabel, labeledButton, type ButtonSkin } from "@/components/GameControls";
import { GOAL_EVENT_NAMES, goalEvents } from "@/modules/game/engine/game.events";
import type { GoalHistoryPage, GoalHistoryRow } from "@/modules/game/engine/game.types";
import { gameRequests } from "@/modules/game/handlers/game.requests";
import { audioSystem } from "@/systems/audio";
import { GOAL_INK, GOAL_INK_MUTED, GOAL_KNOB_EDGE, GOAL_MENU_ROW } from "@/shared/constants/goal";
import { i18n } from "@/shared/i18n/I18nManager";
import { format } from "@/shared/utils/formatNumber";
import { getPaginationModel } from "@/shared/utils/pagination";
import type { MainGameLayoutMode } from "@/components/layouts";
import { createBetHistoryDetailPopup } from "./BetHistoryDetailPopup";
import plateUrl from "../../../raw-assets/board{m}{copy}/popup-plate.svg";
import closeUrl from "../../../raw-assets/board{m}{copy}/popup-close.svg";
import buttonFaceUrl from "../../../raw-assets/board{m}{copy}/button-face.svg";
import buttonFaceHoverUrl from "../../../raw-assets/board{m}{copy}/button-face-hover.svg";
import buttonFaceActiveUrl from "../../../raw-assets/board{m}{copy}/button-face-active.svg";

const PANEL_WIDTH = 920;
const PANEL_HEIGHT = 560;
const CLOSE_SIZE = 48;
const HISTORY_LIMIT = 10;
const PAGE_BUTTON = 40;

export type BetHistoryView = Popup & {
    showImmediately: () => void;
    initialData: () => void;
    setLayout: (mode: MainGameLayoutMode) => void;
    setSwitchHandler: (handler: () => void) => void;
};

export function createBetHistoryPopup(app: Application<Renderer>): BetHistoryView {
    const view = new Popup({
        closeOnEscape: true,
        closeOnOverlay: true,
        ticker: app.ticker ?? null,
    }) as BetHistoryView;

    view.label = "BetHistoryView";
    view.zIndex = 30;
    const body = new Container();
    view.content.addChild(body);
    const detail = createBetHistoryDetailPopup(app);
    let plate: NineSliceSprite | null = null;
    let closeMark: Sprite | null = null;
    let skin: ButtonSkin | null = null;
    let page: GoalHistoryPage | null = null;
    let requestPage = 0;

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

    const request = (next: number) => {
        requestPage = next;
        if (!gameRequests.RequestBetHistory(next, HISTORY_LIMIT)) {
            page = { rows: [], total: 0, page: next, limit: HISTORY_LIMIT };
            paint();
        }
    };

    const openRow = (row: GoalHistoryRow) => {
        void audioSystem.play("sfx_btn", { singleInstance: true });
        detail.setData(row);
        if (!detail.parent) app.stage.addChild(detail);
        detail.show();
    };

    const paint = () => {
        const { width, height } = fitted();
        sizePlate(width, height);
        body.removeChildren();
        const top = -height / 2;
        body.addChild(goalLabel(i18n.t("betHistory.title"), 0, top + 52, 36, GOAL_KNOB_EDGE));

        const columns = [
            i18n.t("betHistory.roundId"),
            i18n.t("betHistory.time"),
            i18n.t("betHistory.totalBet"),
            i18n.t("betHistory.totalWin"),
        ];
        const span = width - 80;
        const barY = top + 88;
        const bar = new Graphics();
        bar.roundRect(-span / 2, barY, span, 44, 8).fill({ color: GOAL_MENU_ROW });
        body.addChild(bar);
        columns.forEach((label, index) => {
            const x = -span / 2 + (span / columns.length) * (index + 0.5);
            body.addChild(goalLabel(label, x, barY + 22, 18, GOAL_INK));
            if (index === 0) return;
            const rule = new Graphics();
            rule.eventMode = "none";
            const ruleX = -span / 2 + (span / columns.length) * index;
            rule.moveTo(ruleX, barY + 8)
                .lineTo(ruleX, height / 2 - 80)
                .stroke({ color: GOAL_KNOB_EDGE, width: 1 });
            body.addChild(rule);
        });
        if (!page) return;

        const limit = Math.max(1, page.limit || HISTORY_LIMIT);
        const totalPages = Math.max(1, Math.ceil(page.total / limit));
        const pagerSpace = totalPages > 1 ? 52 : 0;
        const offset = Math.max(0, page.page - 1) * limit;
        const windowRows = page.rows.length > limit ? page.rows.slice(offset, offset + limit) : page.rows;
        if (windowRows.length === 0) {
            body.addChild(goalLabel(i18n.t("betHistory.empty"), 0, 24, 22, GOAL_INK_MUTED));
        } else if (skin) {
            const firstY = barY + 52;
            const step = 36;
            const room = Math.max(1, Math.floor((height / 2 - 28 - pagerSpace - firstY) / step));
            windowRows.slice(0, room).forEach((row, index) => {
                const y = firstY + index * step;
                const values = [row.roundId, row.time, format(row.bet), format(row.win)];
                body.addChild(
                    labeledButton(
                        -span / 2,
                        y,
                        span,
                        step - 4,
                        [],
                        true,
                        () => openRow(row),
                        false,
                        skin ?? undefined,
                    ),
                );
                values.forEach((value, column) => {
                    const x = -span / 2 + (span / columns.length) * (column + 0.5);
                    const label = goalLabel(value, x, y + (step - 4) / 2, 16, GOAL_INK);
                    label.eventMode = "none";
                    body.addChild(label);
                });
            });
        }
        if (totalPages > 1 && skin) paintPager(height, totalPages, Math.max(1, page.page));
    };

    const paintPager = (height: number, totalPages: number, current: number) => {
        if (!skin) return;
        const model = getPaginationModel(totalPages, current);
        const gap = 8;
        const rowWidth = model.length * PAGE_BUTTON + (model.length - 1) * gap;
        let x = -rowWidth / 2;
        const y = height / 2 - 56;
        model.forEach((item) => {
            if (typeof item !== "number") {
                body.addChild(goalLabel("...", x + PAGE_BUTTON / 2, y + PAGE_BUTTON / 2, 18, GOAL_INK_MUTED));
            } else {
                const shown = item;
                body.addChild(
                    labeledButton(
                        x,
                        y,
                        PAGE_BUTTON,
                        PAGE_BUTTON,
                        [String(shown)],
                        shown !== current,
                        () => {
                            void audioSystem.play("sfx_btn", { singleInstance: true });
                            request(shown);
                        },
                        false,
                        skin as ButtonSkin,
                    ),
                );
            }
            x += PAGE_BUTTON + gap;
        });
    };

    const ready = Promise.all([
        Assets.load<Texture>({ src: plateUrl, data: { resolution: 2 } }),
        Assets.load<Texture>({ src: closeUrl, data: { resolution: 2 } }),
        Assets.load<Texture>({ src: buttonFaceUrl, data: { resolution: 2 } }),
        Assets.load<Texture>({ src: buttonFaceHoverUrl, data: { resolution: 2 } }),
        Assets.load<Texture>({ src: buttonFaceActiveUrl, data: { resolution: 2 } }),
    ]).then(([plateTexture, closeTexture, face, hover, active]) => {
        if (view.destroyed) return;
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
        skin = { normal: face, hover, active };
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

    const stopHistory = goalEvents.on(GOAL_EVENT_NAMES.BET_HISTORY, (payload) => {
        const next = payload as GoalHistoryPage;
        if (next.page !== requestPage && next.page !== 0) return;
        page = { ...next, page: requestPage };
        paint();
    });

    view.showImmediately = () => {
        void ready.then(() => {
            if (view.destroyed) return;
            place();
            view.show();
        });
    };
    view.initialData = () => {
        page = null;
        paint();
        request(1);
    };
    view.setLayout = () => {
        place();
        detail.setLayout("landscape");
        paint();
    };
    const hideList = view.hide.bind(view);
    view.hide = (options) => {
        detail.hide({ animated: false });
        hideList(options);
    };
    view.setSwitchHandler = (_handler) => undefined;
    const onResize = () => view.setLayout("landscape");
    app.renderer.on("resize", onResize);
    view.on("destroyed", () => {
        stopHistory();
        app.renderer.off("resize", onResize);
        detail.destroy();
    });
    place();
    return view;
}
