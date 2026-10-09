import { Container, Graphics, Text } from "pixi.js";
import {
    balanceReadout,
    betMenu,
    betStepper,
    circleButton,
    goalLabel,
    labeledButton,
    valueReadout,
} from "@/components/GameControls";
import {
    GOAL_COLUMN_COUNT,
    GOAL_SLOT_COUNT,
} from "@/modules/game/engine/game.constants";
import type { GoalCellFace } from "@/modules/game/engine/game.types";
import {
    GOAL_BACKGROUND,
    GOAL_FRAME,
    GOAL_INK,
    GOAL_INK_MUTED,
    GOAL_KNOB,
    GOAL_KNOB_EDGE,
} from "@/shared/constants/goal";
import { gameCell } from "@/scenes/GameCells";
import type { GameBoardArt } from "@/scenes/GameBoardArt";

type BoxControl = {
    w: number;
    h: number;
    gapLeft: number;
    gapRight: number;
    gapTop: number;
    gapBottom: number;
};
//board cells size and gap
const boardCells = {
    size: 1,
    gap: 0.06,
    pad: 0.18,
};

const railControls: {
    size: { ratio: number; min: number; max: number };
    timer: BoxControl;
    sound: BoxControl;
    history: BoxControl;
    info: BoxControl;
} = {
    // rail size and gap
    size: { ratio: 0.053, min: 28, max: 48 },
    timer: { w: 1.25, h: 1.25, gapLeft: 15, gapRight: 0, gapTop: 0, gapBottom: 27 },
    sound: { w: 1, h: 1, gapLeft: 25, gapRight: 0, gapTop: 0, gapBottom: 9 },
    history: { w: 1, h: 1, gapLeft: 25, gapRight: 0, gapTop: 0, gapBottom: 9 },
    info: { w: 1, h: 1, gapLeft: 25, gapRight: 0, gapTop: 0, gapBottom: 0 },
};

const bottomControls: {
    height: { ratio: number; min: number; max: number };
    portrait: { ratio: number; min: number; max: number };
    balance: BoxControl;
    random: BoxControl;
    play: BoxControl;
    reset: BoxControl;
    bet: BoxControl & { knobRatio: number; knobGap: number };
} = {
    height: { ratio: 0.068, min: 44, max: 64 },
    portrait: { ratio: 0.09, min: 42, max: 58 },
    balance: { w: 2.05, h: 1, gapLeft: 0, gapRight: 50, gapTop: 25, gapBottom: 0 },
    random: { w: 1.5, h: 1, gapLeft: 0, gapRight: 8, gapTop: 25, gapBottom: 0 },
    play: { w: 2.15, h: 1, gapLeft: 0, gapRight: 8, gapTop: 25, gapBottom: 0 },
    reset: { w: 1, h: 1, gapLeft: 50, gapRight: 8, gapTop: 25, gapBottom: 0 },
    bet: {
        w: 2.2,
        h: 1,
        gapLeft: 0,
        gapRight: 0,
        gapTop: 25,
        gapBottom: 0,
        knobRatio: 0.72,
        knobGap: 0.16,
    },
};

export type { GoalCellFace };

export type GameBoardModel = {
    width: number;
    height: number;
    cells: GoalCellFace[][];
    multipliers: GoalMultiplierMark[];
    secondsLeft: number | null;
    balanceText: string;
    balanceDetail: string | null;
    randomText: string;
    randomEnabled: boolean;
    mainLabel: string;
    mainDetail: string | null;
    mainEnabled: boolean;
    betLines: string[];
    betSelectable: boolean;
    betListOpen: boolean;
    betChoices: { text: string; selected: boolean }[];
    minusEnabled: boolean;
    plusEnabled: boolean;
    resetText: string;
    resetEnabled: boolean;
    historyEnabled: boolean;
    soundMuted: boolean;
};

export type GoalMultiplierMark = {
    column: number;
    text: string;
    passed: boolean;
};

