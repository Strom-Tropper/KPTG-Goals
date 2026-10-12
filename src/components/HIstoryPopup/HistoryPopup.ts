import { Application, Container, Renderer } from "pixi.js";
import type { MainGameLayoutMode } from "@/components/layouts";
import { createBetHistoryPopup, type BetHistoryView } from "./BetHistoryPopup";

export type HistoryContent = "betHistory" | "jackpotHistory";

export type HistoryPopupView = Container & {
    show: (content?: HistoryContent) => void;
    showBetHistory: () => void;
    showJackpotHistory: () => void;
    setLayout: (mode: MainGameLayoutMode) => void;
};

export function createHistoryPopup(app: Application<Renderer>): HistoryPopupView {
    const historyPopup = new Container({
        label: "HistoryPopup",
        zIndex: 30,
    }) as HistoryPopupView;
    const betHistoryView = createBetHistoryPopup(app);
    let activeContent: HistoryContent = "betHistory";
    const views: Record<HistoryContent, BetHistoryView | null> = {
        betHistory: betHistoryView,
        jackpotHistory: null,
    };

    const getView = (content: HistoryContent) => views[content];

    const show = (content: HistoryContent = activeContent) => {
        const nextView = getView(content);
        if (!nextView) return;

        const previousView = getView(activeContent);
        if (previousView && previousView !== nextView) previousView.hide({ animated: false });
        activeContent = content;
        nextView.showImmediately();
        nextView.initialData();
    };

    betHistoryView.setSwitchHandler(() => show("jackpotHistory"));

    historyPopup.addChild(betHistoryView);
    historyPopup.show = show;
    historyPopup.showBetHistory = () => show("betHistory");
    historyPopup.showJackpotHistory = () => show("jackpotHistory");
    historyPopup.setLayout = (mode) => {
        betHistoryView.setLayout(mode);
        views.jackpotHistory?.setLayout(mode);
    };

    return historyPopup;
}
