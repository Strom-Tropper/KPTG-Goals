// import {
//     Application,
//     Assets,
//     BitmapText,
//     Container,
//     Renderer,
//     Sprite,
//     Spritesheet,
// } from "pixi.js";
//
// import Popup from "@/components/base/Popup";
// import { createPopupBackgroundAnimation } from "@/components/main-game/createPopupBackgroundAnimation";
// import { createFreespinWinLightEffect } from "@/components/main-game/FreespinWinLightEffect";
// import { applyInfoTitleStyle } from "@/components/main-game/InfoPopup/applyInfoTitleStyle";
// import {
//     MAIN_GAME_LAYOUTS,
//     type MainGameLayoutMode,
// } from "@/components/main-game/layouts";
// import {
//     gameAssets,
//     releaseSpritesheetGpuTexture,
// } from "@/modules/game/engine/game.assets";
// import { EVENT_NAMES, eventBus } from "@/modules/game/engine/game.events";
// import { i18n } from "@/shared/i18n/I18nManager";
// import {
//     animateNumber,
//     type NumberAnimation,
// } from "@/shared/utils/animateNumber";
// import {
//     createBlinkAnimation,
//     type BlinkAnimation,
// } from "@/shared/utils/createBlinkAnimation";
// import { format } from "@/shared/utils/formatNumber";
// import { createText, FONT_FAMILY } from "@/shared/utils/text/createText";
//
// const PANEL_TEXTURE = "popup_freespins_winamount_panel.png";
// const BACKGROUND_ANIMATION = "popup_reward_fbf";
// const AMOUNT_ANIMATION_MS = 1700;
// const POPUP_DURATION_MS = 10000;
// const SKIP_HOLD_MS = 2000;
// const MAX_AMOUNT_WIDTH = 800;
// const LANDSCAPE_SCALE = 0.94;
// const PORTRAIT_SCALE = 0.64;
//
// export type FreespinTotalWinPopupView = Popup & {
//     setLayout: (mode: MainGameLayoutMode) => void;
//     showWin: (amount: number, spins: number, onComplete?: () => void) => void;
// };
//
// function requireTexture(name: string) {
//     const texture = gameAssets.FreeSpinSheet.textures[name];
//     if (!texture) {
//         throw new Error(`[FreespinTotalWinPopup] Texture not found: ${name}`);
//     }
//     return texture;
// }
//
// export function createFreespinTotalWinPopup(
//     app: Application<Renderer>,
// ): FreespinTotalWinPopupView {
//     const popup = new Popup({
//         ticker: app.ticker,
//         overlayAlpha: 0.84,
//         closeOnEscape: false,
//         closeOnOverlay: false,
//         closeOnContentClick: false,
//     }) as FreespinTotalWinPopupView;
//     popup.label = "FreespinTotalWinPopup";
//     popup.zIndex = 46;
//
//     const layout = new Container({
//         label: "FreespinTotalWinLayout",
//         sortableChildren: true,
//     });
//     const background = createPopupBackgroundAnimation({
//         sheetName: "popup_reward",
//         animationName: BACKGROUND_ANIMATION,
//         fps: 20,
//         label: "FreespinTotalWinBackground",
//         scale: 1.1,
//     });
//     const popupRewardSheet = Assets.get<Spritesheet>("popup_reward");
//     background.y = -66;
//     background.zIndex = 1;
//     const lightEffect = createFreespinWinLightEffect();
//     lightEffect.zIndex = 0;
//     const panel = new Sprite({
//         texture: requireTexture(PANEL_TEXTURE),
//         anchor: 0.5,
//         eventMode: "none",
//     });
//     panel.zIndex = 2;
//
//     const makeLabel = (fontSize: number, y: number) => {
//         const label = createText({
//             text: "",
//             fontFamily: FONT_FAMILY.CORMORANT_GARAMOND_BOLD,
//             fontSize,
//             fontWeight: "600",
//         });
//         applyInfoTitleStyle(label);
//         label.style.fontSize = fontSize;
//         label.style.lineHeight = fontSize * 1.18;
//         label.anchor.set(0.5);
//         label.y = y;
//         label.zIndex = 3;
//         return label;
//     };
//
//     const title = makeLabel(58, -316);
//     const wonLabel = makeLabel(32, 152);
//     const spinsLabel = new Container({
//         y: 360,
//         zIndex: 3,
//         eventMode: "none",
//     });
//     const spinsPrefix = makeLabel(44, 0);
//     const spinsCount = makeLabel(44, 0);
//     const spinsSuffix = makeLabel(44, 0);
//     spinsCount.style.fontFamily = FONT_FAMILY.EB_GARAMOND;
//     spinsLabel.addChild(spinsPrefix, spinsCount, spinsSuffix);
//     const amount = new BitmapText({
//         text: "0",
//         style: {
//             fontFamily: "Win Amount Font",
//             fontSize: 92,
//             align: "center",
//         },
//     });
//     amount.anchor.set(0.5);
//     amount.position.set(0, 250);
//     amount.zIndex = 3;
//
//     layout.addChild(
//         background,
//         lightEffect,
//         panel,
//         title,
//         wonLabel,
//         amount,
//         spinsLabel,
//     );
//     popup.content.addChild(layout);
//
//     let amountAnimation: NumberAnimation | null = null;
//     let closeTimer: ReturnType<typeof setTimeout> | undefined;
//     let completion: (() => void) | undefined;
//     let closing = false;
//     let currentWinAmount = 0;
//     let isSkipRequested = false;
//     const amountPulse: BlinkAnimation = createBlinkAnimation({
//         target: amount,
//         ticker: app.ticker,
//         minAlpha: 1,
//     });
//
//     const clearCloseTimer = () => {
//         if (closeTimer === undefined) return;
//         clearTimeout(closeTimer);
//         closeTimer = undefined;
//     };
//     const stopAmountAnimation = () => {
//         amountAnimation?.stop();
//         amountAnimation = null;
//         amountPulse.stop();
//     };
//     const updateAmount = (value: number) => {
//         amount.text = format(value);
//         amount.scale.set(1);
//         if (amount.width > MAX_AMOUNT_WIDTH) {
//             amount.scale.set(MAX_AMOUNT_WIDTH / amount.width);
//         }
//         amountPulse.setBaseScale(amount.scale.x);
//     };
//
//     const requestSkip = () => {
//         if (!popup.isVisible() || closing || isSkipRequested) return;
//
//         isSkipRequested = true;
//         stopAmountAnimation();
//         updateAmount(currentWinAmount);
//         amountPulse.start();
//         clearCloseTimer();
//         closeTimer = setTimeout(() => popup.hide(), SKIP_HOLD_MS);
//     };
//
//     const handlePointerDown = () => requestSkip();
//     const handleKeyDown = (event: KeyboardEvent) => {
//         if (event.code !== "Space") return;
//         event.preventDefault();
//         requestSkip();
//     };
//
//     const addSkipListeners = () => {
//         window.addEventListener("pointerdown", handlePointerDown);
//         window.addEventListener("keydown", handleKeyDown);
//     };
//
//     const removeSkipListeners = () => {
//         window.removeEventListener("pointerdown", handlePointerDown);
//         window.removeEventListener("keydown", handleKeyDown);
//     };
//
//     popup.showWin = (winAmount, fsTotal, onComplete) => {
//         if (popup.isVisible()) return;
//         clearCloseTimer();
//         stopAmountAnimation();
//         completion = onComplete;
//         closing = false;
//         currentWinAmount = Math.max(0, winAmount);
//         isSkipRequested = false;
//         title.text = i18n.t("freeSpinTotalWin.congratulation");
//         wonLabel.text = i18n.t("freeSpinTotalWin.youHaveWon");
//         const count = String(Math.max(0, fsTotal));
//         const countToken = "__FREE_SPIN_COUNT__";
//         const [prefix = "", suffix = ""] = i18n
//             .t("freeSpinTotalWin.inFreeSpins", { count: countToken })
//             .split(countToken);
//         spinsPrefix.text = prefix;
//         spinsCount.text = count;
//         spinsSuffix.text = suffix;
//         const spinLabelParts = [spinsPrefix, spinsCount, spinsSuffix];
//         const spinLabelWidth = spinLabelParts.reduce(
//             (total, part) => total + part.width,
//             0,
//         );
//         let spinLabelX = -spinLabelWidth / 2;
//         spinLabelParts.forEach((part) => {
//             part.x = spinLabelX + part.width / 2;
//             spinLabelX += part.width;
//         });
//         updateAmount(0);
//         background.gotoAndPlay(0);
//         lightEffect.start();
//         popup.show();
//         eventBus.emit(EVENT_NAMES.AUDIO_BONUS_WIN_POPUP_SHOWN, null);
//         addSkipListeners();
//         amountAnimation = animateNumber({
//             from: 0,
//             to: currentWinAmount,
//             durationMs: AMOUNT_ANIMATION_MS,
//             frameMs: 1000 / 40,
//             ticker: app.ticker,
//             onUpdate: updateAmount,
//             onComplete: () => {
//                 amountAnimation = null;
//                 amountPulse.start();
//             },
//         });
//         closeTimer = setTimeout(() => popup.hide(), POPUP_DURATION_MS);
//     };
//
//     const hide = popup.hide.bind(popup);
//     popup.hide = (options: Parameters<Popup["hide"]>[0] = {}) => {
//         if (closing || !popup.isVisible()) return;
//         closing = true;
//         clearCloseTimer();
//         removeSkipListeners();
//         stopAmountAnimation();
//         hide({
//             ...options,
//             callback: () => {
//                 background.gotoAndStop(0);
//                 lightEffect.stop();
//                 releaseSpritesheetGpuTexture(gameAssets.FreeSpinSheet);
//                 releaseSpritesheetGpuTexture(popupRewardSheet);
//                 const onComplete = completion;
//                 completion = undefined;
//                 closing = false;
//                 options.callback?.();
//                 onComplete?.();
//             },
//         });
//     };
//
//     const destroy = popup.destroy.bind(popup);
//     popup.destroy = (...args: Parameters<Popup["destroy"]>) => {
//         if (popup.destroyed) return;
//         clearCloseTimer();
//         removeSkipListeners();
//         stopAmountAnimation();
//         background.gotoAndStop(0);
//         lightEffect.stop();
//         completion = undefined;
//         destroy(...args);
//     };
//
//     popup.setLayout = (mode) => {
//         const gameLayout = MAIN_GAME_LAYOUTS[mode];
//         popup.content.position.set(gameLayout.width / 2, gameLayout.height / 2);
//         popup.setContentLayoutScale(
//             mode === "portrait" ? PORTRAIT_SCALE : LANDSCAPE_SCALE,
//         );
//     };
//     popup.setLayout("landscape");
//
//     return popup;
// }
