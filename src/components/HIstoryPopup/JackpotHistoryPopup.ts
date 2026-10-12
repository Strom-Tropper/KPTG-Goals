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
// import { gameState } from "@/modules/game/engine/game.state";
// import { EVENT_NAMES, eventBus } from "@/modules/game/engine/game.events";
// import { getPaginationModel } from "@/shared/utils/pagination";
// import { gameRequests } from "@/modules/game/handlers/game.requests";
// import { Button, type ButtonTextureStates } from "../../base/Button";
// import type {
//     JackpotHistoryItem,
//     ResponseJackpotHistoryType,
// } from "@/modules/game/engine/game.types";
// import { format } from "@/shared/utils/formatNumber";
// import { i18n } from "@/shared/i18n/I18nManager";
// import { createText, FONT_FAMILY } from "@/shared/utils/text/createText";
// import type { MainGameLayoutMode } from "../layouts";
//
// const LANDSCAPE_LIMIT = 8;
// const PORTRAIT_LIMIT = 20;
// const PAGE_BUTTON_SPACING = 84;
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
//         betLevel: number;
//         id: number;
//         jackpot: number;
//         time: number;
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
//             betLevel: 130,
//             id: -480,
//             jackpot: 456,
//             time: -164,
//         },
//         columnSeparatorHeight: 695,
//         columnSeparatorTop: -235,
//         columnSeparators: [-322, -20, 278],
//         close: [675, -283],
//         contentCenter: [960, 540],
//         headerBarTexture: "popup_history_table_bar.png",
//         headerColumns: [-465, -170, 135, 456],
//         headerFontSize: 28,
//         headerY: -190,
//         maxIdWidth: 290,
//         panelHeight: 807,
//         panelWidth: 1399,
//         panelY: 85,
//         rowFontSize: 30,
//         rowGap: 71,
//         rowLineTexture: "popup_history_table_line_1.png",
//         rowLineWidth: 1265,
//         rowStartY: -132,
//         rowsViewport: new Rectangle(-633, -168, 1266, 568),
//         titleFrameWidth: 798,
//         titleFontSize: 56,
//         titleGollumY: -436,
//         titleTextOffsetY: -2,
//         titleX: -24,
//         titleY: -304,
//     },
//     portrait: {
//         columns: {
//             betLevel: 40,
//             id: -283,
//             jackpot: 246,
//             time: -108,
//         },
//         columnSeparatorHeight: 1286,
//         columnSeparatorTop: -610,
//         columnSeparators: [-184, -37, 117],
//         close: [382, -664],
//         contentCenter: [540, 960],
//         headerBarTexture: "popup_history_table_bar_vertical.png",
//         headerColumns: [-283, -108, 40, 246],
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
//         titleFrameWidth: 736,
//         titleFontSize: 52,
//         titleGollumY: -809,
//         titleTextOffsetY: 0,
//         titleX: -24,
//         titleY: -680,
//     },
// };
//
// type JackpotHistoryRowNodes = {
//     container: Container;
// };
//
// export type JackpotHistoryView = Popup & {
//     requestJackpotHistory: () => void;
//     initialData: () => void;
//     handleChangePage: (page: number) => void;
//     updateJackpotHistory: (data: ResponseJackpotHistoryType) => void;
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
// function getJackpotHistoryBetLevel(item: JackpotHistoryItem) {
//     if (item.bet_level !== undefined) return item.bet_level;
//     const totalBet = item.bet ?? item.bet_amount ?? 0;
//     return totalBet / gameState.betting.bet_level_divisor;
// }
//
// export function createJackpotHistoryPopup(
//     app: Application<Renderer>,
// ): JackpotHistoryView {
//     const jackpotHistoryView = new Popup({
//         closeOnEscape: true,
//         closeOnOverlay: true,
//         initialScale: 0.72,
//         overlayAlpha: 0.7,
//         targetScale: 1,
//         ticker: app.ticker ?? null,
//     }) as JackpotHistoryView;
//
//     jackpotHistoryView.label = "JackpotHistoryView";
//     jackpotHistoryView.zIndex = 30;
//
//     let layoutMode: MainGameLayoutMode = "landscape";
//     let metrics = LAYOUTS.landscape;
//     let currentPage = 1;
//     let totalPages = 1;
//     let requestPending = false;
//     let loadedPortraitItems: JackpotHistoryItem[] = [];
//     let scrollOffset = 0;
//     const jackpotHistoryRows: JackpotHistoryRowNodes[] = [];
//
//     const popupLayout = new Container({ label: "JackpotHistoryPopupLayout" });
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
//         text: i18n.t("jackpotHistory.title"),
//     });
//     title.anchor.set(0.5);
//     title.eventMode = "none";
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
//         "jackpotHistory.playerId",
//         "jackpotHistory.time",
//         "jackpotHistory.betLevel",
//         "jackpotHistory.jpAmount",
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
//     const rowsViewport = new Container({ label: "JackpotHistoryRowsViewport" });
//     rowsViewport.eventMode = "static";
//     const rowsContent = new Container({ label: "JackpotHistoryRowsContent" });
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
//     const prevButton = new Button(createArrowTextures("left"));
//     prevButton.anchor.set(0.5);
//     prevButton.position.set(-785, 82);
//     prevButton.updateHitArea();
//     const nextButton = new Button(createArrowTextures("right"));
//     nextButton.anchor.set(0.5);
//     nextButton.position.set(785, 82);
//     nextButton.updateHitArea();
//
//     const navigation = new Container({ label: "JackpotHistoryNavigation" });
//     const pagination = new Container({ label: "JackpotHistoryPagination" });
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
//     const scrollbar = new Container({ label: "JackpotHistoryScrollbar" });
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
//     );
//     jackpotHistoryView.content.addChild(popupLayout);
//
//     const clearRows = () => {
//         rowsContent.removeChildren().forEach((child) => {
//             child.destroy({ children: true });
//         });
//         jackpotHistoryRows.length = 0;
//     };
//
//     const getMaxScroll = () => {
//         if (layoutMode !== "portrait") return 0;
//         const contentHeight = jackpotHistoryRows.length * metrics.rowGap;
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
//         requestPending = gameRequests.RequestJackpotHistory(page, limit);
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
//         updateScrollbar();
//         if (loadMore) maybeLoadMore();
//     };
//
//     const createRow = (item: JackpotHistoryItem, index: number) => {
//         const row = new Container({ label: `JackpotHistoryRow-${index}` });
//         row.y = metrics.rowStartY + index * metrics.rowGap;
//
//         const line = new Sprite(getPopupTexture(metrics.rowLineTexture));
//         line.anchor.set(0.5);
//         line.setSize(metrics.rowLineWidth, metrics.rowGap);
//         line.eventMode = "none";
//
//         const playerId = createText({
//             align: "center",
//             fill: "#302a0e",
//             fontFamily: FONT_FAMILY.KANIT_MEDIUM,
//             fontSize: 30,
//             fontWeight: "500",
//         });
//         playerId.anchor.set(0.5);
//         playerId.x = metrics.columns.id;
//         playerId.eventMode = "none";
//         const playerIdValue =
//             item.display_name ??
//             item.username ??
//             item.uid ??
//             item.id ??
//             item.round_id ??
//             "-";
//         setTruncatedText(playerId, String(playerIdValue), metrics.maxIdWidth);
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
//
//         const betLevel = createText({
//             align: "center",
//             fill: "#302a0e",
//             fontFamily: FONT_FAMILY.KANIT_MEDIUM,
//             fontSize: 30,
//             fontWeight: "500",
//             text: format(getJackpotHistoryBetLevel(item), 0),
//         });
//         betLevel.anchor.set(0.5);
//         betLevel.x = metrics.columns.betLevel;
//         betLevel.eventMode = "none";
//
//         const jackpotAmount = createText({
//             align: "center",
//             fill: "#801b01",
//             fontFamily: FONT_FAMILY.KANIT_MEDIUM,
//             fontSize: 32,
//             fontWeight: "500",
//             text: format(item.win ?? item.win_amount ?? item.amount ?? 0, 0),
//         });
//         jackpotAmount.anchor.set(0.5);
//         jackpotAmount.x = metrics.columns.jackpot;
//         jackpotAmount.eventMode = "none";
//
//         row.addChild(line, playerId, time, betLevel, jackpotAmount);
//         rowsContent.addChild(row);
//         jackpotHistoryRows.push({ container: row });
//     };
//
//     const renderRows = (items: JackpotHistoryItem[]) => {
//         clearRows();
//         items.forEach(createRow);
//         statusText.visible = items.length === 0;
//         statusText.text =
//             items.length === 0 ? i18n.t("jackpotHistory.empty") : "";
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
//             if (!isActive) jackpotHistoryView.handleChangePage(page);
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
//     const requestJackpotHistory = () => requestPage(currentPage);
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
//     const updateJackpotHistory = (data: ResponseJackpotHistoryType) => {
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
//     let lastPointerY = 0;
//
//     const beginRowsDrag = (event: FederatedPointerEvent) => {
//         if (layoutMode !== "portrait") return;
//         draggingRows = true;
//         lastPointerY = rowsViewport.toLocal(event.global).y;
//     };
//     const moveRowsDrag = (event: FederatedPointerEvent) => {
//         if (!draggingRows || layoutMode !== "portrait") return;
//         const pointerY = rowsViewport.toLocal(event.global).y;
//         const deltaY = pointerY - lastPointerY;
//         lastPointerY = pointerY;
//         setScrollOffset(scrollOffset - deltaY);
//     };
//     const endRowsDrag = () => {
//         draggingRows = false;
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
//         if (!jackpotHistoryView.visible) return;
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
//         jackpotHistoryView.hide();
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
//         jackpotHistoryView.content.position.set(...metrics.contentCenter);
//         panel.setSize(metrics.panelWidth, metrics.panelHeight);
//         panel.y = metrics.panelY;
//         titleFrame.setSize(metrics.titleFrameWidth, 128);
//         titleFrame.y = metrics.titleY;
//         titleGollum.y = metrics.titleGollumY;
//         title.x = metrics.titleX;
//         title.y = metrics.titleY + metrics.titleTextOffsetY;
//         title.style.fontSize = metrics.titleFontSize;
//         title.scale.set(1);
//         switchButton.position.set(
//             title.x + title.width / 2 + switchButton.width / 2 + 10,
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
//         scrollOffset = 0;
//         loadedPortraitItems = [];
//         renderRows([]);
//         statusText.visible = false;
//         rebuildPageButtons();
//         if (modeChanged && jackpotHistoryView.visible) resetAndRequest();
//     };
//
//     const hide = jackpotHistoryView.hide.bind(jackpotHistoryView);
//     jackpotHistoryView.hide = (
//         hideOptions: Parameters<Popup["hide"]>[0] = {},
//     ) => {
//         currentPage = 1;
//         totalPages = 1;
//         requestPending = false;
//         loadedPortraitItems = [];
//         scrollOffset = 0;
//         popupLayout.visible = true;
//         jackpotHistoryView.setCloseOnEscape(true);
//         hide(hideOptions);
//     };
//
//     jackpotHistoryView.requestJackpotHistory = requestJackpotHistory;
//     jackpotHistoryView.initialData = resetAndRequest;
//     jackpotHistoryView.handleChangePage = handleChangePage;
//     jackpotHistoryView.updateJackpotHistory = updateJackpotHistory;
//     jackpotHistoryView.setLayout = setLayout;
//     jackpotHistoryView.setSwitchHandler = (handler) => {
//         switchHandler = handler;
//     };
//     jackpotHistoryView.setPrevEnable = setPrevEnable;
//     jackpotHistoryView.setNextEnable = setNextEnable;
//     jackpotHistoryView.setPrevDisable = setPrevDisable;
//     jackpotHistoryView.setNextDisable = setNextDisable;
//
//     const removeHistoryListener = eventBus.on(
//         EVENT_NAMES.JACKPOT_HISTORY_RESPONSE,
//         (data) => updateJackpotHistory(data as ResponseJackpotHistoryType),
//     );
//     window.addEventListener("keydown", handleKeyDown);
//     jackpotHistoryView.on("destroyed", () => {
//         removeHistoryListener();
//         window.removeEventListener("keydown", handleKeyDown);
//     });
//
//     setLayout("landscape");
//     return jackpotHistoryView;
// }