export type GameBoardActions = {
    onBet: (direction: -1 | 1) => void;
    onOpenBetList: () => void;
    onChooseBet: (index: number) => void;
    onResetBet: () => void;
    onMain: () => void;
    onPick: (slot: number) => void;
    onRandom: () => void;
    onInfo: () => void;
    onHistory: () => void;
    onSound: () => void;
};

export class GameBoard extends Container {
    private art: GameBoardArt | null = null;
    private clock: Text | null = null;

    constructor(private readonly actions: GameBoardActions) {
        super();
        this.label = "GameBoard";
    }

    setArt(art: GameBoardArt): void {
        this.art = art;
    }

    show(model: GameBoardModel): void {
        const art = this.art;
        if (!art) return;

        for (const child of this.removeChildren()) {
            child.destroy({ children: true });
        }
        this.clock = null;

        const background = new Graphics();
        background
            .rect(0, 0, model.width, model.height)
            .fill({ color: GOAL_BACKGROUND });
        this.addChild(background);

        if (model.height > model.width) {
            this.drawPortrait(model, art);
            return;
        }

        this.drawLandscape(model, art);
    }

    private drawLandscape(model: GameBoardModel, art: GameBoardArt): void {
        const edge = Math.round(Math.min(model.width, model.height) * 0.03);
        const baseH = controlHeight(model.height, bottomControls.height);
        const band = bottomBand(baseH);
        const railBase = controlHeight(Math.min(model.width, model.height), railControls.size);
        const top = Math.round(baseH * 0.78);
        const frameRightMax = model.width - edge - railSpan(railBase);
        const grid = fitGrid(frameRightMax - edge, model.height - edge - band - top);
        const gridX = edge;
        const gridY = top;
        const frameRight = gridX + grid.outerW;
        const boardBottom = gridY + grid.outerH;

        this.drawGrid(gridX, gridY, grid, model.cells, art);
        this.drawMultipliers(gridX, gridY, grid, model);
        this.drawSideRail(model, art, frameRight, gridY);

        const row = placeBottomRow(gridX, grid.outerW, boardBottom, baseH);
        const betMetrics = betControlMetrics(row.bet.height);
        this.addChild(
            balanceReadout(
                row.balance.x,
                row.balance.y,
                row.balance.width,
                row.balance.height,
                model.balanceText,
                model.balanceDetail,
            ),
        );
        this.addChild(
            labeledButton(
                row.random.x,
                row.random.y,
                row.random.width,
                row.random.height,
                [model.randomText],
                model.randomEnabled,
                this.actions.onRandom,
                !model.randomEnabled,
                art.button,
            ),
        );
        this.addChild(
            labeledButton(
                row.play.x,
                row.play.y,
                row.play.width,
                row.play.height,
                model.mainDetail
                    ? [model.mainLabel, model.mainDetail]
                    : [model.mainLabel],
                model.mainEnabled,
                this.actions.onMain,
                !model.mainEnabled,
                art.button,
            ),
        );
        this.addChild(
            labeledButton(
                row.reset.x,
                row.reset.y,
                row.reset.width,
                row.reset.height,
                [model.resetText],
                model.resetEnabled,
                this.actions.onResetBet,
                !model.resetEnabled,
                art.button,
            ),
        );
        this.addChild(
            betStepper(
                row.bet.x,
                row.bet.y,
                row.bet.width,
                row.bet.height,
                model.betLines,
                model.minusEnabled,
                model.plusEnabled,
                this.actions.onBet,
                model.betSelectable ? this.actions.onOpenBetList : null,
                art,
                betMetrics,
            ),
        );
        this.drawBetMenu(
            model,
            row.bet.x,
            row.bet.y,
            row.bet.width,
            row.bet.height,
            frameRight,
        );
    }

