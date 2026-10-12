// import { Application, Container, Renderer } from "pixi.js";
//
// import { UltraWinAnim } from "@/animations/UltraWinAnim";
// import Popup from "@/components/base/Popup";
// import type { WinPopupView } from "./WinPopupFactory";
// import { EVENT_NAMES, eventBus } from "@/modules/game/engine/game.events";
// import {
//     DEFAULT_GAME_HEIGHT,
//     DEFAULT_GAME_WIDTH,
// } from "@/shared/constants/settings";
// import {
//     animateNumber,
//     type NumberAnimation,
// } from "@/shared/utils/animateNumber";
// import { createBlinkAnimation } from "@/shared/utils/createBlinkAnimation";
// import { createWinAmountBitmapText } from "@/shared/utils/createBitMapText";
// import { format } from "@/shared/utils/formatNumber";
// import {
//     MAIN_GAME_LAYOUTS,
//     type MainGameLayoutMode,
// } from "@/components/main-game/layouts";
// import { createPopupBackgroundAnimation } from "@/components/main-game/createPopupBackgroundAnimation";
//
// const BACKGROUND_ANIMATION = "popup_ultrawin_bg_fbf";
// const PANEL_Y = 368;
// const AMOUNT_ANIMATION_MS = 2500;
// const POPUP_SCALE = 1;
// const PORTRAIT_LAYOUT_SCALE = 0.8;
//
// export type UltraWinPopupView = WinPopupView;
//
// function fitToWidth(container: Container, maxWidth: number) {
//     container.scale.set(1);
//     if (container.width > maxWidth) {
//         container.scale.set(maxWidth / container.width);
//     }
// }
//
// export function createUltraWinPopup(
//     app: Application<Renderer>,
// ): UltraWinPopupView {
//     const popup = new Popup({
//         closeOnEscape: false,
//         closeOnOverlay: false,
//         initialScale: 0.72,
//         overlayAlpha: 0.7,
//         targetScale: 1,
//         ticker: app.ticker ?? null,
//     }) as UltraWinPopupView;
//     popup.label = "UltraWinPopup";
//     popup.zIndex = 30;
//     popup.content.position.set(DEFAULT_GAME_WIDTH / 2, DEFAULT_GAME_HEIGHT / 2);
//
//     const layout = new Container({
//         label: "UltraWinPopupLayout",
//         sortableChildren: true,
//     });
//     const background = createPopupBackgroundAnimation({
//         sheetName: "popup_ultrawin_bg",
//         animationName: BACKGROUND_ANIMATION,
//         fps: 1000 / 33,
//         label: "UltraWinBackground",
//         scale: 2,
//     });
//     background.zIndex = 0;
//
//     const playBackground = () => {
//         background.gotoAndPlay(0);
//     };
//     const stopBackground = () => {
//         background.gotoAndStop(0);
//     };
//
//     const ultraWinAnim = new UltraWinAnim();
//     ultraWinAnim.zIndex = 1;
//     const amountText = createWinAmountBitmapText({
//         align: "center",
//         fontSize: 112,
//         text: "0",
//     });
//     amountText.anchor.set(0.5);
//     amountText.y = PANEL_Y;
//     amountText.zIndex = 2;
//
//     let amountAnimation: NumberAnimation | null = null;
//     const blinkAnimation = createBlinkAnimation({
//         target: amountText,
//         ticker: app.ticker,
//     });
//     const stopAmountAnimation = () => {
//         if (amountAnimation) {
//             eventBus.emit(EVENT_NAMES.AUDIO_BIGWIN_AMOUNT_STOPPED, null);
//         }
//         amountAnimation?.stop();
//         amountAnimation = null;
//         blinkAnimation.stop();
//     };
//     const updateAmount = (amount: number) => {
//         amountText.text = format(amount, 0);
//         fitToWidth(amountText, 980);
//         blinkAnimation.setBaseScale(amountText.scale.x);
//     };
//
//     popup.setWinAmount = (amount) => {
//         stopAmountAnimation();
//         amountText.visible = true;
//         updateAmount(amount);
//         blinkAnimation.start();
//     };
//     popup.showWin = (amount, callback) => {
//         stopAmountAnimation();
//         amountText.visible = true;
//         updateAmount(0);
//         playBackground();
//         ultraWinAnim.playLoop();
//         popup.show(callback);
//         eventBus.emit(EVENT_NAMES.AUDIO_BIGWIN_POPUP_SHOWN, "ultra");
//         eventBus.emit(EVENT_NAMES.AUDIO_BIGWIN_AMOUNT_STARTED, null);
//         amountAnimation = animateNumber({
//             from: 0,
//             to: amount,
//             durationMs: AMOUNT_ANIMATION_MS,
//             frameMs: 1000 / 40,
//             ticker: app.ticker,
//             onUpdate: updateAmount,
//             onComplete: () => {
//                 amountAnimation = null;
//                 eventBus.emit(EVENT_NAMES.AUDIO_BIGWIN_AMOUNT_STOPPED, null);
//                 blinkAnimation.start();
//             },
//         });
//     };
//
//     const hide = popup.hide.bind(popup);
//     popup.hide = (options: Parameters<Popup["hide"]>[0] = {}) => {
//         stopAmountAnimation();
//         stopBackground();
//         ultraWinAnim.stop();
//         hide(options);
//     };
//
//     const destroy = popup.destroy.bind(popup);
//     popup.destroy = (...args: Parameters<Popup["destroy"]>) => {
//         if (popup.destroyed) return;
//         stopAmountAnimation();
//         stopBackground();
//         ultraWinAnim.stop();
//         destroy(...args);
//     };
//
//     layout.addChild(background, ultraWinAnim, amountText);
//     popup.content.addChild(layout);
//     popup.setLayout = (mode: MainGameLayoutMode) => {
//         const gameLayout = MAIN_GAME_LAYOUTS[mode];
//         popup.content.position.set(gameLayout.width / 2, gameLayout.height / 2);
//         popup.setContentLayoutScale(
//             POPUP_SCALE * (mode === "portrait" ? PORTRAIT_LAYOUT_SCALE : 1),
//         );
//     };
//     popup.setLayout("landscape");
//     return popup;
// }
