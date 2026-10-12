// import {
//     Application,
//     Container,
//     FederatedPointerEvent,
//     FederatedWheelEvent,
//     FillGradient,
//     Graphics,
//     Rectangle,
//     Renderer,
//     Sprite,
//     Text,
//     Texture,
// } from "pixi.js";
//
// import { Button, type ButtonTextureStates } from "../../base/Button";
// import Popup from "../../base/Popup";
// import { gameAssets } from "@/modules/game/engine/game.assets";
// import { EVENT_NAMES, eventBus } from "@/modules/game/engine/game.events";
// import type {
//     BetHistoryItem,
//     BetHistoryKind,
//     BetHistoryTicket,
//     WinLine,
// } from "@/modules/game/engine/game.types";
// import { format } from "@/shared/utils/formatNumber";
// import { i18n } from "@/shared/i18n/I18nManager";
// import { createScalePulseAnimation } from "@/shared/utils/createScalePulseAnimation";
// import { createText, FONT_FAMILY } from "@/shared/utils/text/createText";
// import {
//     createDotsSprite,
//     getPaginationModel,
// } from "@/shared/utils/pagination";
// import { createRadialBoardView } from "../SpinTable/view";
// import { applyBoardToRings, toRadialBoard } from "../SpinTable/helpers";
// import type { RadialRingState } from "../SpinTable/types";
// import type { MainGameLayoutMode } from "../layouts";
//
// const VALUE_COLOR = 0x302d18;
// const COPIED_TEXT_VISIBLE_MS = 900;
// const COPY_ICON_GAP = 12;
// const BACK_BUTTON_HIT_AREA_PADDING = 24;
// const PAGE_BUTTON_SPACING = 63;
// const PAGINATION_BACKGROUND_SCALE = 0.6;
// const WIN_SYMBOL_GAP = 0;
// const WIN_LINE_SCROLLBAR_TRACK_WIDTH = 12;
// const WIN_LINE_SCROLLBAR_THUMB_WIDTH = 9;
// const WIN_LINE_SCROLLBAR_MIN_THUMB_HEIGHT = 28;
// const WIN_LINE_SCROLLBAR_HIT_WIDTH = 40;
// const WIN_LINE_SCROLL_STEP = 48;
//
// type Point = readonly [number, number];
// type InfoKey = "roundId" | "time" | "totalBet" | "totalWin" | "jackpotWin";
// type InfoNodes = { container: Container; label: Text; value: Text };
// type LayoutMetrics = {
//     back: Point;
//     close: Point;
//     contentCenter: Point;
//     info: Record<InfoKey, Point>;
//     infoValueGap: number;
//     jackpotSeal: Point;
//     jackpotSealVisible: boolean;
//     labelFontSize: number;
//     pagination: Point;
//     panelHeight: number;
//     panelWidth: number;
//     panelY: number;
//     resultTitle: Point;
//     resultTitleMaxWidth: number;
//     titleFontSize: number;
//     titleFrameWidth: number;
//     titleGollumY: number;
//     titleTextOffsetY: number;
//     titleX: number;
//     titleY: number;
//     valueFontSize: number;
//     valueMaxWidth: number;
//     wheel: Point;
//     wheelScale: number;
//     winLineColumns: number;
//     winLineColumnGap: number;
//     winLineRowGap: number;
//     winLineScrollbarHeight: number;
//     miniWinLineOffsetX: number;
//     winLines: Point;
//     winLinesViewport: Rectangle;
// };
//
// const LAYOUTS: Record<MainGameLayoutMode, LayoutMetrics> = {
//     landscape: {
//         back: [-605, -225],
//         close: [675, -283],
//         contentCenter: [960, 540],
//         info: {
//             roundId: [-425, -146],
//             time: [-425, -28],
//             totalBet: [-425, 92],
//             totalWin: [-425, 210],
//             jackpotWin: [-425, 328],
//         },
//         infoValueGap: 53,
//         jackpotSeal: [500, -190],
//         jackpotSealVisible: true,
//         labelFontSize: 39,
//         pagination: [174, 400],
//         panelHeight: 807,
//         panelWidth: 1399,
//         panelY: 85,
//         resultTitle: [170, -205],
//         resultTitleMaxWidth: 520,
//         titleFontSize: 56,
//         titleFrameWidth: 798,
//         titleGollumY: -436,
//         titleTextOffsetY: -2,
//         titleX: 6,
//         titleY: -304,
//         valueFontSize: 40,
//         valueMaxWidth: 360,
//         wheel: [174, 14],
//         wheelScale: 0.4,
//         winLineColumns: 2,
//         winLineColumnGap: 420,
//         winLineRowGap: 80,
//         winLineScrollbarHeight: 130,
//         miniWinLineOffsetX: 0,
//         winLines: [174, 230],
//         winLinesViewport: new Rectangle(-520, -40, 1040, 170),
//     },
//     portrait: {
//         back: [-326, -537],
//         close: [382, -664],
//         contentCenter: [540, 960],
//         info: {
//             roundId: [-170, -477],
//             time: [-170, -358],
//             totalBet: [166, -477],
//             totalWin: [166, -358],
//             jackpotWin: [0, -229],
//         },
//         infoValueGap: 52,
//         jackpotSeal: [300, -546],
//         jackpotSealVisible: true,
//         labelFontSize: 38,
//         pagination: [0, 634],
//         panelHeight: 1445,
//         panelWidth: 805,
//         panelY: 18,
//         resultTitle: [0, -65],
//         resultTitleMaxWidth: 650,
//         titleFontSize: 52,
//         titleFrameWidth: 736,
//         titleGollumY: -809,
//         titleTextOffsetY: 0,
//         titleX: 6,
//         titleY: -680,
//         valueFontSize: 39,
//         valueMaxWidth: 310,
//         wheel: [0, 159],
//         wheelScale: 0.4,
//         winLineColumns: 2,
//         winLineColumnGap: 370,
//         winLineRowGap: 80,
//         winLineScrollbarHeight: 210,
//         miniWinLineOffsetX: 80,
//         winLines: [0, 396],
//         winLinesViewport: new Rectangle(-475, -40, 950, 235),
//     },
// };
//
// const SYMBOL_TEXTURE_BY_ID: Record<number, string> = {
//     1: "bhistory_symbol_phial.png",
//     2: "bhistory_symbol_lembas.png",
//     3: "bhistory_symbol_sting.png",
//     4: "bhistory_symbol_palatir.png",
//     5: "bhistory_symbol_Pippin.png",
//     6: "bhistory_symbol_Merry.png",
//     7: "bhistory_symbol_sam.png",
//     8: "bhistory_symbol_Frodo.png",
//     9: "bhistory_symbol-gimli.png",
//     10: "bhistory_symbo_legolas.png",
//     11: "bhistory_symbol_ aragorn.png",
//     12: "bhistory_symbol_Gandalf.png",
//     13: "bhistory_symbol_one_ring.png",
//     14: "bhistory_symbol_golem.png",
//     15: "bhistory_symbol_saruman.png",
//     16: "bhistory_symbol_witch_king.png",
// };
//
// const LORE_SYMBOL_IDS: Record<string, readonly number[]> = {
//     burden_of_the_ring: [7, 8, 14],
//     three_hunters: [9, 10, 11],
//     blade_in_the_dark: [8, 13, 16],
//     knight_in_the_dark: [8, 13, 16],
//     second_breakfast: [6, 5, 2],
//     wizards_duel: [12, 15, 4],
// };
//
// type BetHistoryDetailResult = BetHistoryTicket & {
//     kind: BetHistoryKind;
// };
//
// function normalizeBetHistoryResults(
//     item: BetHistoryItem,
// ): BetHistoryDetailResult[] {
//     return [
//         { ...item, kind: "parent" },
//         ...(item.respin_tickets ?? []).map((ticket) => ({
//             ...ticket,
//             kind: "respin" as const,
//         })),
//         ...(item.mini_tickets ?? []).map((ticket) => ({
//             ...ticket,
//             kind: "mini" as const,
//         })),
//         ...(item.free_tickets ?? []).map((ticket) => ({
//             ...ticket,
//             kind: "free" as const,
//         })),
//     ];
// }
//
// export type BetHistoryDetailPopupView = Popup & {
//     setData: (item: BetHistoryItem) => void;
//     setLayout: (mode: MainGameLayoutMode) => void;
// };
// type BetHistoryDetailPopupOptions = {
//     onBack?: () => void;
//     onClose?: () => void;
//     onCopy?: (roundId: string) => Promise<void> | void;
// };
//
// function getPopupTexture(name: string) {
//     return (
//         gameAssets.PopupHistory?.textures[name] ??
//         gameAssets.PopupCommon?.textures[name] ??
//         Texture.EMPTY
//     );
// }
// function createCloseBtnTextures(): ButtonTextureStates {
//     return {
//         disabled: getPopupTexture("popup_close_btn_disabled.png"),
//         hover: getPopupTexture("popup_close_btn_highlighted.png"),
//         normal: getPopupTexture("popup_close_btn_normal.png"),
//         pressed: getPopupTexture("popup_close_btn_pressed.png"),
//     };
// }
// function createCopyIconTextures(): ButtonTextureStates {
//     return {
//         disabled: getPopupTexture("bhistory_icon_copy_disabled.png"),
//         hover: getPopupTexture("bhistory_icon_copy_highlighted.png"),
//         normal: getPopupTexture("bhistory_icon_copy_normal.png"),
//         pressed: getPopupTexture("bhistory_icon_copy_pressed.png"),
//     };
// }
// function createPageTextures(active: boolean): ButtonTextureStates {
//     if (active) {
//         const texture = getPopupTexture("pagination_pagebtn_selected.png");
//         return { normal: texture, hover: texture, pressed: texture };
//     }
//     return {
//         disabled: getPopupTexture("pagination_pagebtn_disabled.png"),
//         hover: getPopupTexture("pagination_pagebtn_highlighted.png"),
//         normal: getPopupTexture("pagination_pagebtn_normal.png"),
//         pressed: getPopupTexture("pagination_pagebtn_pressed.png"),
//     };
// }
// function createInfo(labelText: string): InfoNodes {
//     const container = new Container();
//     const label = createText({
//         fill: new FillGradient({
//             type: "linear",
//             start: { x: 0, y: 0 },
//             end: { x: 0, y: 1 },
//             colorStops: [
//                 { offset: 0, color: "#C34600" },
//                 { offset: 0.25, color: "#B93C03" },
//                 { offset: 0.5, color: "#A73004" },
//                 { offset: 0.75, color: "#9B2705" },
//                 { offset: 1, color: "#92280C" },
//             ],
//         }),
//         fontFamily: FONT_FAMILY.CORMORANT_GARAMOND_BOLD,
//         fontSize: 42,
//         fontWeight: "600",
//         text: labelText,
//     });
//     label.anchor.set(0.5);
//     label.eventMode = "none";
//     const value = createText({
//         fill: VALUE_COLOR,
//         fontFamily: FONT_FAMILY.KANIT_MEDIUM,
//         fontSize: 40,
//         fontWeight: "500",
//     });
//     value.anchor.set(0.5);
//     container.addChild(label, value);
//     return { container, label, value };
// }
// function fitText(text: Text, maxWidth: number) {
//     text.scale.set(1);
//     if (text.width > maxWidth) text.scale.set(maxWidth / text.width);
// }
// function formatHistoryTime(value?: string) {
//     const parsed = value ? new Date(value) : null;
//     const date =
//         parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date();
//     const gmt7 = new Date(date.getTime() + 7 * 60 * 60 * 1000);
//     const part = (value: number) => String(value).padStart(2, "0");
//     return `${part(gmt7.getUTCDate())}-${part(gmt7.getUTCMonth() + 1)} ${part(gmt7.getUTCHours())}:${part(gmt7.getUTCMinutes())}:${part(gmt7.getUTCSeconds())}`;
// }
// function getWinLines(result: BetHistoryTicket): WinLine[] {
//     return result.win_lines ?? result.wl ?? [];
// }
// function getResultWinLines(result: BetHistoryDetailResult): WinLine[] {
//     if (result.kind !== "mini") return getWinLines(result);
//
//     return [
//         {
//             symbol_id: 16,
//             match_count: result.mini_scatter ?? 0,
//             paytable_mult: 0,
//             win_amount: result.win_amount ?? 0,
//         },
//     ];
// }
// function getSymbolIds(line: WinLine) {
//     if (line.lore_id && LORE_SYMBOL_IDS[line.lore_id])
//         return [...LORE_SYMBOL_IDS[line.lore_id]];
//     if (!SYMBOL_TEXTURE_BY_ID[line.symbol_id]) return [];
//     return Array.from(
//         { length: Math.max(line.match_count || 1, 1) },
//         () => line.symbol_id,
//     );
// }
// function createWinLine(line: WinLine) {
//     const row = new Container({ label: "BetHistoryWinLine" });
//     const ids = getSymbolIds(line);
//     const textures = ids.map((id) => getPopupTexture(SYMBOL_TEXTURE_BY_ID[id]));
//     const width =
//         textures.reduce((total, texture) => total + texture.orig.width, 0) +
//         Math.max(textures.length - 1, 0) * WIN_SYMBOL_GAP;
//     let x = -width / 2 - 52;
//     textures.forEach((texture) => {
//         const icon = new Sprite(texture);
//         icon.anchor.set(0.5);
//         icon.x = x + texture.orig.width / 2;
//         x += texture.orig.width + WIN_SYMBOL_GAP;
//         icon.eventMode = "none";
//         row.addChild(icon);
//     });
//     const amount = createText({
//         fill: VALUE_COLOR,
//         fontFamily: FONT_FAMILY.KANIT_MEDIUM,
//         fontSize: 28,
//         fontWeight: "500",
//         text: `=   ${format(line.win_amount ?? 0, 0)}`,
//     });
//     amount.anchor.set(0, 0.5);
//     amount.x = ids.length ? x : -75;
//     amount.y = 6;
//     amount.eventMode = "none";
//
//     fitText(amount, 155);
//     row.addChild(amount);
//     return row;
// }
// function createRespinTriggerWinLine() {
//     const row = new Container({ label: "BetHistoryRespinTriggerWinLine" });
//     const texture = getPopupTexture("bhistory_symbol_saruman.png");
//     const icon = new Sprite(texture);
//     const description = createText({
//         fill: VALUE_COLOR,
//         fontFamily: FONT_FAMILY.KANIT_MEDIUM,
//         fontSize: 28,
//         fontWeight: "500",
//         text: `=   ${i18n.t("betHistory.sarumanTriggerRespin")}`,
//     });
//     const gap = 16;
//     const totalWidth = texture.orig.width + gap + description.width;
//
//     icon.anchor.set(0.5);
//     icon.position.set(-totalWidth / 2 + texture.orig.width / 2, 0);
//     icon.eventMode = "none";
//     description.anchor.set(0, 0.5);
//     description.position.set(icon.x + texture.orig.width / 2 + gap, 6);
//     description.eventMode = "none";
//     fitText(description, 420);
//     row.addChild(icon, description);
//     return row;
// }
// function getResultTitle(
//     result: BetHistoryDetailResult,
//     total: number,
//     fallbackIndex: number,
// ) {
//     if (result.kind === "respin") return i18n.t("betHistory.respinResult");
//     if (result.kind === "mini") return i18n.t("betHistory.bonusGameResult");
//     if (result.kind === "free") {
//         return i18n.t("betHistory.freeSpinResult", {
//             current: result.free_spin ?? fallbackIndex,
//             total,
//         });
//     }
//     return i18n.t("betHistory.baseSpinResult");
// }
//
// export function createBetHistoryDetailPopup(
//     app: Application<Renderer>,
//     options: BetHistoryDetailPopupOptions = {},
// ): BetHistoryDetailPopupView {
//     const view = new Popup({
//         closeOnEscape: true,
//         closeOnOverlay: false,
//         initialScale: 1,
//         overlayAlpha: 0.35,
//         targetScale: 1,
//         ticker: app.ticker ?? null,
//         animationDurationMs: 0,
//     }) as BetHistoryDetailPopupView;
//     view.label = "BetHistoryDetailPopup";
//     view.zIndex = 31;
//     let metrics = LAYOUTS.landscape;
//     let currentRoundId = "";
//     let isJackpot = false;
//     let copiedTextTimer: number | undefined;
//     let parentItem: BetHistoryItem | null = null;
//     let pages: BetHistoryDetailResult[] = [];
//     let pageIndex = 0;
//
//     const panel = new Sprite(getPopupTexture("popup_history_panel.png"));
//     panel.anchor.set(0.5);
//     const titleFrame = new Sprite(
//         getPopupTexture("popup_history_panel_title.png"),
//     );
//     titleFrame.anchor.set(0.5);
//     const titleGollum = new Sprite(
//         getPopupTexture("popup_history_Gollum_title.png"),
//     );
//     titleGollum.anchor.set(0.5);
//     titleGollum.eventMode = "none";
//     const title = createText({
//         fill: new FillGradient({
//             type: "linear",
//             start: { x: 0, y: 0 },
//             end: { x: 0, y: 1 },
//             colorStops: [
//                 { offset: 0, color: "#fff5af" },
//                 { offset: 0.25, color: "#fcec96" },
//                 { offset: 0.5, color: "#f1cc68" },
//                 { offset: 0.75, color: "#e6ad37" },
//                 { offset: 1, color: "#e29f1b" },
//             ],
//         }),
//         fontFamily: FONT_FAMILY.CORMORANT_GARAMOND_BOLD,
//         fontSize: metrics.titleFontSize,
//         fontWeight: "700",
//         text: i18n.t("betHistory.title"),
//     });
//     title.anchor.set(0.5);
//     title.eventMode = "none";
//     const closeButton = new Button(createCloseBtnTextures());
//     closeButton.anchor.set(0.5);
//     closeButton.updateHitArea();
//     const backButton = new Button({
//         disabled: getPopupTexture("bhistory_expand_btn_back_disabled.png"),
//         hover: getPopupTexture("bhistory_expand_btn_back_highlighted.png"),
//         normal: getPopupTexture("bhistory_expand_btn_back_normal.png"),
//         pressed: getPopupTexture("bhistory_expand_btn_back_pressed.png"),
//     });
//     backButton.anchor.set(0.5);
//     const backBounds = backButton.getLocalBounds();
//     backButton.hitArea = new Rectangle(
//         backBounds.x - BACK_BUTTON_HIT_AREA_PADDING,
//         backBounds.y - BACK_BUTTON_HIT_AREA_PADDING,
//         backBounds.width + BACK_BUTTON_HIT_AREA_PADDING * 2,
//         backBounds.height + BACK_BUTTON_HIT_AREA_PADDING * 2,
//     );
//
//     const info: Record<InfoKey, InfoNodes> = {
//         roundId: createInfo(i18n.t("betHistory.roundId")),
//         time: createInfo(i18n.t("betHistory.time")),
//         totalBet: createInfo(i18n.t("betHistory.totalBet")),
//         totalWin: createInfo(i18n.t("betHistory.totalWin")),
//         jackpotWin: createInfo(i18n.t("betHistory.jackpotWin")),
//     };
//     info.roundId.value.cursor = "pointer";
//     const copyIcon = new Button(createCopyIconTextures());
//     copyIcon.anchor.set(0.5);
//     copyIcon.updateHitArea();
//     copyIcon.visible = false;
//     info.roundId.container.addChild(copyIcon);
//     const layoutRoundId = () => {
//         const iconSpace = copyIcon.visible ? copyIcon.width + COPY_ICON_GAP : 0;
//         fitText(info.roundId.value, metrics.valueMaxWidth - iconSpace);
//         info.roundId.value.x = -iconSpace / 2;
//         copyIcon.position.set(
//             info.roundId.value.x +
//                 info.roundId.value.width / 2 +
//                 COPY_ICON_GAP +
//                 copyIcon.width / 2,
//             metrics.infoValueGap,
//         );
//         copiedTooltip.position.set(
//             info.roundId.container.x + copyIcon.x,
//             info.roundId.container.y + copyIcon.y - 48,
//         );
//     };
//     const copiedTooltip = new Container({ zIndex: 1000, eventMode: "none" });
//     const copiedText = createText({
//         fill: "#fede9b",
//         fontFamily: FONT_FAMILY.EB_GARAMOND,
//         fontSize: 24,
//         fontWeight: "bold",
//         stroke: { color: "#2b1500", width: 3 },
//         text: i18n.t("betHistory.copied"),
//     });
//     copiedText.anchor.set(0.5);
//     const copiedBg = new Graphics()
//         .roundRect(
//             -copiedText.width / 2 - 16,
//             -23,
//             copiedText.width + 32,
//             46,
//             8,
//         )
//         .fill({ color: 0, alpha: 0.82 });
//     copiedTooltip.addChild(copiedBg, copiedText);
//     copiedTooltip.visible = false;
//     view.content.addChild(copiedTooltip);
//
//     const resultTitle = createText({
//         fill: 0x272522,
//         fontFamily: FONT_FAMILY.CORMORANT_GARAMOND_BOLD,
//         fontSize: 50,
//         fontWeight: "600",
//         text: i18n.t("betHistory.baseSpinResult"),
//     });
//     resultTitle.anchor.set(0.5);
//     const rings: RadialRingState[] = [];
//     const emptyBoard = Array.from({ length: 3 }, () =>
//         Array.from({ length: 9 }, () => 1),
//     );
//     const radialBoardView = createRadialBoardView(emptyBoard, rings).container;
//     const wheelTexture =
//         gameAssets.MainSceneSheet?.textures["maingame_wheel.png"];
//     if (!wheelTexture) {
//         throw new Error(
//             "[BetHistoryDetailPopup] Texture not found: maingame_wheel.png",
//         );
//     }
//     const radialBoard = new Container({ label: "BetHistoryRadialBoard" });
//     const wheel = new Sprite({
//         texture: wheelTexture,
//         anchor: 0.5,
//         label: "BetHistoryWheel",
//         eventMode: "none",
//     });
//     radialBoard.addChild(radialBoardView, wheel);
//     radialBoard.eventMode = "none";
//     const jackpotSeal = new Sprite(
//         getPopupTexture("bhistory_jackpot_seal.png"),
//     );
//     jackpotSeal.anchor.set(0.5);
//
//     const winViewport = new Container({
//         label: "BetHistoryWinLinesViewport",
//         eventMode: "static",
//     });
//     const winContent = new Container({ label: "BetHistoryWinLines" });
//     const winMask = new Graphics();
//     const winScrollbar = new Container({
//         label: "BetHistoryWinLinesScrollbar",
//         eventMode: "static",
//         cursor: "pointer",
//     });
//     const winScrollTrack = new Sprite(
//         getPopupTexture("jphistory_scroll_bar_panel.png"),
//     );
//     winScrollTrack.anchor.set(0.5, 0);
//     const winScrollThumb = new Sprite(
//         getPopupTexture("jphistory_scroll_bar.png"),
//     );
//     winScrollThumb.anchor.set(0.5, 0);
//     winScrollbar.addChild(winScrollTrack, winScrollThumb);
//     winViewport.addChild(winContent, winMask, winScrollbar);
//     winContent.mask = winMask;
//     const pagination = new Container({ label: "BetHistoryResultPagination" });
//     const paginationBg = new Sprite(getPopupTexture("pagination_panel.png"));
//     paginationBg.anchor.set(0.5);
//     paginationBg.scale.set(1.2, PAGINATION_BACKGROUND_SCALE);
//     paginationBg.y = 3;
//     pagination.addChild(paginationBg);
//     view.content.addChild(
//         panel,
//         titleFrame,
//         titleGollum,
//         title,
//         closeButton,
//         backButton,
//         ...Object.values(info).map((node) => node.container),
//         resultTitle,
//         radialBoard,
//         winViewport,
//         pagination,
//         jackpotSeal,
//     );
//     const roundIdAnimation = createScalePulseAnimation(
//         app.ticker,
//         info.roundId.value,
//     );
//     const copyIconAnimation = createScalePulseAnimation(app.ticker, copyIcon);
//     const hideCopied = () => {
//         copiedTooltip.visible = false;
//         if (copiedTextTimer !== undefined) window.clearTimeout(copiedTextTimer);
//         copiedTextTimer = undefined;
//     };
//     let winLineScrollOffset = 0;
//     let winLineContentHeight = 0;
//     let draggingWinScrollbar = false;
//     let draggingWinContent = false;
//     let winContentDragPointerId: number | null = null;
//     let winContentDragStartY = 0;
//     let winContentDragStartOffset = 0;
//
//     const getWinLineMaxScroll = () =>
//         Math.max(winLineContentHeight - metrics.winLinesViewport.height, 0);
//
//     const updateWinLineScroll = () => {
//         const maxScroll = getWinLineMaxScroll();
//         winLineScrollOffset = Math.min(
//             Math.max(winLineScrollOffset, 0),
//             maxScroll,
//         );
//         winContent.y = -winLineScrollOffset;
//         winScrollbar.visible = maxScroll > 0;
//         if (!winScrollbar.visible) return;
//
//         const viewportHeight = metrics.winLinesViewport.height;
//         const thumbHeight = Math.max(
//             WIN_LINE_SCROLLBAR_MIN_THUMB_HEIGHT,
//             (viewportHeight / winLineContentHeight) *
//                 metrics.winLineScrollbarHeight,
//         );
//         const travel = metrics.winLineScrollbarHeight - thumbHeight;
//         const progress = winLineScrollOffset / maxScroll;
//         winScrollThumb.setSize(WIN_LINE_SCROLLBAR_THUMB_WIDTH, thumbHeight);
//         winScrollThumb.y = progress * travel;
//     };
//
//     const setWinLineScrollOffset = (offset: number) => {
//         winLineScrollOffset = offset;
//         updateWinLineScroll();
//     };
//
//     const renderWinLines = (lines: WinLine[], showRespinTrigger: boolean) => {
//         winContent
//             .removeChildren()
//             .forEach((child) => child.destroy({ children: true }));
//         winContent.x =
//             pages[pageIndex]?.kind === "mini" ? metrics.miniWinLineOffsetX : 0;
//         const triggerRowCount = showRespinTrigger ? 1 : 0;
//         winLineContentHeight =
//             (triggerRowCount +
//                 Math.ceil(lines.length / metrics.winLineColumns)) *
//             metrics.winLineRowGap;
//         winLineScrollOffset = 0;
//         draggingWinContent = false;
//         winContentDragPointerId = null;
//
//         if (showRespinTrigger) {
//             winContent.addChild(createRespinTriggerWinLine());
//         }
//
//         lines.forEach((line, index) => {
//             const row = createWinLine(line);
//             const column = index % metrics.winLineColumns;
//             const x =
//                 lines.length === 1
//                     ? 0
//                     : (column - (metrics.winLineColumns - 1) / 2) *
//                       metrics.winLineColumnGap;
//             row.position.set(
//                 x,
//                 (triggerRowCount + Math.floor(index / metrics.winLineColumns)) *
//                     metrics.winLineRowGap,
//             );
//             winContent.addChild(row);
//         });
//         updateWinLineScroll();
//     };
//
//     winViewport.on("wheel", (event: FederatedWheelEvent) => {
//         if (getWinLineMaxScroll() <= 0) return;
//         event.preventDefault();
//         setWinLineScrollOffset(
//             winLineScrollOffset +
//                 Math.sign(event.deltaY) * WIN_LINE_SCROLL_STEP,
//         );
//     });
//
//     winViewport.on("pointerdown", (event: FederatedPointerEvent) => {
//         if (getWinLineMaxScroll() <= 0) return;
//         draggingWinContent = true;
//         winContentDragPointerId = event.pointerId;
//         winContentDragStartY = winViewport.toLocal(event.global).y;
//         winContentDragStartOffset = winLineScrollOffset;
//         event.preventDefault();
//     });
//     winViewport.on("globalpointermove", (event: FederatedPointerEvent) => {
//         if (
//             !draggingWinContent ||
//             event.pointerId !== winContentDragPointerId
//         ) {
//             return;
//         }
//         const currentY = winViewport.toLocal(event.global).y;
//         setWinLineScrollOffset(
//             winContentDragStartOffset - (currentY - winContentDragStartY),
//         );
//         event.preventDefault();
//     });
//     const endWinContentDrag = (event: FederatedPointerEvent) => {
//         if (event.pointerId !== winContentDragPointerId) return;
//         draggingWinContent = false;
//         winContentDragPointerId = null;
//     };
//     winViewport.on("pointerup", endWinContentDrag);
//     winViewport.on("pointerupoutside", endWinContentDrag);
//     winViewport.on("pointercancel", endWinContentDrag);
//
//     const setWinLineScrollFromPointer = (event: FederatedPointerEvent) => {
//         const maxScroll = getWinLineMaxScroll();
//         if (maxScroll <= 0) return;
//         const localY = winScrollbar.toLocal(event.global).y;
//         const thumbHeight = Math.max(
//             WIN_LINE_SCROLLBAR_MIN_THUMB_HEIGHT,
//             (metrics.winLinesViewport.height / winLineContentHeight) *
//                 metrics.winLineScrollbarHeight,
//         );
//         const travel = metrics.winLineScrollbarHeight - thumbHeight;
//         const progress = Math.min(
//             Math.max((localY - thumbHeight / 2) / travel, 0),
//             1,
//         );
//         setWinLineScrollOffset(progress * maxScroll);
//     };
//     winScrollbar.on("pointerdown", (event: FederatedPointerEvent) => {
//         event.stopPropagation();
//         draggingWinScrollbar = true;
//         setWinLineScrollFromPointer(event);
//     });
//     winScrollbar.on("globalpointermove", (event: FederatedPointerEvent) => {
//         if (draggingWinScrollbar) setWinLineScrollFromPointer(event);
//     });
//     const endWinScrollbarDrag = () => {
//         draggingWinScrollbar = false;
//     };
//     winScrollbar.on("pointerup", endWinScrollbarDrag);
//     winScrollbar.on("pointerupoutside", endWinScrollbarDrag);
//     winScrollbar.on("pointercancel", endWinScrollbarDrag);
//
//     const changePage = (nextPageIndex: number) => {
//         if (
//             nextPageIndex < 0 ||
//             nextPageIndex >= pages.length ||
//             nextPageIndex === pageIndex
//         ) {
//             return;
//         }
//         eventBus.emit(EVENT_NAMES.AUDIO_BUTTON_OTHER_CLICKED, null);
//         pageIndex = nextPageIndex;
//         renderCurrent();
//     };
//
//     const handleKeyDown = (event: KeyboardEvent) => {
//         if (!view.visible || pages.length <= 1) return;
//         if (event.key === "ArrowLeft") {
//             event.preventDefault();
//             changePage(pageIndex - 1);
//         } else if (event.key === "ArrowRight") {
//             event.preventDefault();
//             changePage(pageIndex + 1);
//         }
//     };
//
//     function rebuildPagination() {
//         if (pagination.children.length > 1) {
//             pagination
//                 .removeChildren(1, pagination.children.length)
//                 .forEach((child) => child.destroy({ children: true }));
//         }
//         const model = getPaginationModel(pages.length, pageIndex + 1);
//         const contentWidth =
//             Math.max(model.length - 1, 0) * PAGE_BUTTON_SPACING;
//         model.forEach((entry, index) => {
//             let item: Container;
//             if (entry === "...") {
//                 item = createDotsSprite();
//                 item.scale.set(0.75);
//             } else {
//                 item = new Container();
//                 const targetPage = entry;
//                 const active = targetPage === pageIndex + 1;
//                 const button = new Button(createPageTextures(active));
//                 button.anchor.set(0.5);
//                 button.setSize(61, 61);
//                 button.updateHitArea();
//                 const pageText = createText({
//                     fill: "#ffd73f",
//                     fontFamily: FONT_FAMILY.KANIT_MEDIUM,
//                     fontSize: 29,
//                     fontWeight: "500",
//                     text: String(targetPage),
//                 });
//                 pageText.anchor.set(0.5);
//                 pageText.y = 1;
//                 pageText.eventMode = "none";
//                 item.addChild(button, pageText);
//                 button.on("pointertap", () => {
//                     changePage(Number(targetPage) - 1);
//                 });
//             }
//             item.x = index * PAGE_BUTTON_SPACING - contentWidth / 2;
//             pagination.addChild(item);
//         });
//         pagination.visible = pages.length > 1;
//     }
//     function renderCurrent() {
//         const result = pages[pageIndex];
//         if (!result || !parentItem) return;
//         const freePages = pages.filter((page) => page.kind === "free");
//         const freeIndex = freePages.indexOf(result) + 1;
//         const total = Math.max(
//             parentItem.free_spin ?? freePages.length,
//             freePages.length,
//             1,
//         );
//         resultTitle.text = getResultTitle(
//             result,
//             total,
//             Math.max(freeIndex, 1),
//         );
//         fitText(resultTitle, metrics.resultTitleMaxWidth);
//         const grid = result.grid ?? result.g ?? [];
//         applyBoardToRings(rings, toRadialBoard(grid));
//         const showRespinTrigger =
//             (result.kind === "parent" &&
//                 grid.some((row) => row.includes(15))) ||
//             (result.kind === "free" && (result.saruman_pos?.length ?? 0) > 0);
//         renderWinLines(getResultWinLines(result), showRespinTrigger);
//         rebuildPagination();
//     }
//
//     const copyRoundId = () => {
//         if (!currentRoundId) return;
//         roundIdAnimation.play();
//         copyIconAnimation.play();
//         void Promise.resolve(options.onCopy?.(currentRoundId))
//             .then(() => {
//                 hideCopied();
//                 copiedTooltip.visible = true;
//                 copiedTextTimer = window.setTimeout(
//                     hideCopied,
//                     COPIED_TEXT_VISIBLE_MS,
//                 );
//             })
//             .catch((error) =>
//                 console.warn("[BetHistory] Failed to copy round_id:", error),
//             );
//     };
//     info.roundId.value.on("pointertap", copyRoundId);
//     copyIcon.on("pointertap", copyRoundId);
//     backButton.on("pointertap", () => {
//         eventBus.emit(EVENT_NAMES.AUDIO_BUTTON_OTHER_CLICKED, null);
//         view.hide();
//     });
//     closeButton.on("pointertap", () => {
//         eventBus.emit(EVENT_NAMES.AUDIO_BUTTON_OTHER_CLICKED, null);
//         view.hide({ callback: options.onClose });
//     });
//     const overlayDown = () => view.hide();
//     view.setLayout = (newMode) => {
//         roundIdAnimation.stop();
//         copyIconAnimation.stop();
//         metrics = LAYOUTS[newMode];
//         view.content.position.set(...metrics.contentCenter);
//         panel.setSize(metrics.panelWidth, metrics.panelHeight);
//         panel.y = metrics.panelY;
//         titleFrame.setSize(metrics.titleFrameWidth, 128);
//         titleFrame.y = metrics.titleY;
//         titleGollum.y = metrics.titleGollumY;
//         title.x = metrics.titleX;
//         title.y = metrics.titleY + metrics.titleTextOffsetY;
//         title.style.fontSize = metrics.titleFontSize;
//         title.scale.set(1);
//         closeButton.position.set(...metrics.close);
//         backButton.position.set(...metrics.back);
//         (Object.keys(info) as InfoKey[]).forEach((key) => {
//             const node = info[key];
//             node.container.position.set(...metrics.info[key]);
//             node.label.style.fontSize = metrics.labelFontSize;
//             node.value.style.fontSize = metrics.valueFontSize;
//             node.value.y = metrics.infoValueGap;
//             fitText(node.value, metrics.valueMaxWidth);
//         });
//         layoutRoundId();
//         resultTitle.position.set(...metrics.resultTitle);
//         fitText(resultTitle, metrics.resultTitleMaxWidth);
//         radialBoard.position.set(...metrics.wheel);
//         radialBoard.scale.set(metrics.wheelScale);
//         winViewport.position.set(...metrics.winLines);
//         winMask
//             .clear()
//             .rect(
//                 metrics.winLinesViewport.x,
//                 metrics.winLinesViewport.y,
//                 metrics.winLinesViewport.width,
//                 metrics.winLinesViewport.height,
//             )
//             .fill(0xffffff);
//         winViewport.hitArea = metrics.winLinesViewport.clone();
//         winScrollbar.position.set(
//             metrics.winLinesViewport.x + metrics.winLinesViewport.width - 64,
//             metrics.winLinesViewport.y +
//                 (metrics.winLinesViewport.height -
//                     metrics.winLineScrollbarHeight) /
//                     2,
//         );
//         winScrollbar.hitArea = new Rectangle(
//             -WIN_LINE_SCROLLBAR_HIT_WIDTH / 2,
//             0,
//             WIN_LINE_SCROLLBAR_HIT_WIDTH,
//             metrics.winLineScrollbarHeight,
//         );
//         winScrollTrack.setSize(
//             WIN_LINE_SCROLLBAR_TRACK_WIDTH,
//             metrics.winLineScrollbarHeight,
//         );
//         pagination.position.set(...metrics.pagination);
//         jackpotSeal.position.set(...metrics.jackpotSeal);
//         jackpotSeal.visible = metrics.jackpotSealVisible && isJackpot;
//         if (parentItem) renderCurrent();
//     };
//     view.setData = (item) => {
//         hideCopied();
//         roundIdAnimation.stop();
//         copyIconAnimation.stop();
//         copyIcon.setTextures(createCopyIconTextures());
//         parentItem = item;
//         pages = normalizeBetHistoryResults(item);
//         pageIndex = 0;
//         currentRoundId = String(item.round_id ?? "");
//         isJackpot = item.is_jackpot === true || item.jp === true;
//         copyIcon.visible = Boolean(currentRoundId);
//         info.roundId.value.text = currentRoundId || "-";
//         info.time.value.text = formatHistoryTime(item.created_at);
//         info.totalBet.value.text = format(item.bet_amount ?? item.bet ?? 0, 0);
//         info.totalWin.value.text = format(
//             (item.win_amount ?? 0) + (item.jackpot_win ?? 0),
//             0,
//         );
//         info.jackpotWin.value.text = format(
//             item.jackpot_win ??
//                 item.jw ??
//                 (isJackpot
//                     ? (item.win_amount ?? item.win ?? item.current_win ?? 0)
//                     : 0),
//             0,
//         );
//         info.roundId.value.eventMode = currentRoundId ? "static" : "none";
//         Object.values(info).forEach(({ value }) =>
//             fitText(value, metrics.valueMaxWidth),
//         );
//         layoutRoundId();
//         jackpotSeal.visible = metrics.jackpotSealVisible && isJackpot;
//         renderCurrent();
//     };
//     const originalHide = view.hide.bind(view);
//     view.hide = (hideOptions: Parameters<Popup["hide"]>[0] = {}) => {
//         view.overlay.off("pointerdown", overlayDown);
//         hideCopied();
//         roundIdAnimation.stop();
//         copyIconAnimation.stop();
//         originalHide(hideOptions);
//         // Restore the history list while the detail fades out.
//         options.onBack?.();
//     };
//     const originalShow = view.show.bind(view);
//     view.show = (callback?: () => void) => {
//         view.overlay.off("pointerdown", overlayDown);
//         view.overlay.on("pointerdown", overlayDown);
//         originalShow(callback);
//     };
//     view.on("destroyed", () => {
//         view.overlay.off("pointerdown", overlayDown);
//         window.removeEventListener("keydown", handleKeyDown);
//         hideCopied();
//         roundIdAnimation.stop();
//         copyIconAnimation.stop();
//     });
//     window.addEventListener("keydown", handleKeyDown);
//     view.setLayout("landscape");
//     return view;
// }