    private drawPortrait(model: GameBoardModel, art: GameBoardArt): void {
        const edge = Math.round(model.width * 0.05);
        const buttonH = controlHeight(model.width, bottomControls.portrait);
        const railBase = controlHeight(Math.min(model.width, model.height), railControls.size);
        const gap = Math.round(buttonH * 0.28);
        const controlsH = buttonH * 4 + gap * 3;
        const top = Math.round(buttonH * 0.7);
        const frameRightMax = model.width - edge - railSpan(railBase);
        const grid = fitGrid(
            frameRightMax - edge,
            model.height - top - controlsH - edge,
        );
        const gridX = edge;
        const gridY = top;

        this.drawGrid(gridX, gridY, grid, model.cells, art);
        this.drawMultipliers(gridX, gridY, grid, model);
        this.drawSideRail(model, art, gridX + grid.outerW, gridY);

        const buttonW = Math.round(grid.outerW * 0.46);
        const centerX = model.width / 2 - buttonW / 2;
        let y = gridY + grid.outerH + gap * 2;
        this.addChild(
            labeledButton(
                centerX,
                y,
                buttonW,
                buttonH,
                [model.randomText],
                model.randomEnabled,
                this.actions.onRandom,
                !model.randomEnabled,
                art.button,
            ),
        );
        y += buttonH + gap;
        this.addChild(
            labeledButton(
                centerX,
                y,
                buttonW,
                buttonH,
                model.mainDetail
                    ? [model.mainLabel, model.mainDetail]
                    : [model.mainLabel],
                model.mainEnabled,
                this.actions.onMain,
                !model.mainEnabled,
                art.button,
            ),
        );
        y += buttonH + gap;
        this.addChild(
            labeledButton(
                centerX,
                y,
                buttonW,
                buttonH,
                [model.resetText],
                model.resetEnabled,
                this.actions.onResetBet,
                !model.resetEnabled,
                art.button,
            ),
        );
        y += buttonH + gap;

        const balanceW = Math.round(grid.outerW * 0.46);
        const betW = Math.round(grid.outerW * 0.5);
        const betX = gridX + grid.outerW - betW;
        this.addChild(
            balanceReadout(
                gridX,
                y,
                balanceW,
                buttonH,
                model.balanceText,
                model.balanceDetail,
            ),
        );
        this.addChild(
            betStepper(
                betX,
                y,
                betW,
                buttonH,
                model.betLines,
                model.minusEnabled,
                model.plusEnabled,
                this.actions.onBet,
                model.betSelectable ? this.actions.onOpenBetList : null,
                art,
                betControlMetrics(buttonH),
            ),
        );
        this.drawBetMenu(model, betX, y, betW, buttonH, gridX + grid.outerW);
    }

    private drawGrid(
        gridX: number,
        gridY: number,
        grid: GridFit,
        cells: GoalCellFace[][],
        art: GameBoardArt,
    ): void {
        const frame = new Graphics();
        frame
            .roundRect(gridX, gridY, grid.outerW, grid.outerH, grid.cell * 0.08)
            .stroke({ color: GOAL_FRAME, width: Math.max(2, grid.cell * 0.035) });
        this.addChild(frame);

        const originX = gridX + grid.pad;
        const originY = gridY + grid.pad;

        for (let column = 0; column < GOAL_COLUMN_COUNT; column += 1) {
            for (let row = 0; row < GOAL_SLOT_COUNT; row += 1) {
                const face = cells[column]?.[row] ?? {
                    tile: "normal" as const,
                    mark: "none" as const,
                };
                const x = originX + column * (grid.cell + grid.gap);
                const y = originY + row * (grid.cell + grid.gap);
                const slot = row;
                const onPress =
                    face.tile === "active"
                        ? () => this.actions.onPick(slot)
                        : undefined;
                this.addChild(gameCell(art, face, x, y, grid.cell, onPress));
            }
        }
    }

    private drawMultipliers(
        gridX: number,
        gridY: number,
        grid: GridFit,
        model: GameBoardModel,
    ): void {
        const fontSize = Math.max(14, Math.round(grid.cell * 0.2));
        const y = gridY - fontSize * 0.85;

        for (const mark of model.multipliers) {
            const x = columnCenter(gridX, grid, mark.column);
            this.addChild(
                goalLabel(
                    mark.text,
                    x,
                    y,
                    fontSize,
                    mark.passed ? GOAL_INK_MUTED : GOAL_INK,
                ),
            );
        }
    }

