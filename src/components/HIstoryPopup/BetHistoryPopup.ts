// import {
//     Application,
//     Container,
//     FederatedPointerEvent,
//     FederatedWheelEvent,
//     FillGradient,
//     Graphics,
//     NineSliceSprite,
//     Rectangle,
//     Renderer,
//     Sprite,
//     Text,
//     Texture,
// } from "pixi.js";
//
// import Popup from "../../base/Popup";
// import { gameAssets } from "@/modules/game/engine/game.assets";
// import { EVENT_NAMES, eventBus } from "@/modules/game/engine/game.events";
// import { getPaginationModel } from "@/shared/utils/pagination";
// import { gameRequests } from "@/modules/game/handlers/game.requests";
// import { Button, type ButtonTextureStates } from "../../base/Button";
// import type {
//     BetHistoryItem,
//     ResponseBetHistoryType,
// } from "@/modules/game/engine/game.types";
// import { format } from "@/shared/utils/formatNumber";
// import { i18n } from "@/shared/i18n/I18nManager";
// import { createBetHistoryDetailPopup } from "./BetHistoryDetailPopup";
// import {
//     createScalePulseAnimation,
//     type ScalePulseAnimation,
// } from "@/shared/utils/createScalePulseAnimation";
// import { createText, FONT_FAMILY } from "@/shared/utils/text/createText";
// import type { MainGameLayoutMode } from "../layouts";
//
// const LANDSCAPE_LIMIT = 8;
// const PORTRAIT_LIMIT = 20;
// const PAGE_BUTTON_SPACING = 84;
// const COPIED_TEXT_OFFSET_Y = 44;
// const COPIED_TEXT_VISIBLE_MS = 900;
// const PORTRAIT_LOAD_THRESHOLD = 140;
// const PORTRAIT_SCROLL_STEP = 110;
// const SCROLLBAR_EDGE_PADDING = 26;
// const COLUMN_SEPARATOR_WIDTH = 26;
// const COLUMN_SEPARATOR_TOP_CAP = 60;
// const COLUMN_SEPARATOR_BOTTOM_CAP = 16;
// const PORTRAIT_ROWS_VIEWPORT_OFFSET_Y = -36;
//
// type LayoutMetrics = {
//     columns: {
//         bet: number;
//         copy: number;
//         details: number;
//         id: number;
//         time: number;
//         win: number;
//     };
//     columnSeparatorHeight: number;
//     columnSeparatorTop: number;
//     columnSeparators: readonly [number, number, number];
//     close: readonly [number, number];
//     contentCenter: readonly [number, number];
//     headerBarTexture: string;
//     headerColumns: readonly [number, number, number, number];
//     headerFontSize: number;
//     headerY: number;
//     maxIdWidth: number;
//     panelHeight: number;
//     panelWidth: number;
//     panelY: number;
//     rowFontSize: number;
//     rowGap: number;
//     rowLineTexture: string;
//     rowLineWidth: number;
//     rowStartY: number;
//     rowsViewport: Rectangle;
//     timeMaxWidth: number;
//     titleFrameWidth: number;
//     titleFontSize: number;
//     titleGollumY: number;
//     titleTextOffsetY: number;
//     titleX: number;
//     titleY: number;
// };
//
// const LAYOUTS: Record<MainGameLayoutMode, LayoutMetrics> = {
//     landscape: {
//         columns: {
//             bet: 125,
//             copy: -420,
//             details: 610,
//             id: -536,
//             time: -195,
//             win: 444,
//         },
//         columnSeparatorHeight: 695,
//         columnSeparatorTop: -235,
//         columnSeparators: [-372, -20, 278],
//         close: [675, -283],
//         contentCenter: [960, 540],
//         headerBarTexture: "popup_history_table_bar.png",
//         headerColumns: [-490, -195, 125, 455],
//         headerFontSize: 28,
//         headerY: -190,
//         maxIdWidth: 210,
//         panelHeight: 807,
//         panelWidth: 1399,
//         panelY: 85,
//         rowFontSize: 30,
//         rowGap: 71,
//         rowLineTexture: "popup_history_table_line_1.png",
//         rowLineWidth: 1265,
//         rowStartY: -132,
//         rowsViewport: new Rectangle(-633, -168, 1266, 568),
//         timeMaxWidth: 260,
//         titleFrameWidth: 798,
//         titleFontSize: 56,
//         titleGollumY: -436,
//         titleTextOffsetY: -2,
//         titleX: 6,
//         titleY: -304,
//     },
//     portrait: {
//         columns: {
//             bet: 37,
//             copy: -213,
//             details: 347,
//             id: -302,
//             time: -108,
//             win: 230,
//         },
//         columnSeparatorHeight: 1286,
//         columnSeparatorTop: -610,
//         columnSeparators: [-184, -37, 117],
//         close: [382, -664],
//         contentCenter: [540, 960],
//         headerBarTexture: "popup_history_table_bar_vertical.png",
//         headerColumns: [-275, -108, 37, 230],
//         headerFontSize: 28,
//         headerY: -572,
//         maxIdWidth: 145,
//         panelHeight: 1445,
//         panelWidth: 805,
//         panelY: 18,
//         rowFontSize: 24,
//         rowGap: 94,
//         rowLineTexture: "popup_history_table_line_1_vertical.png",
//         rowLineWidth: 779,
//         rowStartY: -459,
//         rowsViewport: new Rectangle(-390, -506, 780, 1218),
//         timeMaxWidth: 135,
//         titleFrameWidth: 736,
//         titleFontSize: 52,
//         titleGollumY: -809,
//         titleTextOffsetY: 0,
//         titleX: 6,
//         titleY: -680,
//     },
// };
//
// type BetHistoryRowNodes = {
//     container: Container;
//     copyIcon: Button;
//     id: Text;
// };
//
// export type BetHistoryView = Popup & {
//     requestBetHistory: () => void;
//     initialData: () => void;
//     handleChangePage: (page: number) => void;
//     updateBetHistory: (data: ResponseBetHistoryType) => void;
//     setLayout: (mode: MainGameLayoutMode) => void;
//     setSwitchHandler: (handler: () => void) => void;
//     setPrevEnable: () => void;
//     setNextEnable: () => void;
//     setPrevDisable: () => void;
//     setNextDisable: () => void;
// };
//
// function getPopupTexture(textureName: string) {
//     return (
//         gameAssets.PopupHistory?.textures[textureName] ??
//         gameAssets.PopupCommon?.textures[textureName] ??
//         Texture.EMPTY
//     );
// }
//
// async function copyToClipboard(value: string) {
//     if (navigator.clipboard?.writeText) {
//         await navigator.clipboard.writeText(value);
//         return;
//     }
//
//     const textArea = document.createElement("textarea");
//     textArea.value = value;
//     textArea.style.position = "fixed";
//     textArea.style.opacity = "0";
//     document.body.appendChild(textArea);
//     textArea.select();
//     document.execCommand("copy");
//     document.body.removeChild(textArea);
// }
//
// function setTruncatedText(textNode: Text, value: string, maxWidth: number) {
//     textNode.text = value;
//     if (textNode.width <= maxWidth) return;
//
//     let truncatedValue = value;
//     while (truncatedValue.length > 0 && textNode.width > maxWidth) {
//         truncatedValue = truncatedValue.slice(0, -1);
//         textNode.text = `${truncatedValue}...`;
//     }
// }
//
// function createCloseBtnTextures(): ButtonTextureStates {
//     return {
//         disabled: getPopupTexture("popup_close_btn_disabled.png"),
//         hover: getPopupTexture("popup_close_btn_highlighted.png"),
//         normal: getPopupTexture("popup_close_btn_normal.png"),
//         pressed: getPopupTexture("popup_close_btn_pressed.png"),
//     };
// }
//
// function createSwitchBtnTextures(): ButtonTextureStates {
//     return {
//         disabled: getPopupTexture("bhistory_btn_switch_disabled.png"),
//         hover: getPopupTexture("bhistory_btn_switch_highlighted.png"),
//         normal: getPopupTexture("bhistory_btn_switch_normal.png"),
//         pressed: getPopupTexture("bhistory_btn_switch_pressed.png"),
//     };
// }
//
// function createArrowTextures(side: "left" | "right"): ButtonTextureStates {
//     return {
//         disabled: getPopupTexture(`popup_history_${side}_btn_disabled.png`),
//         hover: getPopupTexture(`popup_history_${side}_btn_highlighted.png`),
//         normal: getPopupTexture(`popup_history_${side}_btn_normal.png`),
//         pressed: getPopupTexture(`popup_history_${side}_btn_pressed.png`),
//     };
// }
//
// function createPageTextures(isActive: boolean): ButtonTextureStates {
//     if (isActive) {
//         const active = getPopupTexture("pagination_pagebtn_selected.png");
//         return { normal: active, hover: active, pressed: active };
//     }
//     return {
//         disabled: getPopupTexture("pagination_pagebtn_disabled.png"),
//         hover: getPopupTexture("pagination_pagebtn_highlighted.png"),
//         normal: getPopupTexture("pagination_pagebtn_normal.png"),
//         pressed: getPopupTexture("pagination_pagebtn_pressed.png"),
//     };
// }
//
// function createCopyIconTextures(): ButtonTextureStates {
//     return {
//         disabled: getPopupTexture("bhistory_icon_copy_disabled.png"),
//         hover: getPopupTexture("bhistory_icon_copy_highlighted.png"),
//         normal: getPopupTexture("bhistory_icon_copy_normal.png"),
//         pressed: getPopupTexture("bhistory_icon_copy_pressed.png"),
//     };
// }
//
// function createResultIconTextures(): ButtonTextureStates {
//     return {
//         disabled: getPopupTexture("bhistory_icon_result_disabled.png"),
//         hover: getPopupTexture("bhistory_icon_result_highlighted.png"),
//         normal: getPopupTexture("bhistory_icon_result_normal.png"),
//         pressed: getPopupTexture("bhistory_icon_result_pressed.png"),
//     };
// }
//
// function formatHistoryTime(value: string | undefined, portrait: boolean) {
//     const parsedDate = value ? new Date(value) : null;
//     const isValidDate = parsedDate && !Number.isNaN(parsedDate.getTime());
//     const date = isValidDate ? parsedDate : new Date();
//     const gmt7Date = new Date(date.getTime() + 7 * 60 * 60 * 1000);
//     const day = String(gmt7Date.getUTCDate()).padStart(2, "0");
//     const month = String(gmt7Date.getUTCMonth() + 1).padStart(2, "0");
//     const year = String(gmt7Date.getUTCFullYear()).slice(-2);
//     const hours = String(gmt7Date.getUTCHours()).padStart(2, "0");
//     const minutes = String(gmt7Date.getUTCMinutes()).padStart(2, "0");
//     const seconds = String(gmt7Date.getUTCSeconds()).padStart(2, "0");
//     const separator = portrait ? "\n" : " ";
//
//     return `${day}-${month}-${year}${separator}${hours}:${minutes}:${seconds}`;
// }
//
// export function createBetHistoryPopup(
//     app: Application<Renderer>,
// ): BetHistoryView {
//     const betHistoryView = new Popup({
//         closeOnEscape: true,
//         closeOnOverlay: true,
//         initialScale: 0.72,
//         overlayAlpha: 0.7,
//         targetScale: 1,
//         ticker: app.ticker ?? null,
//     }) as BetHistoryView;
//
//     betHistoryView.label = "BetHistoryView";
//     betHistoryView.zIndex = 30;
//
//     let layoutMode: MainGameLayoutMode = "landscape";
//     let metrics = LAYOUTS.landscape;
//     let currentPage = 1;
//     let totalPages = 1;
//     let requestPending = false;
//     let loadedPortraitItems: BetHistoryItem[] = [];
//     let scrollOffset = 0;
//     let copiedTextTimer: number | undefined;
//     let suppressTapUntil = 0;
//     const betHistoryRows: BetHistoryRowNodes[] = [];
//     const copyZoomAnimations = new Map<Container, ScalePulseAnimation>();
//
//     const popupLayout = new Container({ label: "BetHistoryPopupLayout" });
//     const panel = new Sprite(getPopupTexture("popup_history_panel.png"));
//     panel.anchor.set(0.5);
//
//     const titleFrame = new Sprite(
//         getPopupTexture("popup_history_panel_title.png"),
//     );
//     titleFrame.anchor.set(0.5);
//
//     const titleGollum = new Sprite(
//         getPopupTexture("popup_history_Gollum_title.png"),
//     );
//     titleGollum.anchor.set(0.5);
//     titleGollum.eventMode = "none";
//
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
//
//     const jackpotTitleWidthReference = createText({
//         fontFamily: FONT_FAMILY.CORMORANT_GARAMOND_BOLD,
//         fontSize: metrics.titleFontSize,
//         fontWeight: "700",
//         text: i18n.t("jackpotHistory.title"),
//     });
//
//     const closeButton = new Button(createCloseBtnTextures());
//     closeButton.anchor.set(0.5);
//     closeButton.updateHitArea();
//
//     const switchButton = new Button(createSwitchBtnTextures());
//     switchButton.anchor.set(0.5);
//     switchButton.updateHitArea();
//     let switchHandler = () => {};
//     let switching = false;
//
//     const headerBar = new Sprite(getPopupTexture(metrics.headerBarTexture));
//     headerBar.anchor.set(0.5);
//     const headerLabels = [
//         "betHistory.roundId",
//         "betHistory.time",
//         "betHistory.totalBet",
//         "betHistory.totalWin",
//     ].map((translationKey) => {
//         const label = createText({
//             fill: new FillGradient({
//                 type: "linear",
//                 start: { x: 0, y: 0 },
//                 end: { x: 0, y: 1 },
//                 colorStops: [
//                     { offset: 0, color: "#ffffe7" },
//                     { offset: 1, color: "#ffbc3c" },
//                 ],
//             }),
//             fontFamily: FONT_FAMILY.BARLOW_CONDENSED,
//             fontSize: metrics.headerFontSize,
//             fontWeight: "600",
//             text: i18n.t(translationKey),
//         });
//         label.anchor.set(0.5);
//         label.eventMode = "none";
//         return label;
//     });
//
//     const rowsViewport = new Container({ label: "BetHistoryRowsViewport" });
//     rowsViewport.eventMode = "static";
//     const rowsContent = new Container({ label: "BetHistoryRowsContent" });
//     const rowsMask = new Graphics();
//     rowsMask.eventMode = "none";
//     rowsViewport.addChild(rowsContent);
//     rowsViewport.mask = rowsMask;
//
//     const columnSeparators = Array.from({ length: 3 }, () => {
//         const separator = new NineSliceSprite({
//             anchor: { x: 0.5, y: 0 },
//             bottomHeight: COLUMN_SEPARATOR_BOTTOM_CAP,
//             height: metrics.columnSeparatorHeight,
//             leftWidth: 0,
//             rightWidth: 0,
//             roundPixels: true,
//             texture: getPopupTexture("popup_jphistory_table_line_2.png"),
//             topHeight: COLUMN_SEPARATOR_TOP_CAP,
//             width: COLUMN_SEPARATOR_WIDTH,
//         });
//         separator.eventMode = "none";
//         return separator;
//     });
//
//     const statusText = createText({
//         fill: "#2d2a16",
//         fontFamily: FONT_FAMILY.EB_GARAMOND,
//         fontSize: 34,
//         fontWeight: "bold",
//     });
//     statusText.anchor.set(0.5);
//     statusText.visible = false;
//
//     const copiedTooltip = new Container({ label: "BetHistoryCopiedTooltip" });
//     const copiedTooltipBg = new Graphics();
//     const copiedText = createText({
//         fill: "#fede9b",
//         fontFamily: FONT_FAMILY.EB_GARAMOND,
//         fontSize: 24,
//         fontWeight: "bold",
//         stroke: { color: "#2b1500", width: 3 },
//         text: i18n.t("betHistory.copied"),
//     });
//     copiedText.anchor.set(0.5);
//     copiedText.y = -1;
//     const copiedTooltipWidth = copiedText.width + 32;
//     copiedTooltipBg
//         .roundRect(-copiedTooltipWidth / 2, -23, copiedTooltipWidth, 46, 8)
//         .fill({ color: 0x000000, alpha: 0.82 });
//     copiedTooltip.addChild(copiedTooltipBg, copiedText);
//     copiedTooltip.visible = false;
//
//     const prevButton = new Button(createArrowTextures("left"));
//     prevButton.anchor.set(0.5);
//     prevButton.position.set(-785, 82);
//     prevButton.updateHitArea();
//     const nextButton = new Button(createArrowTextures("right"));
//     nextButton.anchor.set(0.5);
//     nextButton.position.set(785, 82);
//     nextButton.updateHitArea();
//
//     const navigation = new Container({ label: "BetHistoryNavigation" });
//     const pagination = new Container({ label: "BetHistoryPagination" });
//     pagination.y = 470;
//     const paginationBackground = new Sprite(
//         getPopupTexture("pagination_panel.png"),
//     );
//     paginationBackground.anchor.set(0.5);
//     paginationBackground.y = 4;
//     paginationBackground.scale.set(1.2, 1);
//     pagination.addChild(paginationBackground);
//     navigation.addChild(prevButton, nextButton, pagination);
//
//     const scrollbar = new Container({ label: "BetHistoryScrollbar" });
//     const scrollTrack = new Sprite(
//         getPopupTexture("jphistory_scroll_bar_panel.png"),
//     );
//     scrollTrack.anchor.set(0.5);
//     const scrollFill = new Sprite(getPopupTexture("jphistory_scroll_bar.png"));
//     scrollFill.anchor.set(0.5);
//     const scrollKnob = new Sprite(getPopupTexture("bhistory_scroll_knob.png"));
//     scrollKnob.anchor.set(0.5);
//     scrollbar.addChild(scrollTrack, scrollFill, scrollKnob);
//     scrollbar.position.set(440, 55);
//     scrollbar.hitArea = new Rectangle(-32, -322, 64, 644);
//     scrollbar.eventMode = "static";
//     scrollbar.cursor = "pointer";
//
//     const betHistoryDetailPopup = createBetHistoryDetailPopup(app, {
//         onBack: () => {
//             betHistoryView.setCloseOnEscape(true);
//             popupLayout.visible = true;
//         },
//         onClose: () => {
//             betHistoryView.setCloseOnEscape(true);
//             popupLayout.visible = true;
//         },
//         onCopy: (roundId) => {
//             eventBus.emit(EVENT_NAMES.AUDIO_BUTTON_OTHER_CLICKED, null);
//             return copyToClipboard(roundId);
//         },
//     });
//     betHistoryView.addChild(betHistoryDetailPopup);
//
//     popupLayout.addChild(
//         panel,
//         titleFrame,
//         titleGollum,
//         title,
//         switchButton,
//         closeButton,
//         headerBar,
//         ...headerLabels,
//         rowsViewport,
//         rowsMask,
//         ...columnSeparators,
//         statusText,
//         navigation,
//         scrollbar,
//         copiedTooltip,
//     );
//     betHistoryView.content.addChild(popupLayout);
//
//     const stopAllCopyAnimations = () => {
//         copyZoomAnimations.forEach((animation) => animation.stop());
//         copyZoomAnimations.clear();
//     };
//
//     const playCopyAnimation = (target: Container) => {
//         let animation = copyZoomAnimations.get(target);
//         if (!animation) {
//             animation = createScalePulseAnimation(app.ticker, target);
//             copyZoomAnimations.set(target, animation);
//         }
//         animation.play();
//     };
//
//     const hideCopiedText = () => {
//         copiedTooltip.visible = false;
//         if (copiedTextTimer === undefined) return;
//         window.clearTimeout(copiedTextTimer);
//         copiedTextTimer = undefined;
//     };
//
//     const showCopiedText = (x: number, y: number) => {
//         hideCopiedText();
//         copiedTooltip.position.set(x, y - COPIED_TEXT_OFFSET_Y);
//         copiedTooltip.visible = true;
//         copiedTextTimer = window.setTimeout(() => {
//             copiedTooltip.visible = false;
//             copiedTextTimer = undefined;
//         }, COPIED_TEXT_VISIBLE_MS);
//     };
//
//     const clearRows = () => {
//         stopAllCopyAnimations();
//         rowsContent.removeChildren().forEach((child) => {
//             child.destroy({ children: true });
//         });
//         betHistoryRows.length = 0;
//         hideCopiedText();
//     };
//
//     const getMaxScroll = () => {
//         if (layoutMode !== "portrait") return 0;
//         const contentHeight = betHistoryRows.length * metrics.rowGap;
//         return Math.max(0, contentHeight - metrics.rowsViewport.height);
//     };
//
//     const getScrollbarTravel = () =>
//         Math.max(
//             scrollTrack.height -
//                 Math.max(scrollFill.height, scrollKnob.height) -
//                 SCROLLBAR_EDGE_PADDING * 2,
//             0,
//         );
//
//     const updateScrollbar = () => {
//         const maxScroll = getMaxScroll();
//         const progress = maxScroll > 0 ? scrollOffset / maxScroll : 0;
//         const scrollbarTravel = getScrollbarTravel();
//         const y = -scrollbarTravel / 2 + progress * scrollbarTravel;
//         scrollFill.y = y;
//         scrollKnob.y = y;
//         scrollbar.alpha = maxScroll > 0 ? 1 : 0.55;
//     };
//
//     const requestPage = (page: number) => {
//         const limit =
//             layoutMode === "portrait" ? PORTRAIT_LIMIT : LANDSCAPE_LIMIT;
//         requestPending = gameRequests.RequestBetHistory(page, limit);
//     };
//
//     const maybeLoadMore = () => {
//         if (
//             layoutMode !== "portrait" ||
//             requestPending ||
//             currentPage >= totalPages ||
//             getMaxScroll() - scrollOffset > PORTRAIT_LOAD_THRESHOLD
//         ) {
//             return;
//         }
//         requestPage(currentPage + 1);
//     };
//
//     const setScrollOffset = (value: number, loadMore = true) => {
//         scrollOffset = Math.min(Math.max(value, 0), getMaxScroll());
//         rowsContent.y = -scrollOffset;
//         hideCopiedText();
//         updateScrollbar();
//         if (loadMore) maybeLoadMore();
//     };
//
//     const createRow = (item: BetHistoryItem, index: number) => {
//         const row = new Container({ label: `BetHistoryRow-${index}` });
//         row.y = metrics.rowStartY + index * metrics.rowGap;
//
//         const line = new Sprite(getPopupTexture(metrics.rowLineTexture));
//         line.anchor.set(0.5);
//         line.setSize(metrics.rowLineWidth, metrics.rowGap);
//         line.eventMode = "none";
//
//         const id = createText({
//             align: "center",
//             fill: "#302a0e",
//             fontFamily: FONT_FAMILY.KANIT_MEDIUM,
//             fontSize: 30,
//             fontWeight: "500",
//         });
//         id.anchor.set(0.5);
//         id.x = metrics.columns.id;
//         id.eventMode = "none";
//
//         const hasRoundId =
//             item.round_id !== undefined && item.round_id !== null;
//         const roundId = hasRoundId ? String(item.round_id) : "-";
//         setTruncatedText(id, roundId, metrics.maxIdWidth);
//
//         const copyIconTextures = createCopyIconTextures();
//         const copyIcon = new Button(copyIconTextures);
//         copyIcon.anchor.set(0.5);
//         copyIcon.x = metrics.columns.copy;
//         copyIcon.eventMode = "none";
//         copyIcon.visible = hasRoundId;
//
//         const time = createText({
//             align: "center",
//             fill: "#302a0e",
//             fontFamily: FONT_FAMILY.KANIT_MEDIUM,
//             fontSize: 30,
//             fontWeight: "500",
//             text: formatHistoryTime(item.created_at, layoutMode === "portrait"),
//         });
//         time.anchor.set(0.5);
//         time.x = metrics.columns.time;
//         time.eventMode = "none";
//         if (time.width > metrics.timeMaxWidth) {
//             time.scale.set(metrics.timeMaxWidth / time.width);
//         }
//
//         const bet = createText({
//             align: "center",
//             fill: "#302a0e",
//             fontFamily: FONT_FAMILY.KANIT_MEDIUM,
//             fontSize: 30,
//             fontWeight: "500",
//             text: format(item.bet, 0),
//         });
//         bet.anchor.set(0.5);
//         bet.x = metrics.columns.bet;
//         bet.eventMode = "none";
//
//         const win = createText({
//             align: "center",
//             fill: "#801b01",
//             fontFamily: FONT_FAMILY.KANIT_MEDIUM,
//             fontSize: 32,
//             fontWeight: "500",
//             text: format((item.win_amount ?? 0) + (item.jackpot_win ?? 0), 0),
//         });
//         win.anchor.set(0.5);
//         win.x = metrics.columns.win;
//         win.eventMode = "none";
//
//         const resultIconTextures = createResultIconTextures();
//         const detailsIcon = new Button(resultIconTextures);
//         detailsIcon.anchor.set(0.5);
//         detailsIcon.x = metrics.columns.details;
//         detailsIcon.eventMode = "none";
//
//         const copyTarget = new Container({
//             eventMode: hasRoundId ? "static" : "none",
//             cursor: hasRoundId ? "pointer" : "default",
//         });
//         copyTarget.hitArea = new Rectangle(
//             -metrics.rowLineWidth / 2,
//             -metrics.rowGap / 2,
//             metrics.rowLineWidth / 2 + metrics.columns.copy + 22,
//             metrics.rowGap,
//         );
//         copyTarget.on("pointertap", () => {
//             if (!hasRoundId || performance.now() < suppressTapUntil) return;
//             playCopyAnimation(id);
//             playCopyAnimation(copyIcon);
//             eventBus.emit(EVENT_NAMES.AUDIO_BUTTON_OTHER_CLICKED, null);
//             void copyToClipboard(roundId)
//                 .then(() => {
//                     showCopiedText(metrics.columns.id, row.y + rowsContent.y);
//                 })
//                 .catch((error) => {
//                     console.warn(
//                         "[BetHistory] Failed to copy round_id:",
//                         error,
//                     );
//                 });
//         });
//         copyTarget.on("pointerdown", () => {
//             copyIcon.texture =
//                 copyIconTextures.pressed ?? copyIconTextures.normal;
//         });
//         const resetCopyIcon = () => {
//             copyIcon.texture = copyIconTextures.normal;
//         };
//         copyTarget.on("pointerover", () => {
//             copyIcon.texture =
//                 copyIconTextures.hover ?? copyIconTextures.normal;
//         });
//         copyTarget.on("pointerout", resetCopyIcon);
//         copyTarget.on("pointerup", () => {
//             copyIcon.texture =
//                 copyIconTextures.hover ?? copyIconTextures.normal;
//         });
//         copyTarget.on("pointerupoutside", resetCopyIcon);
//         copyTarget.on("pointercancel", resetCopyIcon);
//
//         const detailsTarget = new Container({
//             eventMode: "static",
//             cursor: "pointer",
//         });
//         detailsTarget.hitArea = new Rectangle(
//             metrics.columns.win - 115,
//             -metrics.rowGap / 2,
//             metrics.columns.details - metrics.columns.win + 150,
//             metrics.rowGap,
//         );
//         detailsTarget.on("pointertap", () => {
//             if (performance.now() < suppressTapUntil) return;
//             eventBus.emit(EVENT_NAMES.AUDIO_BUTTON_OTHER_CLICKED, null);
//             betHistoryView.setCloseOnEscape(false);
//             popupLayout.visible = false;
//             betHistoryDetailPopup.setData(item);
//             betHistoryDetailPopup.show();
//         });
//         detailsTarget.on("pointerover", () => {
//             detailsIcon.texture =
//                 resultIconTextures.hover ?? resultIconTextures.normal;
//         });
//         detailsTarget.on("pointerout", () => {
//             detailsIcon.texture = resultIconTextures.normal;
//         });
//         detailsTarget.on("pointerdown", () => {
//             detailsIcon.texture =
//                 resultIconTextures.pressed ?? resultIconTextures.normal;
//         });
//         detailsTarget.on("pointerup", () => {
//             detailsIcon.texture =
//                 resultIconTextures.hover ?? resultIconTextures.normal;
//         });
//         detailsTarget.on("pointerupoutside", () => {
//             detailsIcon.texture = resultIconTextures.normal;
//         });
//         detailsTarget.on("pointercancel", () => {
//             detailsIcon.texture = resultIconTextures.normal;
//         });
//
//         row.addChild(
//             line,
//             id,
//             copyIcon,
//             time,
//             bet,
//             win,
//             detailsIcon,
//             copyTarget,
//             detailsTarget,
//         );
//         rowsContent.addChild(row);
//         betHistoryRows.push({ container: row, copyIcon, id });
//     };
//
//     const renderRows = (items: BetHistoryItem[]) => {
//         clearRows();
//         items.forEach(createRow);
//         statusText.visible = items.length === 0;
//         statusText.text = items.length === 0 ? i18n.t("betHistory.empty") : "";
//         setScrollOffset(scrollOffset, false);
//     };
//
//     const setPrevEnable = () => prevButton.setEnabled(true);
//     const setNextEnable = () => nextButton.setEnabled(true);
//     const setPrevDisable = () => prevButton.setEnabled(false);
//     const setNextDisable = () => nextButton.setEnabled(false);
//
//     const createPageButton = (page: number, isActive: boolean) => {
//         const pageButton = new Container();
//         const background = new Button(createPageTextures(isActive));
//         background.anchor.set(0.5);
//         background.updateHitArea();
//         const text = createText({
//             align: "center",
//             fill: new FillGradient({
//                 type: "linear",
//                 start: { x: 0, y: 0 },
//                 end: { x: 0, y: 1 },
//                 colorStops: [
//                     { offset: 0, color: "#ffff66" },
//                     { offset: 1, color: "#ffc61a" },
//                 ],
//             }),
//             fontFamily: FONT_FAMILY.KANIT_MEDIUM,
//             fontSize: 42,
//             fontWeight: "500",
//             text: String(page),
//         });
//         text.anchor.set(0.5);
//         text.y = 0;
//         text.eventMode = "none";
//         pageButton.addChild(background, text);
//         background.on("pointertap", () => {
//             if (!isActive) betHistoryView.handleChangePage(page);
//         });
//         return pageButton;
//     };
//
//     const rebuildPageButtons = () => {
//         if (pagination.children.length > 1) {
//             pagination
//                 .removeChildren(1, pagination.children.length)
//                 .forEach((child) => {
//                     child.destroy({ children: true });
//                 });
//         }
//         const model = getPaginationModel(totalPages, currentPage);
//         const buttons: Container[] = [];
//         model.forEach((entry) => {
//             if (entry === "...") {
//                 const dots = createText({
//                     fill: "#ead0b8",
//                     fontFamily: FONT_FAMILY.EB_GARAMOND,
//                     fontSize: 42,
//                     fontWeight: "bold",
//                     text: "...",
//                 });
//                 dots.anchor.set(0.5);
//                 pagination.addChild(dots);
//                 buttons.push(dots);
//                 return;
//             }
//             const page = Number(entry);
//             const button = createPageButton(page, page === currentPage);
//             pagination.addChild(button);
//             buttons.push(button);
//         });
//         const contentWidth =
//             Math.max(buttons.length - 1, 0) * PAGE_BUTTON_SPACING;
//         buttons.forEach((button, index) => {
//             button.x = index * PAGE_BUTTON_SPACING - contentWidth / 2;
//         });
//         if (currentPage <= 1) setPrevDisable();
//         else setPrevEnable();
//         if (currentPage >= totalPages) setNextDisable();
//         else setNextEnable();
//     };
//
//     const resetAndRequest = () => {
//         currentPage = 1;
//         totalPages = 1;
//         scrollOffset = 0;
//         loadedPortraitItems = [];
//         requestPending = false;
//         renderRows([]);
//         statusText.visible = false;
//         requestPage(1);
//     };
//
//     const requestBetHistory = () => requestPage(currentPage);
//
//     const handleChangePage = (page: number) => {
//         if (
//             layoutMode !== "landscape" ||
//             requestPending ||
//             page === currentPage ||
//             page < 1 ||
//             page > totalPages
//         ) {
//             return;
//         }
//         eventBus.emit(EVENT_NAMES.AUDIO_PAGE_CHANGED, null);
//         currentPage = page;
//         requestPage(page);
//     };
//
//     const updateBetHistory = (data: ResponseBetHistoryType) => {
//         const limit =
//             layoutMode === "portrait" ? PORTRAIT_LIMIT : LANDSCAPE_LIMIT;
//         totalPages = Math.max(Math.ceil(data.total / limit), 1);
//         requestPending = false;
//
//         if (layoutMode === "portrait") {
//             if (data.page !== 1 && data.page !== currentPage + 1) return;
//             if (data.page === 1) {
//                 loadedPortraitItems = [...(data.list ?? [])];
//                 currentPage = 1;
//                 scrollOffset = 0;
//                 renderRows(loadedPortraitItems);
//                 maybeLoadMore();
//                 return;
//             }
//             const firstNewRowIndex = loadedPortraitItems.length;
//             currentPage = data.page;
//             loadedPortraitItems.push(...(data.list ?? []));
//             (data.list ?? []).forEach((item, index) => {
//                 createRow(item, firstNewRowIndex + index);
//             });
//             statusText.visible = loadedPortraitItems.length === 0;
//             setScrollOffset(scrollOffset, false);
//             maybeLoadMore();
//             return;
//         }
//
//         if (data.page > totalPages) {
//             currentPage = totalPages;
//             requestPage(currentPage);
//             return;
//         }
//         currentPage = data.page;
//         renderRows(data.list ?? []);
//         rebuildPageButtons();
//     };
//
//     let draggingRows = false;
//     let draggingScrollbar = false;
//     let dragMoved = false;
//     let lastPointerY = 0;
//
//     const beginRowsDrag = (event: FederatedPointerEvent) => {
//         if (layoutMode !== "portrait") return;
//         draggingRows = true;
//         dragMoved = false;
//         lastPointerY = rowsViewport.toLocal(event.global).y;
//     };
//     const moveRowsDrag = (event: FederatedPointerEvent) => {
//         if (!draggingRows || layoutMode !== "portrait") return;
//         const pointerY = rowsViewport.toLocal(event.global).y;
//         const deltaY = pointerY - lastPointerY;
//         if (Math.abs(deltaY) > 1) dragMoved = true;
//         lastPointerY = pointerY;
//         setScrollOffset(scrollOffset - deltaY);
//     };
//     const endRowsDrag = () => {
//         if (dragMoved) suppressTapUntil = performance.now() + 120;
//         draggingRows = false;
//         dragMoved = false;
//     };
//     rowsViewport.on("pointerdown", beginRowsDrag);
//     rowsViewport.on("globalpointermove", moveRowsDrag);
//     rowsViewport.on("pointerup", endRowsDrag);
//     rowsViewport.on("pointerupoutside", endRowsDrag);
//     rowsViewport.on("pointercancel", endRowsDrag);
//     rowsViewport.on("wheel", (event: FederatedWheelEvent) => {
//         if (layoutMode !== "portrait") return;
//         event.preventDefault();
//         setScrollOffset(scrollOffset + event.deltaY);
//     });
//
//     const setScrollFromTrackPointer = (event: FederatedPointerEvent) => {
//         const maxScroll = getMaxScroll();
//         if (maxScroll <= 0) return;
//         const localY = scrollbar.toLocal(event.global).y;
//         const scrollbarTravel = getScrollbarTravel();
//         if (scrollbarTravel <= 0) return;
//         const progress = Math.min(
//             Math.max((localY + scrollbarTravel / 2) / scrollbarTravel, 0),
//             1,
//         );
//         setScrollOffset(progress * maxScroll);
//     };
//     scrollbar.on("pointerdown", (event: FederatedPointerEvent) => {
//         if (layoutMode !== "portrait") return;
//         draggingScrollbar = true;
//         setScrollFromTrackPointer(event);
//     });
//     scrollbar.on("globalpointermove", (event: FederatedPointerEvent) => {
//         if (draggingScrollbar) setScrollFromTrackPointer(event);
//     });
//     const endScrollbarDrag = () => {
//         draggingScrollbar = false;
//     };
//     scrollbar.on("pointerup", endScrollbarDrag);
//     scrollbar.on("pointerupoutside", endScrollbarDrag);
//     scrollbar.on("pointercancel", endScrollbarDrag);
//
//     const handleKeyDown = (event: KeyboardEvent) => {
//         if (!betHistoryView.visible || betHistoryDetailPopup.visible) return;
//         if (layoutMode === "landscape") {
//             if (event.key === "ArrowLeft") {
//                 event.preventDefault();
//                 handleChangePage(currentPage - 1);
//             } else if (event.key === "ArrowRight") {
//                 event.preventDefault();
//                 handleChangePage(currentPage + 1);
//             }
//             return;
//         }
//         if (event.key === "ArrowDown" || event.key === "PageDown") {
//             event.preventDefault();
//             setScrollOffset(scrollOffset + PORTRAIT_SCROLL_STEP);
//         } else if (event.key === "ArrowUp" || event.key === "PageUp") {
//             event.preventDefault();
//             setScrollOffset(scrollOffset - PORTRAIT_SCROLL_STEP);
//         }
//     };
//
//     closeButton.on("pointerup", () => {
//         eventBus.emit(EVENT_NAMES.AUDIO_BUTTON_OTHER_CLICKED, null);
//         betHistoryView.hide();
//     });
//     switchButton.on("pointertap", () => {
//         if (switching) return;
//         switching = true;
//         eventBus.emit(EVENT_NAMES.AUDIO_BUTTON_OTHER_CLICKED, null);
//         switchHandler();
//         switching = false;
//     });
//     prevButton.on("pointerup", () => handleChangePage(currentPage - 1));
//     nextButton.on("pointerup", () => handleChangePage(currentPage + 1));
//
//     const setLayout = (mode: MainGameLayoutMode) => {
//         const modeChanged = layoutMode !== mode;
//         layoutMode = mode;
//         metrics = LAYOUTS[mode];
//         const isPortrait = mode === "portrait";
//
//         betHistoryView.content.position.set(...metrics.contentCenter);
//         panel.setSize(metrics.panelWidth, metrics.panelHeight);
//         panel.y = metrics.panelY;
//         titleFrame.setSize(metrics.titleFrameWidth, 128);
//         titleFrame.y = metrics.titleY;
//         titleGollum.y = metrics.titleGollumY;
//         title.x = metrics.titleX;
//         title.y = metrics.titleY + metrics.titleTextOffsetY;
//         title.style.fontSize = metrics.titleFontSize;
//         title.scale.set(1);
//         jackpotTitleWidthReference.style.fontSize = metrics.titleFontSize;
//         switchButton.position.set(
//             title.x -
//                 30 +
//                 jackpotTitleWidthReference.width / 2 +
//                 switchButton.width / 2 +
//                 10,
//             metrics.titleY + metrics.titleTextOffsetY,
//         );
//         closeButton.position.set(...metrics.close);
//         headerBar.texture = getPopupTexture(metrics.headerBarTexture);
//         headerBar.y = metrics.headerY;
//         headerLabels.forEach((label, index) => {
//             label.position.set(
//                 metrics.headerColumns[index],
//                 metrics.headerY - 6,
//             );
//             label.style.fontSize = metrics.headerFontSize;
//         });
//         columnSeparators.forEach((separator, index) => {
//             separator.position.set(
//                 metrics.columnSeparators[index],
//                 metrics.columnSeparatorTop,
//             );
//             separator.setSize(
//                 COLUMN_SEPARATOR_WIDTH,
//                 metrics.columnSeparatorHeight,
//             );
//         });
//         statusText.y = metrics.rowStartY + 80;
//
//         const rowsViewportOffsetY = isPortrait
//             ? PORTRAIT_ROWS_VIEWPORT_OFFSET_Y
//             : 0;
//         rowsViewport.y = rowsViewportOffsetY;
//         rowsMask.y = rowsViewportOffsetY;
//         rowsMask.clear();
//         rowsMask
//             .rect(
//                 metrics.rowsViewport.x,
//                 metrics.rowsViewport.y,
//                 metrics.rowsViewport.width,
//                 metrics.rowsViewport.height,
//             )
//             .fill(0xffffff);
//         rowsViewport.hitArea = metrics.rowsViewport.clone();
//         rowsViewport.cursor = isPortrait ? "grab" : "default";
//         navigation.visible = !isPortrait;
//         scrollbar.visible = isPortrait;
//
//         betHistoryDetailPopup.position.set(0, 0);
//         betHistoryDetailPopup.scale.set(1);
//         betHistoryDetailPopup.setLayout(mode);
//
//         scrollOffset = 0;
//         loadedPortraitItems = [];
//         renderRows([]);
//         statusText.visible = false;
//         rebuildPageButtons();
//         if (modeChanged && betHistoryView.visible) resetAndRequest();
//     };
//
//     const hide = betHistoryView.hide.bind(betHistoryView);
//     betHistoryView.hide = (hideOptions: Parameters<Popup["hide"]>[0] = {}) => {
//         currentPage = 1;
//         totalPages = 1;
//         requestPending = false;
//         loadedPortraitItems = [];
//         scrollOffset = 0;
//         hideCopiedText();
//         stopAllCopyAnimations();
//         popupLayout.visible = true;
//         betHistoryView.setCloseOnEscape(true);
//         betHistoryDetailPopup.hide({ animated: false });
//         hide(hideOptions);
//     };
//
//     betHistoryView.requestBetHistory = requestBetHistory;
//     betHistoryView.initialData = resetAndRequest;
//     betHistoryView.handleChangePage = handleChangePage;
//     betHistoryView.updateBetHistory = updateBetHistory;
//     betHistoryView.setLayout = setLayout;
//     betHistoryView.setSwitchHandler = (handler) => {
//         switchHandler = handler;
//     };
//     betHistoryView.setPrevEnable = setPrevEnable;
//     betHistoryView.setNextEnable = setNextEnable;
//     betHistoryView.setPrevDisable = setPrevDisable;
//     betHistoryView.setNextDisable = setNextDisable;
//
//     const removeHistoryListener = eventBus.on(
//         EVENT_NAMES.BETTING_HISTORY_RESPONSE,
//         (data) => updateBetHistory(data as ResponseBetHistoryType),
//     );
//     window.addEventListener("keydown", handleKeyDown);
//     betHistoryView.on("destroyed", () => {
//         hideCopiedText();
//         stopAllCopyAnimations();
//         removeHistoryListener();
//         window.removeEventListener("keydown", handleKeyDown);
//     });
//
//     setLayout("landscape");
//     return betHistoryView;
// }
