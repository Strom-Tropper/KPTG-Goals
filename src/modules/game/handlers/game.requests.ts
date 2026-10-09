import { socketClient } from "../ws/game.ws";
import {
    REQ_CASHOUT,
    REQ_MINIGAME_PICK,
    REQ_RANDOM,
    REQ_SPIN,
} from "../engine/game.constants";

export const gameRequests = {
    // Spin(bet: number) {
    //     return socketClient.send(REQ_SPIN, { bet });
    // },

    PlayLevel(level: number | string) {
        return socketClient.send(REQ_SPIN, { level });
    },

    PickColumn(ordinal: number, slot: number) {
        return socketClient.send(REQ_MINIGAME_PICK, { ordinal, slot });
    },

    RandomColumn(ordinal: number) {
        return socketClient.send(REQ_RANDOM, { ordinal });
    },

    CashoutColumn(ordinal: number) {
        return socketClient.send(REQ_CASHOUT, { ordinal });
    },

    // RequestState() {
    //     return socketClient.send(REQ_STATE, {});
    // },

    // RequestJackpotValues() {
    //     return socketClient.send(REQ_JACKPOT_VALUES);
    // },

    // StartBet(bet: number) {
    //     return this.Spin(bet);
    // },

    // PickHidingSpot(spot: number) {
    //     if (!Number.isInteger(spot) || spot < 0 || spot > 5) return false;
    //     return socketClient.send(REQ_MINIGAME_PICK, { spot });
    // },

    // GetJackpotValuesByCurrentBet() {
    //     return this.RequestJackpotValues();
    // },

    // RequestJackpotHistory(page: number = 1, limit: number = 10) {
    //     return socketClient.send(REQ_JACKPOT_HISTORY, null, { page, limit });
    // },

    // RequestBetHistory(page: number = 1, limit: number = 10) {
    //     return socketClient.send(REQ_BET_HISTORY, null, { page, limit });
    // },

    // ChangeWallet(walletProvider: string) {
    //     return socketClient.send(REQ_CHANGE_WALLET, {
    //         wallet_provider: walletProvider,
    //     });
    // },

    // ConfirmSession() {
    //     return socketClient.send(REQ_CONFIRM_SESSION);
    // },
};