    setSeconds(seconds: number | null): void {
        const clock = this.clock;
        if (!clock) return;

        if (seconds === null) return;

        clock.visible = true;
        clock.text = String(seconds);
    }

    private drawSideRail(
        model: GameBoardModel,
        art: GameBoardArt,
        frameRight: number,
        frameTop: number,
    ): void {
        const base = controlHeight(Math.min(model.width, model.height), railControls.size);
        const rail = placeRail(frameRight, frameTop, base);
        this.drawTimerKnob(model, rail.timer);
        this.addChild(
            circleButton(
                rail.sound.cx,
                rail.sound.cy,
                rail.sound.width,
                rail.sound.height,
                model.soundMuted ? art.soundOff : art.sound,
                true,
                this.actions.onSound,
            ),
        );
        this.addChild(
            circleButton(
                rail.history.cx,
                rail.history.cy,
                rail.history.width,
                rail.history.height,
                art.history,
                model.historyEnabled,
                this.actions.onHistory,
            ),
        );
        this.addChild(
            circleButton(
                rail.info.cx,
                rail.info.cy,
                rail.info.width,
                rail.info.height,
                art.info,
                true,
                this.actions.onInfo,
            ),
        );
    }

    private drawTimerKnob(model: GameBoardModel, knobBox: RailRect): void {
        const knob = new Graphics();
        knob
            .ellipse(0, 0, knobBox.width / 2, knobBox.height / 2)
            .fill({ color: GOAL_KNOB })
            .stroke({
                color: GOAL_KNOB_EDGE,
                width: Math.max(2, Math.min(knobBox.width, knobBox.height) * 0.06),
            });
        knob.position.set(knobBox.cx, knobBox.cy);
        this.addChild(knob);
        const clock = goalLabel(
            model.secondsLeft === null ? "" : String(model.secondsLeft),
            knobBox.cx,
            knobBox.cy,
            Math.max(12, Math.round(Math.min(knobBox.width, knobBox.height) * 0.34)),
        );
        clock.visible = model.secondsLeft !== null;
        this.clock = clock;
        this.addChild(clock);
    }

    private drawBetMenu(
        model: GameBoardModel,
        anchorX: number,
        anchorY: number,
        anchorW: number,
        buttonH: number,
        maxRight: number,
    ): void {
        if (!model.betListOpen) return;

        const rowH = Math.round(buttonH * 0.72);
        const width = Math.min(Math.max(anchorW, 260), Math.max(anchorW, maxRight - 8));
        const height = 16 + rowH * model.betChoices.length;
        const x = Math.max(8, Math.min(anchorX, maxRight - width));
        const y = Math.max(8, anchorY - height - Math.round(buttonH * 0.18));
        this.addChild(
            betMenu(
                x,
                y,
                width,
                rowH,
                model.betChoices,
                this.actions.onChooseBet,
            ),
        );
    }
}

type GridFit = {
    cell: number;
    gap: number;
    pad: number;
    outerW: number;
    outerH: number;
};

function fitGrid(maxW: number, maxH: number): GridFit {
    const gapRatio = boardCells.gap;
    const padRatio = boardCells.pad;
    const widthUnits = GOAL_COLUMN_COUNT + (GOAL_COLUMN_COUNT - 1) * gapRatio + padRatio * 2;
    const heightUnits = GOAL_SLOT_COUNT + (GOAL_SLOT_COUNT - 1) * gapRatio + padRatio * 2;
    const fitted = Math.floor(Math.min(maxW / widthUnits, maxH / heightUnits));
    const cell = Math.max(16, Math.floor(fitted * boardCells.size));
    const gap = Math.max(4, Math.round(cell * gapRatio));
    const pad = Math.max(6, Math.round(cell * padRatio));

    return {
        cell,
        gap,
        pad,
        outerW: GOAL_COLUMN_COUNT * cell + (GOAL_COLUMN_COUNT - 1) * gap + pad * 2,
        outerH: GOAL_SLOT_COUNT * cell + (GOAL_SLOT_COUNT - 1) * gap + pad * 2,
    };
}
type ButtonRect = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type RailRect = {
    cx: number;
    cy: number;
    width: number;
    height: number;
};

