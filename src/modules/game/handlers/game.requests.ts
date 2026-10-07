import { socketClient } from "../ws/game.ws";
import {
    REQ_BET_HISTORY,
    REQ_CHANGE_WALLET,
    REQ_CONFIRM_SESSION,
    REQ_JACKPOT_HISTORY,
    REQ_JACKPOT_VALUES,
    REQ_MINIGAME_PICK,
    REQ_SPIN,
} from "../engine/game.constants";

export const gameRequests = {
    Spin(bet: number) {
        return socketClient.send(REQ_SPIN, { bet });
    },

    RequestJackpotValues() {
        return socketClient.send(REQ_JACKPOT_VALUES);
    },

    StartBet(bet: number) {
        return this.Spin(bet);
    },

    PickHidingSpot(spot: number) {
        if (!Number.isInteger(spot) || spot < 0 || spot > 5) return false;
        return socketClient.send(REQ_MINIGAME_PICK, { spot });
    },

    GetJackpotValuesByCurrentBet() {
        return this.RequestJackpotValues();
    },

    RequestJackpotHistory(page: number = 1, limit: number = 10) {
        return socketClient.send(REQ_JACKPOT_HISTORY, null, { page, limit });
    },

    RequestBetHistory(page: number = 1, limit: number = 10) {
        return socketClient.send(REQ_BET_HISTORY, null, { page, limit });
    },

    ChangeWallet(walletProvider: string) {
        return socketClient.send(REQ_CHANGE_WALLET, {
            wallet_provider: walletProvider,
        });
    },

    ConfirmSession() {
        return socketClient.send(REQ_CONFIRM_SESSION);
    },
};
