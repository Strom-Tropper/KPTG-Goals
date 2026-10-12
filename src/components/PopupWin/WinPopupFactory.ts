// import { Container } from "pixi.js";
//
// import Popup from "@/components/base/Popup";
// import { gameEngine } from "@/modules/game/engine/game.engine";
// import { EVENT_NAMES, eventBus } from "@/modules/game/engine/game.events";
// import type { ResponseSpinType } from "@/modules/game/engine/game.types";
// import type { MainGameLayoutMode } from "@/components/main-game/layouts";
//
// const WIN_POPUP_SHOW_DELAY_MS = 500;
// const WIN_POPUP_DURATION_MS = 10000;
// const WIN_POPUP_SKIP_HOLD_MS = 2000;
//
// const WIN_POPUP_LEVELS = {
//     big: "big",
//     mega: "mega",
//     ultra: "ultra",
// } as const;
//
// export type WinPopupLevel =
//     (typeof WIN_POPUP_LEVELS)[keyof typeof WIN_POPUP_LEVELS];
//
// export type WinPopupView = Popup & {
//     setLayout: (mode: MainGameLayoutMode) => void;
//     setWinAmount: (amount: number) => void;
//     showWin: (amount: number, callback?: () => void) => void;
// };
//
// export type WinPopupGroup = Container & {
//     setLayout: (mode: MainGameLayoutMode) => void;
//     bigWinPopup: WinPopupView;
//     megaWinPopup: WinPopupView;
//     ultraWinPopup: WinPopupView;
// };
//
// export function getWinPopupLevel(
//     totalWin: number,
//     totalBet: number,
// ): WinPopupLevel | null {
//     if (totalBet <= 0 || totalWin < totalBet * 5) return null;
//     if (totalWin >= totalBet * 50) return WIN_POPUP_LEVELS.ultra;
//     if (totalWin >= totalBet * 10) return WIN_POPUP_LEVELS.mega;
//     return WIN_POPUP_LEVELS.big;
// }
//
// export function createWinPopupGroup(
//     popups: Record<WinPopupLevel, WinPopupView>,
// ): WinPopupGroup {
//     const popupGroup = new Container() as WinPopupGroup;
//     popupGroup.label = "WinPopupGroup";
//     popupGroup.zIndex = 25;
//     popupGroup.sortableChildren = true;
//     popupGroup.bigWinPopup = popups.big;
//     popupGroup.megaWinPopup = popups.mega;
//     popupGroup.ultraWinPopup = popups.ultra;
//     popupGroup.setLayout = (mode) => {
//         popupGroup.position.set(0, 0);
//         popupGroup.scale.set(1);
//         popupGroup.children.forEach((popup) => {
//             (popup as WinPopupView).setLayout(mode);
//         });
//         popupGroup.pivot.set(0, 0);
//     };
//
//     let pendingSpinData: ResponseSpinType | null = null;
//     let showTimer: ReturnType<typeof setTimeout> | null = null;
//     let completeTimer: ReturnType<typeof setTimeout> | null = null;
//     let activePopup: WinPopupView | null = null;
//     let activeWinAmount = 0;
//     let isSkipRequested = false;
//     let activeWinLineAnimationCount = 0;
//     let isWaitingForWinLineAnimation = false;
//
//     const clearShowTimer = () => {
//         if (showTimer === null) return;
//         clearTimeout(showTimer);
//         showTimer = null;
//     };
//
//     const clearCompleteTimer = () => {
//         if (completeTimer === null) return;
//         clearTimeout(completeTimer);
//         completeTimer = null;
//     };
//
//     const completeWinPopupAnimation = (popup: WinPopupView) => {
//         completeTimer = null;
//         activePopup = null;
//         removeSkipListeners();
//         popup.hide({
//             callback: () => {
//                 eventBus.emit(EVENT_NAMES.WIN_POPUP_ANIMATION_COMPLETED, null);
//             },
//         });
//     };
//
//     const requestSkip = () => {
//         if (!activePopup || !activePopup.isVisible() || isSkipRequested) return;
//
//         const popup = activePopup;
//         isSkipRequested = true;
//         popup.setWinAmount(activeWinAmount);
//         clearCompleteTimer();
//         completeTimer = setTimeout(
//             () => completeWinPopupAnimation(popup),
//             WIN_POPUP_SKIP_HOLD_MS,
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
//     function addSkipListeners() {
//         window.addEventListener("pointerdown", handlePointerDown);
//         window.addEventListener("keydown", handleKeyDown);
//     }
//
//     function removeSkipListeners() {
//         window.removeEventListener("pointerdown", handlePointerDown);
//         window.removeEventListener("keydown", handleKeyDown);
//     }
//
//     const showPendingWinPopup = () => {
//         if (!pendingSpinData) return;
//
//         const spinData = pendingSpinData;
//         pendingSpinData = null;
//
//         const popupLevel = getWinPopupLevel(
//             spinData.total_win,
//             gameEngine.GetTotalBet(),
//         );
//         if (!popupLevel) return;
//
//         const popup = popups[popupLevel];
//
//         clearShowTimer();
//         clearCompleteTimer();
//         showTimer = setTimeout(() => {
//             showTimer = null;
//             activePopup = popup;
//             activeWinAmount = spinData.total_win;
//             isSkipRequested = false;
//             popup.showWin(spinData.total_win);
//             addSkipListeners();
//             completeTimer = setTimeout(
//                 () => completeWinPopupAnimation(popup),
//                 WIN_POPUP_DURATION_MS,
//             );
//         }, WIN_POPUP_SHOW_DELAY_MS);
//     };
//
//     const removeSpinResultListener = eventBus.on(
//         EVENT_NAMES.SPIN_RESULT_RESPONSE,
//         (data) => {
//             const spinData = data as ResponseSpinType;
//
//             if (
//                 spinData.c !== 101 ||
//                 (spinData.free_spin_mode ?? 0) > 0 ||
//                 (spinData.fs_total ?? 0) > 0 ||
//                 spinData.jackpot_win > 0 ||
//                 !getWinPopupLevel(spinData.total_win, gameEngine.GetTotalBet())
//             ) {
//                 pendingSpinData = null;
//                 return;
//             }
//
//             pendingSpinData = spinData;
//         },
//     );
//
//     const removeReelsStoppedListener = eventBus.on(
//         EVENT_NAMES.WIN_POPUP_REELS_STOPPED,
//         () => {
//             if (!pendingSpinData) return;
//
//             if (activeWinLineAnimationCount > 0) {
//                 isWaitingForWinLineAnimation = true;
//                 return;
//             }
//
//             showPendingWinPopup();
//         },
//     );
//     const removeWinLineStartedListener = eventBus.on(
//         EVENT_NAMES.WIN_LINE_ANIMATION_STARTED,
//         () => {
//             activeWinLineAnimationCount += 1;
//         },
//     );
//     const removeWinLineCompletedListener = eventBus.on(
//         EVENT_NAMES.WIN_LINE_ANIMATION_COMPLETED,
//         () => {
//             activeWinLineAnimationCount = Math.max(
//                 0,
//                 activeWinLineAnimationCount - 1,
//             );
//             if (
//                 !isWaitingForWinLineAnimation ||
//                 activeWinLineAnimationCount > 0
//             ) {
//                 return;
//             }
//
//             isWaitingForWinLineAnimation = false;
//             showPendingWinPopup();
//         },
//     );
//
//     const destroy = popupGroup.destroy.bind(popupGroup);
//     popupGroup.destroy = (...args: Parameters<Container["destroy"]>) => {
//         clearShowTimer();
//         clearCompleteTimer();
//         removeSkipListeners();
//         removeSpinResultListener();
//         removeReelsStoppedListener();
//         removeWinLineStartedListener();
//         removeWinLineCompletedListener();
//         destroy(...args);
//     };
//
//     popupGroup.addChild(popups.big, popups.mega, popups.ultra);
//     popupGroup.setLayout("landscape");
//
//     return popupGroup;
// }
