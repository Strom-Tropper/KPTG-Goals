import { GAME_ERROR_CODES } from "@/modules/game/engine/game.constants";

export const th = {
    loading: {
        progress: "กำลังโหลด {progress}%",
    },
    bonusGame: {
        chooseHiding: "เลือกที่ซ่อนของคุณ",
        ringWraithGotYou: "ภูตแหวนจับคุณได้แล้ว!",
    },
    adventureMap: {
        lothlorien: "Lothlórien",
        mountDoom: "Mount Doom",
        rivendell: "Rivendell",
    },
    freeSpinIntro: {
        subtitle: "คณะพันธมิตรแห่งแหวนเดินทางถึง",
        your: "",
        freeSpins: "ฟรีสปิน",
        await: "รอคุณอยู่!",
        continueLabel: "{destination}: ฟรีสปิน {spins} รอบ กดเพื่อเล่นต่อ",
    },
    freeSpinTotalWin: {
        congratulation: "ยินดีด้วย!",
        youHaveWon: "คุณชนะ",
        inFreeSpins: "จากฟรีสปิน {count} รอบ",
    },
    betHistory: {
        baseSpinResult: "Base Spin Result",
        bonusGameResult: "BonusGame Result",
        copied: "Copied",
        empty: "No bet history found",
        freeSpinResult: "Freespin Result {current}/{total}",
        jackpotWin: "JACKPOT WIN",
        roundId: "ROUND ID",
        respinResult: "Respin Result",
        time: "TIME",
        title: "BET HISTORY",
        totalBet: "TOTAL BET",
        totalWin: "TOTAL WIN",
        way: "Way",
        win: "Win",
    },
    jackpotHistory: {
        betLevel: "BET LEVEL",
        empty: "No jackpot history found",
        jpAmount: "JP AMOUNT",
        playerId: "PLAYER ID",
        time: "TIME",
        title: "JACKPOT HISTORY",
    },
    mainGame: {
        auto: "AUTO",
        balance: "BALANCE",
        betLevel: "BET LEVEL",
        freeSpinsLeft: "เหลือฟรีสปิน {count} รอบ",
        totalBet: "TOTAL BET",
        turbo: "TURBO",
        winAmount: "WIN AMOUNT",
    },
    goal: {
        balance: "ยอดเงิน",
        betLevel: "ระดับเดิมพัน",
        cashout: "รับเงิน",
        play: "เล่น",
        random: "สุ่ม",
    },
    settings: {
        music: "MUSIC",
        sound: "SOUND",
        title: "SETTINGS",
    },
    info: {
        bonusGame: {
            title: "BONUS GAME",
            instruction:
                "Choose hiding spots one by one to help the Hobbits hide.",
            winDescription: "xxx\nxxx\nxxx",
            lose: "YOU LOSE!!!",
            scatterAwards: "3 Scatters: 1x\n4 Scatters: 2x\n5 Scatters: 5x",
        },
        freespin: {
            title: "FREESPIN",
            mapDescription:
                "After every winning spin, the\nFellowship moves further\nalong their quest.\nReaching specific waypoints\ntriggers the Free Spins\nfeature.",
            rivendell:
                "5 Free Spins. The reels are enriched\nwith extra Medium symbols.",
            lothlorien:
                "10 Free Spins. The reels are enriched\nwith extra High symbols.",
            mountDoom:
                "15 Free Spins. The One Ring becomes\na Sticky Wild for the duration.",
        },
        jackpot: {
            title: "JACKPOT",
            stickyRingsTitle: "Sticky Rings",
            stickyRingsDescription:
                "During these 15 Free Spins, every One Ring symbol that lands\nbecomes a Sticky Wild, locking into place for the remainder\nof the round.",
            collectRings: "COLLECT 9 RINGS TO WIN\nTHE JACKPOT!!!",
            note: "Note: Gollum, Saruman, and the Witch-king will not\nappear during the Mount Doom Free Spins.",
        },
        lorePayout: {
            title: "LORE PAYOUT",
            instruction:
                "Land the exact symbol combination in a single column to\ntrigger a specific storyline and earn an extra payout.",
            stories: {
                burdenOfTheRing: "THE BURDEN OF THE RING",
                threeHunters: "THE THREE HUNTERS",
                knightInTheDark: "A KNIGHT IN THE DARK",
                secondBreakfast: "SECOND BREAKFAST",
                wizardsDuel: "THE WIZARDS' DUEL",
            },
        },
        paytable: {
            title: "PAYTABLE",
            matchDescription:
                "LINE UP 3 MATCHING\nSYMBOLS IN THE SAME\nCOLUMN TO WIN",
        },
        wildScatter: {
            title: "WILD & SCATTER",
            conditionalWild:
                "Conditional <wild>WILD</wild>. Substitutes for all<br>Low value symbols.",
            wild: "<wild>WILD</wild>. Substitutes for all symbols except<br>for scatter.",
            respinScatter:
                "Respin <scatter>SCATTER</scatter>: Every time it lands, summon<br>an Orc Uruk-Hai that locks up to 6 high-value<br>symbols in place, then triggers a Respin.<br>The Respin <scatter>SCATTER</scatter> cannot appear again for<br>10 spins.",
            bonusScatter:
                "<scatter>SCATTER</scatter>. Land 3, 4, or 5 <scatter>SCATTERS</scatter><br>to trigger the BONUS GAME.",
        },
    },
    errors: {
        server: {
            [GAME_ERROR_CODES.CONNECTING]: "Connecting...",
            [GAME_ERROR_CODES.CONNECTION_FAILED]:
                "Connection failed, please reload game",
            [GAME_ERROR_CODES.MAINTENANCE]:
                "System under maintenance.\nPlease come back later.",
            [GAME_ERROR_CODES.INVALID_BET_LEVEL]: "Invalid bet amount.",
            [GAME_ERROR_CODES.ACTIVE_ROUND_EXISTS]:
                "Round already in progress.",
            [GAME_ERROR_CODES.INSUFFICIENT_BALANCE]:
                "Insufficient balance.\n\nPlease change your wallet type or add funds to continue.",
            [GAME_ERROR_CODES.INVALID_STATE]:
                "Command invalid in current state.",
            [GAME_ERROR_CODES.INVALID_TOKEN]: "Account verification failed.",
            [GAME_ERROR_CODES.NO_ACTIVE_SESSION]:
                "Cannot perform action\nwithout an active bet.",
            [GAME_ERROR_CODES.TOKEN_CONFLICT]:
                "Unable to load the game.\n\nPlease close any other active sessions and reload.",
            [GAME_ERROR_CODES.SESSION_EXPIRED]:
                "Session expired.\nPlease reload the game.",
            [GAME_ERROR_CODES.ANOTHER_LOGIN]:
                "Your account has been logged in from another location.",
            [GAME_ERROR_CODES.INTERNAL_ERROR]:
                "Server failure.\nPlease try again later.",
            [GAME_ERROR_CODES.PAYMENT_FAILED]:
                "Payment system is\ncurrently unavailable.\n\nPlease try again later.",
            [GAME_ERROR_CODES.BET_FAILED]:
                "Server failure.\nPlease try again later.",
            [GAME_ERROR_CODES.WIN_FAILED]:
                "Server failure.\nPlease try again later.",
            [GAME_ERROR_CODES.SESSION_CONFLICT]:
                "You still have an open session.\n\nContinuing with this session\nwill log out all others.",
            [GAME_ERROR_CODES.GOODBYE]: "Session closed",
            unknown: "Unknown error (code: {code})",
            unexpected: "An unexpected error occurred",
        },
    },
};