function railBoxes(): BoxControl[] {
    return [
        railControls.timer,
        railControls.sound,
        railControls.history,
        railControls.info,
    ];
}

function railSpan(base: number): number {
    return Math.max(
        ...railBoxes().map(
            (box) => box.gapLeft + Math.max(1, Math.round(base * box.w) - box.gapRight),
        ),
    );
}

function placeRail(frameRight: number, frameTop: number, base: number): {
    timer: RailRect;
    sound: RailRect;
    history: RailRect;
    info: RailRect;
} {
    const boxes = railBoxes();
    const widths = boxes.map((box) => Math.max(1, Math.round(base * box.w) - box.gapRight));
    const heights = boxes.map((box) => Math.max(1, Math.round(base * box.h)));
    const placed: RailRect[] = [];
    let y = frameTop;
    boxes.forEach((box, index) => {
        const width = widths[index];
        const height = heights[index];
        y += box.gapTop;
        const x = frameRight + box.gapLeft;
        placed.push({
            cx: x + width / 2,
            cy: y + height / 2,
            width,
            height,
        });
        y += height + box.gapBottom;
    });
    return {
        timer: placed[0],
        sound: placed[1],
        history: placed[2],
        info: placed[3],
    };
}

function controlHeight(
    screen: number,
    band: { ratio: number; min: number; max: number },
): number {
    return Math.round(
        Math.min(band.max, Math.max(band.min, screen * band.ratio)),
    );
}

function betControlMetrics(buttonH: number): { knob: number; gap: number } {
    return {
        knob: buttonH * bottomControls.bet.knobRatio,
        gap: Math.round(buttonH * bottomControls.bet.knobGap),
    };
}

function bottomBoxes(): BoxControl[] {
    return [
        bottomControls.balance,
        bottomControls.random,
        bottomControls.play,
        bottomControls.reset,
        bottomControls.bet,
    ];
}

function bottomBand(baseH: number): number {
    return Math.max(
        ...bottomBoxes().map((box) => box.gapTop + Math.round(baseH * box.h)),
    );
}

function placeBottomRow(
    boardX: number,
    boardWidth: number,
    boardBottom: number,
    baseH: number,
): {
    balance: ButtonRect;
    random: ButtonRect;
    play: ButtonRect;
    reset: ButtonRect;
    bet: ButtonRect;
} {
    const boxes = bottomBoxes();
    const gapSum = boxes.reduce((sum, box) => sum + box.gapLeft + box.gapRight, 0);
    const wSum = boxes.reduce((sum, box) => sum + box.w, 0);
    const unit = Math.max(0, boardWidth - gapSum) / wSum;
    const widths = boxes.map((box) => Math.max(1, Math.round(box.w * unit)));
    const used = widths.reduce((sum, width) => sum + width, 0) + gapSum;
    widths[widths.length - 1] = Math.max(1, widths[widths.length - 1] + boardWidth - used);

    const placed: ButtonRect[] = [];
    let x = boardX;
    boxes.forEach((box, index) => {
        x += box.gapLeft;
        placed.push({
            x,
            y: boardBottom + box.gapTop,
            width: widths[index],
            height: Math.max(1, Math.round(baseH * box.h) - box.gapBottom),
        });
        x += widths[index] + box.gapRight;
    });
    return {
        balance: placed[0],
        random: placed[1],
        play: placed[2],
        reset: placed[3],
        bet: placed[4],
    };
}

function columnCenter(gridX: number, grid: GridFit, column: number): number {
    return (
        gridX +
        grid.pad +
        column * (grid.cell + grid.gap) +
        grid.cell / 2
    );
}
