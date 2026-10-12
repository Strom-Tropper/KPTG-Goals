export type MainGameLayoutMode = "landscape" | "portrait";

export type ComponentLayout = {
  position: readonly [number, number];
  scale?: number | readonly [number, number];
  rotation?: number;
  visible?: boolean;
  zIndex?: number;
};

export type MainGameLayout = {
  width: number;
  height: number;
  logo: ComponentLayout;
  wheel: ComponentLayout;
  adventureMap: ComponentLayout;
  freeSpinCount: ComponentLayout;
  ringHolder: ComponentLayout;
  jackpotPanel: ComponentLayout;
  balance: ComponentLayout;
  totalBet: ComponentLayout;
  winAmount: ComponentLayout;
  betLevel: ComponentLayout;
  spinButton: ComponentLayout;
  turboButton: ComponentLayout;
  autoButton: ComponentLayout;
  helperIcons: ComponentLayout;
  autoSpinPanel: ComponentLayout;
  popupGroup: ComponentLayout;
};

export const MAIN_GAME_LAYOUTS: Record<MainGameLayoutMode, MainGameLayout> = {
  landscape: {
    width: 1920,
    height: 1080,
    logo: { position: [220, 176], zIndex: 5 },
    wheel: { position: [0, 0], zIndex: 0 },
    adventureMap: { position: [37, 286], zIndex: 0 },
    freeSpinCount: { position: [4, 397], scale: 0.9, zIndex: 2 },
    ringHolder: { position: [54, 274], zIndex: 0 },
    jackpotPanel: { position: [1305, 114] },
    balance: { position: [20, 970] },
    totalBet: { position: [441, 970] },
    winAmount: { position: [757, 917] },
    betLevel: { position: [1166, 967], zIndex: 1 },
    spinButton: { position: [1595, 756], zIndex: 1 },
    turboButton: { position: [1759, 926], zIndex: 2 },
    autoButton: { position: [1381, 757], zIndex: 2 },
    helperIcons: { position: [1686, 6], zIndex: 1 },
    autoSpinPanel: { position: [1032, 632], zIndex: 3 },
    popupGroup: { position: [0, 0], zIndex: 100 },
  },
  portrait: {
    width: 1080,
    height: 1920,
    logo: { position: [310, 108], zIndex: 5 },
    wheel: { position: [-419, 539], zIndex: 0 },
    adventureMap: {
      position: [28, 212],
      zIndex: 1,
    },
    freeSpinCount: { position: [72, 200], zIndex: 2 },
    ringHolder: { position: [18, 210], zIndex: 1 },
    jackpotPanel: { position: [547, 167], scale: 0.85, zIndex: -1 },
    balance: { position: [15, 1473], zIndex: 5 },
    winAmount: { position: [660, 1420], zIndex: 5 },
    totalBet: { position: [18, 1604], zIndex: 5 },
    betLevel: { position: [681, 1600], zIndex: 5 },
    spinButton: { position: [425, 1619], zIndex: 4 },
    turboButton: { position: [219, 1751], zIndex: 5 },
    autoButton: { position: [734, 1717], zIndex: 5 },
    helperIcons: { position: [835, 28], zIndex: 5 },
    autoSpinPanel: { position: [375, 1572], zIndex: 6 },
    popupGroup: { position: [0, 656], scale: 0.5625, zIndex: 100 },
  },
};
