import { Container, Graphics, Text } from "pixi.js";
import {
    betStepper,
    circleButton,
    goalLabel,
    labeledButton,
} from "@/components/GoalControls";
import {
    GOAL_COLUMN_COUNT,
    GOAL_SLOT_COUNT,
} from "@/modules/game/engine/goal-constants";
import type { GoalCellFace } from "@/modules/game/engine/goal-types";
import {
    GOAL_BACKGROUND,
    GOAL_FRAME,
    GOAL_INK,
} from "@/shared/constants/goal";
import { goalCell } from "@/scenes/goal-cells";
import type { GoalBoardArt } from "@/scenes/goal-board-art";

export type { GoalCellFace };

export type GoalBoardModel = {
    width: number;
    height: number;
    cells: GoalCellFace[][];
    pastColumn: number | null;
    nextColumn: number | null;
    pastMultiplier: string | null;
    nextMultiplier: string | null;
    secondsLeft: number | null;
    balanceText: string;
    balanceDetail: string | null;
    randomText: string;
    randomEnabled: boolean;
    mainLabel: string;
    mainDetail: string | null;
    mainEnabled: boolean;
    betCaption: string;
    betText: string;
    betEnabled: boolean;
    notice: string | null;
};

export type GoalBoardActions = {
    onBet: (direction: -1 | 1) => void;
    onMain: () => void;
    onPick: (slot: number) => void;
    onRandom: () => void;
};

export class GoalBoard extends Container {
    private art: GoalBoardArt | null = null;
    private clock: Text | null = null;

    constructor(private readonly actions: GoalBoardActions) {
        super();
        this.label = "GoalBoard";
    }

    setArt(art: GoalBoardArt): void {
        this.art = art;
    }

