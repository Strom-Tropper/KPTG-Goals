// import { Application, Container, Renderer } from "pixi.js";
//
// import {
//     gameAssets,
//     releaseSpritesheetGpuTexture,
// } from "@/modules/game/engine/game.assets";
// import { createBetHistoryPopup } from "./BetHistoryPopup";
// import { createJackpotHistoryPopup } from "./JackpotHistoryPopup";
// import type { MainGameLayoutMode } from "../layouts";
//
// export type HistoryContent = "betHistory" | "jackpotHistory";
//
// export type HistoryPopupView = Container & {
//     show: (content?: HistoryContent) => void;
//     showBetHistory: () => void;
//     showJackpotHistory: () => void;
//     setLayout: (mode: MainGameLayoutMode) => void;
// };
//
// export function createHistoryPopup(
//     app: Application<Renderer>,
// ): HistoryPopupView {
//     const historyPopup = new Container({
//         label: "HistoryPopup",
//         zIndex: 30,
//     }) as HistoryPopupView;
//     const betHistoryView = createBetHistoryPopup(app);
//     const jackpotHistoryView = createJackpotHistoryPopup(app);
//     let activeContent: HistoryContent = "betHistory";
//     let isSwitchingContent = false;
//
//     const getView = (content: HistoryContent) =>
//         content === "betHistory" ? betHistoryView : jackpotHistoryView;
//
//     const show = (content: HistoryContent = activeContent) => {
//         const previousView = getView(activeContent);
//         const nextView = getView(content);
//
//         if (previousView !== nextView) {
//             isSwitchingContent = true;
//             previousView.hide({ animated: false });
//             isSwitchingContent = false;
//         }
//
//         activeContent = content;
//         nextView.showImmediately();
//         nextView.initialData();
//     };
//
//     betHistoryView.setSwitchHandler(() => show("jackpotHistory"));
//     jackpotHistoryView.setSwitchHandler(() => show("betHistory"));
//
//     const releaseHistoryTexture = () => {
//         if (!isSwitchingContent) {
//             releaseSpritesheetGpuTexture(gameAssets.PopupHistory);
//         }
//     };
//     const wrapHideWithGpuRelease = (
//         view: typeof betHistoryView | typeof jackpotHistoryView,
//     ) => {
//         const hide = view.hide.bind(view);
//         view.hide = (options = {}) => {
//             const { callback, ...hideOptions } = options;
//             hide({
//                 ...hideOptions,
//                 callback: () => {
//                     callback?.();
//                     releaseHistoryTexture();
//                 },
//             });
//         };
//     };
//     wrapHideWithGpuRelease(betHistoryView);
//     wrapHideWithGpuRelease(jackpotHistoryView);
//
//     historyPopup.addChild(betHistoryView, jackpotHistoryView);
//     historyPopup.show = show;
//     historyPopup.showBetHistory = () => show("betHistory");
//     historyPopup.showJackpotHistory = () => show("jackpotHistory");
//     historyPopup.setLayout = (mode) => {
//         betHistoryView.setLayout(mode);
//         jackpotHistoryView.setLayout(mode);
//     };
//
//     return historyPopup;
// }
