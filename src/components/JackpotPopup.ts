// import { Application, Container, Renderer } from "pixi.js";
//
// import { JackpotPopupAnim } from "@/animations/JackpotPopupAnim";
// import Popup from "../base/Popup";
// import {
//     DEFAULT_GAME_HEIGHT,
//     DEFAULT_GAME_WIDTH,
// } from "@/shared/constants/settings";
// import { EVENT_NAMES, eventBus } from "@/modules/game/engine/game.events";
// import type { ResponseSpinType } from "@/modules/game/engine/game.types";
// import { createWinAmountBitmapText } from "@/shared/utils/createBitMapText";
// import { format } from "@/shared/utils/formatNumber";
// import {
//     animateNumber,
//     type NumberAnimation,
// } from "@/shared/utils/animateNumber";
// import { createBlinkAnimation } from "@/shared/utils/createBlinkAnimation";
// import { MAIN_GAME_LAYOUTS, type MainGameLayoutMode } from "./layouts";
// import { createPopupBackgroundAnimation } from "./createPopupBackgroundAnimation";
//
// const BACKGROUND_ANIMATION = "popup_jackpot_bg_fbf";
// const MAX_AMOUNT_WIDTH = 1100;
// const JACKPOT_ANIMATION_MS = 3000;
// const JACKPOT_ANIMATION_FRAME_MS = 1000 / 30;
// const JACKPOT_POPUP_DURATION_MS = 10000;
// const JACKPOT_POPUP_SKIP_HOLD_MS = 2000;
//
// export type JackpotPopupView = Popup & {
//     setLayout: (mode: MainGameLayoutMode) => void;
//     setJackpot: (amount: number) => void;
//     showJackpot: (amount: number, callback?: () => void) => void;
// };
//
// function fitToWidth(container: Container, maxWidth: number) {
//     container.scale.set(1);
//     if (container.width <= maxWidth) return;
//     container.scale.set(maxWidth / container.width);
// }
//
// export function createJackpotPopup(
//     app: Application<Renderer>,
// ): JackpotPopupView {
//     const jackpotPopup = new Popup({
//         closeOnEscape: false,
//         closeOnOverlay: false,
//         initialScale: 0.72,
//         overlayAlpha: 0.7,
//         targetScale: 1,
//         ticker: app.ticker ?? null,
//     }) as JackpotPopupView;
//
//     jackpotPopup.label = "JackpotPopup";
//     jackpotPopup.zIndex = 42;
//     jackpotPopup.content.x = DEFAULT_GAME_WIDTH / 2;
//     jackpotPopup.content.y = DEFAULT_GAME_HEIGHT / 2;
//
//     const popupLayout = new Container();
//     popupLayout.label = "JackpotPopupLayout";
//
//     const background = createPopupBackgroundAnimation({
//         sheetName: "popup_jackpot_bg",
//         animationName: BACKGROUND_ANIMATION,
//         fps: 20,
//         label: "JackpotBackground",
//         scale: 2,
//     });
//
//     const playBackground = () => {
//         background.gotoAndPlay(0);
//     };
//
//     const stopBackground = () => {
//         background.gotoAndStop(0);
//     };
//
//     const jackpotPopupAnim = new JackpotPopupAnim();
//     jackpotPopupAnim.position.set(-974, -548);
//     jackpotPopupAnim.zIndex = 1;
//
//     const amountText = createWinAmountBitmapText({
//         fontSize: 108,
//         text: "0",
//         align: "center",
//     });
//     amountText.anchor.set(0.5);
//     amountText.zIndex = 2;
//     jackpotPopupAnim.attachWinAmount(amountText);
//
//     let jackpotAnimation: NumberAnimation | null = null;
//     let hideSequenceId = 0;
//     let hideTimer: ReturnType<typeof setTimeout> | null = null;
//     let currentJackpotAmount = 0;
//     let isSkipRequested = false;
//     const amountBlinkAnimation = createBlinkAnimation({
//         target: amountText,
//         ticker: app.ticker,
//     });
//
//     const stopJackpotAnimation = () => {
//         if (jackpotAnimation) {
//             eventBus.emit(EVENT_NAMES.AUDIO_BIGWIN_AMOUNT_STOPPED, null);
//         }
//         jackpotAnimation?.stop();
//         jackpotAnimation = null;
//         amountBlinkAnimation.stop();
//     };
//
//     const updateJackpotText = (amount: number) => {
//         amountText.text = format(amount, 0);
//         fitToWidth(amountText, MAX_AMOUNT_WIDTH);
//         amountBlinkAnimation.setBaseScale(amountText.scale.x);
//     };
//
//     const setJackpot = (amount: number) => {
//         stopJackpotAnimation();
//         updateJackpotText(amount);
//         amountBlinkAnimation.start();
//     };
//
//     const clearHideTimer = () => {
//         if (hideTimer === null) return;
//         clearTimeout(hideTimer);
//         hideTimer = null;
//     };
//
//     const completeJackpotPopup = (currentHideSequenceId: number) => {
//         if (currentHideSequenceId !== hideSequenceId) return;
//
//         hideTimer = null;
//         jackpotPopup.hide({
//             callback: () => {
//                 eventBus.emit(EVENT_NAMES.JACKPOT_ANIMATION_COMPLETED, null);
//             },
//         });
//     };
//
//     const requestSkip = () => {
//         if (!jackpotPopup.isVisible() || isSkipRequested) return;
//
//         isSkipRequested = true;
//         setJackpot(currentJackpotAmount);
//         clearHideTimer();
//         const currentHideSequenceId = hideSequenceId;
//         hideTimer = setTimeout(
//             () => completeJackpotPopup(currentHideSequenceId),
//             JACKPOT_POPUP_SKIP_HOLD_MS,
//         );
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
//     const showJackpot = (amount: number, callback?: () => void) => {
//         hideSequenceId += 1;
//         const currentHideSequenceId = hideSequenceId;
//
//         clearHideTimer();
//         stopJackpotAnimation();
//         currentJackpotAmount = amount;
//         isSkipRequested = false;
//         updateJackpotText(0);
//         playBackground();
//         jackpotPopupAnim.playLoop();
//         jackpotPopup.show(callback);
//         eventBus.emit(EVENT_NAMES.AUDIO_JACKPOT_SHOWN, null);
//         eventBus.emit(EVENT_NAMES.AUDIO_BIGWIN_AMOUNT_STARTED, null);
//         addSkipListeners();
//
//         hideTimer = setTimeout(
//             () => completeJackpotPopup(currentHideSequenceId),
//             JACKPOT_POPUP_DURATION_MS,
//         );
//
//         jackpotAnimation = animateNumber({
//             from: 0,
//             to: amount,
//             durationMs: JACKPOT_ANIMATION_MS,
//             frameMs: JACKPOT_ANIMATION_FRAME_MS,
//             onUpdate: updateJackpotText,
//             onComplete: () => {
//                 jackpotAnimation = null;
//                 eventBus.emit(EVENT_NAMES.AUDIO_BIGWIN_AMOUNT_STOPPED, null);
//                 amountBlinkAnimation.start();
//             },
//         });
//     };
//
//     let pendingJackpotWin: number | null = null;
//
//     eventBus.on(EVENT_NAMES.SPIN_RESULT_RESPONSE, (data) => {
//         const spinData = data as ResponseSpinType;
//
//         if (spinData.c !== 101 || spinData.jackpot_win <= 0) {
//             pendingJackpotWin = null;
//             return;
//         }
//
//         pendingJackpotWin = spinData.jackpot_win;
//     });
//
//     eventBus.on(EVENT_NAMES.JACKPOT_REELS_STOPPED, () => {
//         if (pendingJackpotWin === null) return;
//
//         showJackpot(pendingJackpotWin);
//         pendingJackpotWin = null;
//     });
//
//     popupLayout.addChild(background, jackpotPopupAnim);
//
//     jackpotPopup.content.addChild(popupLayout);
//     jackpotPopup.setJackpot = setJackpot;
//     jackpotPopup.showJackpot = showJackpot;
//     jackpotPopup.setLayout = (mode) => {
//         const layout = MAIN_GAME_LAYOUTS[mode];
//         jackpotPopup.content.position.set(layout.width / 2, layout.height / 2);
//         jackpotPopup.setContentLayoutScale(mode === "portrait" ? 0.8 : 1);
//     };
//     jackpotPopup.setLayout("landscape");
//
//     const hide = jackpotPopup.hide.bind(jackpotPopup);
//     jackpotPopup.hide = (options: Parameters<Popup["hide"]>[0] = {}) => {
//         hideSequenceId += 1;
//         clearHideTimer();
//         removeSkipListeners();
//         stopJackpotAnimation();
//         stopBackground();
//         jackpotPopupAnim.stop();
//         hide(options);
//     };
//
//     const destroy = jackpotPopup.destroy.bind(jackpotPopup);
//     jackpotPopup.destroy = (...args: Parameters<Popup["destroy"]>) => {
//         if (jackpotPopup.destroyed) return;
//         clearHideTimer();
//         removeSkipListeners();
//         stopJackpotAnimation();
//         stopBackground();
//         jackpotPopupAnim.stop();
//         destroy(...args);
//     };
//
//     return jackpotPopup;
// }