    show(model: GoalBoardModel): void {
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

    private drawLandscape(model: GoalBoardModel, art: GoalBoardArt): void {
        const margin = Math.round(Math.min(model.width, model.height) * 0.045);
        const buttonH = Math.round(
            Math.min(68, Math.max(48, model.height * 0.072)),
        );
        const captionH = Math.round(buttonH * 0.42);
        const bottom = buttonH + captionH + margin;
        const top = Math.round(model.height * 0.1);
        const grid = fitGrid(
            model.width - margin * 2,
            model.height - top - bottom,
        );
        const gridX = margin + (model.width - margin * 2 - grid.outerW) / 2;
        const gridY = top + (model.height - top - bottom - grid.outerH) / 2;

        this.drawGrid(gridX, gridY, grid, model.cells, art);
        this.drawMultipliers(gridX, gridY, grid, model);
        this.drawCornerMarks(
            model.width - margin,
            margin + buttonH * 0.28,
            buttonH * 0.34,
            art,
        );
        this.drawNotice(
            model,
            model.width / 2,
            margin + buttonH * 0.28,
            Math.max(16, Math.round(buttonH * 0.34)),
        );

        const rowY = model.height - margin - buttonH;
        const gap = Math.round(buttonH * 0.28);
        const balanceW = Math.round(model.width * 0.2);
        const randomW = Math.round(model.width * 0.11);
        const mainW = Math.round(model.width * 0.15);
        const betW = Math.round(model.width * 0.2);
        let x = margin;

        this.addChild(
            labeledButton(
                x,
                rowY,
                balanceW,
                buttonH,
                model.balanceDetail
                    ? [model.balanceText, model.balanceDetail]
                    : [model.balanceText],
                false,
                () => undefined,
                false,
                art.button,
            ),
        );
        x += balanceW + gap;
        this.addChild(
            labeledButton(
                x,
                rowY,
                randomW,
                buttonH,
                [model.randomText],
                model.randomEnabled,
                this.actions.onRandom,
                !model.randomEnabled,
                art.button,
            ),
        );
        this.drawTurnClock(
            model,
            x + randomW / 2,
            rowY - Math.round(buttonH * 0.42),
            Math.round(buttonH * 0.36),
        );
        x += randomW + gap;
        this.addChild(
            labeledButton(
                x,
                rowY,
                mainW,
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

        this.addChild(
            betStepper(
                model.width - margin - betW,
                rowY - captionH,
                betW,
                buttonH,
                captionH,
                model.betCaption,
                model.betText,
                model.betEnabled,
                this.actions.onBet,
                art,
            ),
        );
    }

    private drawPortrait(model: GoalBoardModel, art: GoalBoardArt): void {
        const margin = Math.round(model.width * 0.06);
        const buttonH = Math.round(
            Math.min(58, Math.max(42, model.width * 0.09)),
        );
        const captionH = Math.round(buttonH * 0.46);
        const gap = Math.round(buttonH * 0.28);
        const controlsH = buttonH * 3 + captionH + gap * 3;
        const top = margin + buttonH;
        const grid = fitGrid(
            model.width - margin * 2,
            model.height - top - controlsH - margin,
        );
        const gridX = margin + (model.width - margin * 2 - grid.outerW) / 2;
        const gridY =
            top + (model.height - top - controlsH - margin - grid.outerH) / 2;

        this.drawGrid(gridX, gridY, grid, model.cells, art);
        this.drawMultipliers(gridX, gridY, grid, model);
        this.drawCornerMarks(
            model.width - margin,
            margin + buttonH * 0.2,
            buttonH * 0.32,
            art,
        );
        this.drawNotice(
            model,
            model.width / 2,
            margin + buttonH * 0.2,
            Math.max(14, Math.round(buttonH * 0.32)),
        );

        const buttonW = Math.round(grid.outerW * 0.46);
        const centerX = model.width / 2 - buttonW / 2;
        let y = gridY + grid.outerH + gap * 2;
        this.drawTurnClock(
            model,
            model.width / 2,
            y - Math.round(buttonH * 0.42),
            Math.round(buttonH * 0.36),
        );
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
        y += buttonH + gap + captionH;

        const balanceW = Math.round(grid.outerW * 0.46);
        const betW = Math.round(grid.outerW * 0.46);
        this.addChild(
            labeledButton(
                gridX,
                y,
                balanceW,
                buttonH,
                model.balanceDetail
                    ? [model.balanceText, model.balanceDetail]
                    : [model.balanceText],
                false,
                () => undefined,
                false,
                art.button,
            ),
        );
        this.addChild(
            betStepper(
                gridX + grid.outerW - betW,
                y - captionH,
                betW,
                buttonH,
                captionH,
                model.betCaption,
                model.betText,
                model.betEnabled,
                this.actions.onBet,
                art,
            ),
        );
    }

    private drawGrid(
        gridX: number,
        gridY: number,
        grid: GridFit,
        cells: GoalCellFace[][],
        art: GoalBoardArt,
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
                const face = cells[column]?.[row] ?? "normal";
                const x = originX + column * (grid.cell + grid.gap);
                const y = originY + row * (grid.cell + grid.gap);
                const slot = row;
                const onPress =
                    face === "active"
                        ? () => this.actions.onPick(slot)
                        : undefined;
                this.addChild(goalCell(art, face, x, y, grid.cell, onPress));
            }
        }
    }

    private drawMultipliers(
        gridX: number,
        gridY: number,
        grid: GridFit,
        model: GoalBoardModel,
    ): void {
        const fontSize = Math.max(14, Math.round(grid.cell * 0.2));
        const y = gridY - fontSize * 0.85;

        if (model.pastColumn !== null && model.pastMultiplier) {
            const x = columnCenter(gridX, grid, model.pastColumn);
            const rule = new Graphics();
            rule
                .moveTo(x - fontSize * 3.1, y)
                .lineTo(x - fontSize * 1.7, y)
                .stroke({ color: GOAL_INK, width: Math.max(1, fontSize * 0.08) });
            this.addChild(rule);
            this.addChild(goalLabel(model.pastMultiplier, x, y, fontSize));
        }

        if (model.nextColumn !== null && model.nextMultiplier) {
            const x = columnCenter(gridX, grid, model.nextColumn);
            this.addChild(goalLabel(model.nextMultiplier, x, y, fontSize));
        }
    }

    setSeconds(seconds: number | null): void {
        const clock = this.clock;
        if (!clock) return;

        clock.visible = seconds !== null;
        if (seconds !== null) clock.text = String(seconds);
    }

    private drawNotice(
        model: GoalBoardModel,
        x: number,
        y: number,
        fontSize: number,
    ): void {
        if (!model.notice) return;

        this.addChild(goalLabel(model.notice, x, y, fontSize));
    }

    private drawTurnClock(model: GoalBoardModel, x: number, y: number, fontSize: number): void {
        const clock = goalLabel(
            model.secondsLeft === null ? "" : String(model.secondsLeft),
            x,
            y,
            fontSize,
        );
        clock.visible = model.secondsLeft !== null;
        this.clock = clock;
        this.addChild(clock);
    }

    private drawCornerMarks(
        right: number,
        y: number,
        radius: number,
        art: GoalBoardArt,
    ): void {
        const gap = radius * 2.5;
        const diameter = radius * 2;
        this.addChild(
            circleButton(
                right - diameter - gap - radius,
                y,
                diameter,
                art.info,
            ),
        );
        this.addChild(circleButton(right - radius, y, diameter, art.sound));
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
    const gapRatio = 0.06;
    const padRatio = 0.08;
    const widthUnits = GOAL_COLUMN_COUNT + (GOAL_COLUMN_COUNT - 1) * gapRatio + padRatio * 2;
    const heightUnits = GOAL_SLOT_COUNT + (GOAL_SLOT_COUNT - 1) * gapRatio + padRatio * 2;
    const cell = Math.max(
        16,
        Math.floor(Math.min(maxW / widthUnits, maxH / heightUnits)),
    );
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

function columnCenter(gridX: number, grid: GridFit, column: number): number {
    return (
        gridX +
        grid.pad +
        column * (grid.cell + grid.gap) +
        grid.cell / 2
    );
}
