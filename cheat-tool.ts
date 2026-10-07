type CheatAction = "set" | "clear" | "status";
type JackpotKind = "" | "grand";
type JackpotSelection = JackpotKind | "mini";

type CheatPayload = {
    action?: CheatAction;
    spins?: number;
    case?: string;
    grid?: number[][];
    win?: boolean;
    jackpot?: boolean;
    jackpot_kind?: JackpotKind;
    force_fs_mode?: number;
    free_spins?: number;
    force_stage?: number;
    journey_progress?: number;
};

declare global {
    interface Window {
        showWinlines?: (winLines: unknown[]) => void;
    }
}

type CheatAck = {
    ok?: boolean;
    reason?: string;
    message?: string;
    plan?: CheatPayload | null;
};

type SocketSubscribe = (
    opcode: number,
    callback: (data: CheatAck) => void,
) => void;

const GRID_SLICES = 9;
const GRID_RINGS = 3;

const DEFAULT_GRID: number[][] = [
    [2, 16, 2],
    [5, 3, 11],
    [3, 11, 8],
    [7, 8, 8],
    [6, 13, 15],
    [13, 1, 11],
    [11, 8, 8],
    [8, 11, 8],
    [8, 8, 12],
];

// const DEFAULT_GRID: number[][] = [
//     [8, 13, 16],
//     [8, 13, 16],
//     [8, 13, 16],
//     [8, 13, 16],
//     [8, 13, 16],
//     [8, 13, 16],
//     [8, 13, 16],
//     [8, 13, 16],
//     [8, 13, 16],
// ];

type CustomGridPreset =
    | ""
    | "big"
    | "mega"
    | "ultra"
    | "free_spin_34"
    | "saruman_respin";

const NON_WINNING_SLICE = [1, 2, 3];
const CUSTOM_GRID_WIN_SYMBOL: Record<"big" | "mega" | "ultra", number> = {
    big: 5, // Pippin: 8x (Big Win starts at 5x)
    mega: 8, // Frodo: 15x (Mega Win starts at 10x)
    ultra: 12, // Gandalf: 100x (Ultra Win starts at 50x)
};

const buildWinGrid = (win: "big" | "mega" | "ultra"): number[][] =>
    Array.from({ length: GRID_SLICES }, (_, sliceIndex) =>
        sliceIndex === 0
            ? Array(GRID_RINGS).fill(CUSTOM_GRID_WIN_SYMBOL[win])
            : [...NON_WINNING_SLICE],
    );

// 10% + 10% + 8% + 6% = 34% journey progress.
const FREE_SPIN_GRID: number[][] = [
    [9, 10, 11], // The Three Hunters: 10%
    [9, 10, 11], // The Three Hunters: 10%
    [9, 9, 9], // High-symbol match: 8%
    [5, 6, 2], // Second Breakfast: 6%
    ...Array.from({ length: 5 }, () => [...NON_WINNING_SLICE]),
];

const SYMBOL_ID_TO_NAME: Record<number, string> = {
    1: "Phial of Galadriel",
    2: "Lembas Bread",
    3: "Sting",
    4: "Palantír",
    5: "Pippin",
    6: "Merry",
    7: "Sam",
    8: "Frodo",
    9: "Gimli",
    10: "Legolas",
    11: "Aragorn",
    12: "Gandalf",
    13: "The One Ring (Wild)",
    14: "Gollum (Low Wild)",
    15: "Saruman (Respin)",
    16: "Witch-king (Mini)",
};

const STORYLINE_GRID_OPTIONS: Array<{
    value: string;
    label: string;
    symbols: readonly [number, number, number];
}> = [
    {
        value: "storyline_second_breakfast",
        label: "Storyline · Second Breakfast (5, 6, 2)",
        symbols: [5, 6, 2],
    },
    {
        value: "storyline_burden_of_the_ring",
        label: "Storyline · Burden of the Ring (7, 8, 14)",
        symbols: [7, 8, 14],
    },
    {
        value: "storyline_three_hunters",
        label: "Storyline · Three Hunters (9, 10, 11)",
        symbols: [9, 10, 11],
    },
    {
        value: "storyline_wizards_duel",
        label: "Storyline · Wizards Duel (12, 15, 4)",
        symbols: [12, 15, 4],
    },
    {
        value: "storyline_blade_in_the_dark",
        label: "Storyline · Blade in the Dark (8, 13, 16)",
        symbols: [8, 13, 16],
    },
];

const STORYLINE_GRID_BY_VALUE = new Map(
    STORYLINE_GRID_OPTIONS.map(({ value, symbols }) => [value, symbols]),
);

type DebugWinLineOption = {
    value: string;
    label: string;
    lore_id?: string;
    symbol_id?: number;
};

const DEBUG_WINLINE_LORE_OPTIONS: DebugWinLineOption[] = [
    {
        value: "lore:second_breakfast",
        label: "Second Breakfast",
        lore_id: "second_breakfast",
    },
    {
        value: "lore:burden_of_the_ring",
        label: "Burden of the Ring",
        lore_id: "burden_of_the_ring",
    },
    {
        value: "lore:three_hunters",
        label: "Three Hunters",
        lore_id: "three_hunters",
    },
    {
        value: "lore:blade_in_the_dark",
        label: "Blade in the Dark",
        lore_id: "blade_in_the_dark",
    },
    {
        value: "lore:wizards_duel",
        label: "Wizards Duel",
        lore_id: "wizards_duel",
    },
];

const DEBUG_WINLINE_SYMBOL_OPTIONS: DebugWinLineOption[] = [
    { value: "symbol:5", label: "5 · Pippin", symbol_id: 5 },
    { value: "symbol:6", label: "6 · Merry", symbol_id: 6 },
    { value: "symbol:7", label: "7 · Sam", symbol_id: 7 },
    { value: "symbol:8", label: "8 · Frodo", symbol_id: 8 },
    { value: "symbol:9", label: "9 · Gimli", symbol_id: 9 },
    { value: "symbol:10", label: "10 · Legolas", symbol_id: 10 },
    { value: "symbol:11", label: "11 · Aragorn", symbol_id: 11 },
    { value: "symbol:12", label: "12 · Gandalf", symbol_id: 12 },
];

const DEBUG_WINLINE_OPTIONS = new Map(
    [...DEBUG_WINLINE_LORE_OPTIONS, ...DEBUG_WINLINE_SYMBOL_OPTIONS].map(
        (option) => [option.value, option],
    ),
);

const PRESETS: Array<[string, string]> = [
    ["lose", "Lose"],
    ["win", "Line win (Frodo)"],
    ["wild_line", "Wild line"],
    ["lore_second_breakfast", "Lore: Second Breakfast"],
    ["lore_burden", "Lore: Burden of the Ring"],
    ["lore_three_hunters", "Lore: Three Hunters"],
    ["lore_wizards_duel", "Lore: Wizards Duel"],
    ["lore_blade", "Lore: Blade in the Dark"],
    ["mini", "Minigame / Witch-king"],
    ["saruman", "Saruman respin"],
    ["gollum_sticky", "Gollum sticky ring"],
    ["grand_rings", "Nine rings board"],
];

const field = <T extends HTMLElement>(panel: HTMLElement, id: string) =>
    panel.querySelector<T>(`#${id}`);

export function initCheatTool(
    sendSocketCommand: (opcode: number, payload?: CheatPayload) => unknown,
    onSocketCommand?: SocketSubscribe,
    offSocketCommand?: SocketSubscribe,
) {
    const urlParams = new URLSearchParams(window.location.search);
    const urlCheat = urlParams.get("cheat");
    let localCheat: string | null = null;
    if (urlCheat === null) {
        try {
            localCheat = window.localStorage.getItem("cheat");
        } catch {
            // localStorage can be unavailable in restricted browser contexts.
        }
    }
    if (urlCheat !== "true" && localCheat !== "true") return;
    if (document.getElementById("qc-cheat-panel")) return;

    const style = document.createElement("style");
    style.id = "qc-cheat-style";
    style.textContent = `
      #qc-cheat-panel { position:fixed;top:10px;left:10px;z-index:99999;display:flex;flex-direction:column;width:min(620px,calc(100vw - 20px));height:min(680px,calc(100vh - 20px));min-width:360px;min-height:140px;max-width:calc(100vw - 10px);max-height:calc(100vh - 10px);overflow:hidden;resize:both;background:rgba(8,12,16,.96);color:#eee;border:1px solid #00ffcc;border-radius:8px;font:12px/1.35 monospace;box-shadow:0 6px 24px #0009;user-select:none }
      #qc-cheat-panel.qc-minimized { height:auto!important;min-height:0;resize:horizontal }
      #qc-cheat-panel.qc-minimized #qc-cheat-content { display:none }
      #qc-cheat-header { flex-shrink:0;display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:#00ffcc;color:#00110d;font-weight:bold;font-size:14px;cursor:grab }
      #qc-cheat-header:active { cursor:grabbing }
      #qc-cheat-content { flex:1;min-height:0;padding:10px;overflow:auto;user-select:text }
      .qc-section { margin-bottom:10px;padding:8px;border:1px solid #3b4a4a;border-radius:5px }
      .qc-section-title { margin-bottom:7px;color:#00ffcc;font-weight:bold }
      .qc-row { display:flex;align-items:center;gap:8px;margin-bottom:7px;flex-wrap:wrap }
      .qc-row:last-child { margin-bottom:0 }
      .qc-row label { display:flex;align-items:center;gap:5px }
      .qc-grow { flex:1;min-width:150px }
      #qc-cheat-panel input,#qc-cheat-panel select { box-sizing:border-box;min-width:58px;padding:5px;background:#182020;color:#fff;border:1px solid #526060;border-radius:3px }
      #qc-cheat-panel input[type=number] { width:76px }
      #qc-cheat-panel input[type=text] { width:100% }
      .qc-grid { display:grid;grid-template-columns:repeat(9,minmax(50px,1fr));gap:4px;min-width:520px }
      .qc-slice { padding:4px;border:1px solid #425252;border-radius:4px;background:#ffffff08 }
      .qc-slice-title { margin-bottom:4px;text-align:center;color:#00ffcc }
      .qc-symbol { width:100%;min-width:0!important;margin-bottom:3px;padding:3px!important }
      .qc-symbol:last-child { margin-bottom:0 }
      .qc-buttons { display:grid;grid-template-columns:1fr;gap:6px }
      .qc-btn { padding:6px;border:0;border-radius:4px;background:#00ffcc;color:#00110d;font-weight:bold;cursor:pointer }
      .qc-btn:hover { background:#00d9ad }.qc-btn.danger { background:#e5484d;color:#fff }.qc-btn.secondary { background:#526060;color:#fff }
      .qc-grid-action { width:100%;margin-top:8px }
      .qc-icon { border:0;background:transparent;color:#00110d;font:bold 16px monospace;cursor:pointer }
      #qc-cheat-status { padding:6px;border-radius:4px;background:#101818;color:#aababa;white-space:pre-wrap;word-break:break-word;user-select:text }
      #qc-toast-container { position:fixed;top:20px;right:20px;z-index:100000;display:flex;flex-direction:column;gap:8px;pointer-events:none }
      .qc-toast { max-width:420px;padding:10px 14px;border-radius:5px;background:#00ffcc;color:#00110d;font:bold 13px monospace;box-shadow:0 4px 12px #0008;animation:qcToastIn .2s ease-out }
      .qc-toast.error { background:#e5484d;color:#fff }
      @keyframes qcToastIn { from { transform:translateX(20px);opacity:0 } }
    `;
    document.head.appendChild(style);

    const symbolOptions = (selected: number) =>
        Object.entries(SYMBOL_ID_TO_NAME)
            .map(
                ([id, name]) =>
                    `<option value="${id}"${Number(id) === selected ? " selected" : ""}>${id} · ${name}</option>`,
            )
            .join("");
    const storylineOptions = STORYLINE_GRID_OPTIONS.map(
        ({ value, label }) => `<option value="${value}">${label}</option>`,
    ).join("");
    const gridControls = DEFAULT_GRID.map(
        (slice, sliceIndex) => `<div class="qc-slice">
          <div class="qc-slice-title">S${sliceIndex}</div>
          <select class="qc-symbol qc-slice-symbol" title="Set all rings or a storyline in slice ${sliceIndex}" data-slice-master="${sliceIndex}"><option value="">Mixed</option><optgroup label="Storylines">${storylineOptions}</optgroup><optgroup label="Same symbol">${symbolOptions(0)}</optgroup></select>
          ${slice
              .map(
                  (symbol, ringIndex) =>
                      `<select class="qc-symbol" title="Slice ${sliceIndex}, ring ${ringIndex}" data-slice="${sliceIndex}" data-ring="${ringIndex}">${symbolOptions(symbol)}</select>`,
              )
              .join("")}
        </div>`,
    ).join("");
    const debugWinLineOptionMarkup = (options: DebugWinLineOption[]): string =>
        options
            .map(
                ({ value, label }) =>
                    `<option value="${value}">${label}</option>`,
            )
            .join("");
    const debugWinLineControls = Array.from(
        { length: GRID_SLICES },
        (_, sliceIndex) => `<div class="qc-slice">
          <div class="qc-slice-title">S${sliceIndex}</div>
          <select class="qc-symbol qc-debug-winline" title="Debug winline animation for slice ${sliceIndex}" data-debug-winline-slice="${sliceIndex}">
            <option value="">None</option>
            <optgroup label="lore_ids">${debugWinLineOptionMarkup(DEBUG_WINLINE_LORE_OPTIONS)}</optgroup>
            <optgroup label="symbol_ids">${debugWinLineOptionMarkup(DEBUG_WINLINE_SYMBOL_OPTIONS)}</optgroup>
          </select>
        </div>`,
    ).join("");

    const panel = document.createElement("div");
    panel.id = "qc-cheat-panel";
    panel.innerHTML = `
      <div id="qc-cheat-header"><span>🛠 g-59 QC CHEAT · opcode 666</span><div><button id="qc-popout" class="qc-icon" title="Open in a separate window">↗</button><button id="qc-toggle" class="qc-icon">_</button><button id="qc-close" class="qc-icon">×</button></div></div>
      <div id="qc-cheat-content">
        <div class="qc-section">
          <div class="qc-section-title">Preset plan</div>
          <div class="qc-row"><select id="qc-case" class="qc-grow">${PRESETS.map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}</select><label>Spins <input id="qc-spins" type="number" min="1" max="100" value="1"></label></div>
          <div class="qc-row"><label>Jackpot <select id="qc-jackpot"><option value="">None</option><option value="grand">Grand</option><option value="mini">Mini</option></select></label></div>
          <div class="qc-buttons"><button id="qc-send-preset" class="qc-btn">Apply preset</button></div>
        </div>
        <div class="qc-section">
          <div class="qc-section-title">Random win</div>
          <div class="qc-row"><label>Spins <input id="qc-random-spins" type="number" min="1" max="100" value="1"></label></div>
          <button id="qc-send-random-win" class="qc-btn qc-grid-action">Apply random win</button>
        </div>
        <div class="qc-section">
          <div class="qc-section-title">Custom grid · 9 slices × 3 rings (inner → outer)</div>
          <div class="qc-row"><label>Grid preset <select id="qc-grid-win"><option value="">Custom</option><option value="big">Big Win · Pippin 8x</option><option value="mega">Mega Win · Frodo 15x</option><option value="ultra">Ultra Win · Gandalf 100x</option><option value="free_spin_34">Free Spin 34%</option><option value="saruman_respin">Saruman Respin</option></select></label><button id="qc-random-grid" class="qc-btn secondary">Random grid</button></div>
          <div class="qc-grid">${gridControls}</div>
          <button id="qc-send-grid" class="qc-btn qc-grid-action">Apply custom grid</button>
        </div>
        <div class="qc-section">
          <div class="qc-section-title">Debug winline · FE animation only</div>
          <div class="qc-grid">${debugWinLineControls}</div>
          <button id="qc-play-winline" class="qc-btn qc-grid-action">Play winline animation</button>
        </div>
        <div class="qc-section">
          <div class="qc-section-title">Session patch (blank = omit)</div>
          <div class="qc-row"><label>FS mode <input id="qc-fs-mode" type="number" min="0" max="3" placeholder="0..3"></label><label>Free spins <input id="qc-free-spins" type="number" min="0" placeholder="≥0"></label><label>Stage <input id="qc-stage" type="number" min="0" max="3" placeholder="0..3"></label></div>
          <button id="qc-send-patch" class="qc-btn qc-grid-action">Apply patch</button>
        </div>
        <div id="qc-cheat-status">Ready. Waiting for opcode 666 acknowledgement.</div>
      </div>`;
    document.body.appendChild(panel);

    const toastContainer = document.createElement("div");
    toastContainer.id = "qc-toast-container";
    document.body.appendChild(toastContainer);
    let popupWindow: Window | null = null;
    let closingTool = false;

    const showToast = (message: string, error = false) => {
        const toast = document.createElement("div");
        toast.className = `qc-toast${error ? " error" : ""}`;
        toast.textContent = `${error ? "✖" : "✔"} ${message}`;
        toastContainer.appendChild(toast);
        window.setTimeout(() => toast.remove(), 3200);
    };
    const readNumber = (id: string): number | undefined => {
        const value = field<HTMLInputElement>(panel, id)?.value.trim();
        return value ? Number(value) : undefined;
    };
    const basePayload = (): CheatPayload => ({
        action: "set",
        spins: readNumber("qc-spins") ?? 1,
    });
    const addSessionPatch = (payload: CheatPayload) => {
        const mappings: Array<[string, keyof CheatPayload]> = [
            ["qc-fs-mode", "force_fs_mode"],
            ["qc-free-spins", "free_spins"],
            ["qc-stage", "force_stage"],
        ];
        mappings.forEach(([id, key]) => {
            const value = readNumber(id);
            if (value !== undefined) Object.assign(payload, { [key]: value });
        });
        if (
            field<HTMLSelectElement>(panel, "qc-grid-win")?.value ===
            "free_spin_34"
        ) {
            payload.journey_progress = 0;
        }
        return payload;
    };
    const sendCheat = (payload: CheatPayload) => {
        sendSocketCommand(666, payload);
        const status = field<HTMLElement>(panel, "qc-cheat-status");
        if (status) status.textContent = `Sent: ${JSON.stringify(payload)}`;
    };
    const readGrid = () =>
        Array.from({ length: GRID_SLICES }, (_, slice) =>
            Array.from({ length: GRID_RINGS }, (_, ring) =>
                Number(
                    panel.querySelector<HTMLSelectElement>(
                        `.qc-symbol[data-slice="${slice}"][data-ring="${ring}"]`,
                    )?.value,
                ),
            ),
        );

    const writeGrid = (grid: number[][]) => {
        grid.forEach((slice, sliceIndex) => {
            slice.forEach((symbol, ringIndex) => {
                const select = panel.querySelector<HTMLSelectElement>(
                    `.qc-symbol[data-slice="${sliceIndex}"][data-ring="${ringIndex}"]`,
                );
                if (select) select.value = String(symbol);
            });
            const master = panel.querySelector<HTMLSelectElement>(
                `.qc-slice-symbol[data-slice-master="${sliceIndex}"]`,
            );
            if (master) {
                master.value = slice.every((symbol) => symbol === slice[0])
                    ? String(slice[0])
                    : "";
            }
        });
    };

    const markGridAsCustom = () => {
        const winSelect = field<HTMLSelectElement>(panel, "qc-grid-win");
        if (winSelect) winSelect.value = "";
    };

    field(panel, "qc-random-grid")?.addEventListener("click", () => {
        const symbolIds = Object.keys(SYMBOL_ID_TO_NAME).map(Number);
        const randomGrid = Array.from({ length: GRID_SLICES }, () =>
            Array.from(
                { length: GRID_RINGS },
                () => symbolIds[Math.floor(Math.random() * symbolIds.length)],
            ),
        );
        writeGrid(randomGrid);
        markGridAsCustom();
    });

    field<HTMLSelectElement>(panel, "qc-grid-win")?.addEventListener(
        "change",
        (event) => {
            const preset = (event.currentTarget as HTMLSelectElement)
                .value as CustomGridPreset;
            if (preset === "saruman_respin") {
                writeGrid(DEFAULT_GRID);
            } else if (preset === "free_spin_34") {
                writeGrid(FREE_SPIN_GRID);
            } else if (
                preset === "big" ||
                preset === "mega" ||
                preset === "ultra"
            ) {
                writeGrid(buildWinGrid(preset));
            }
        },
    );
    panel
        .querySelectorAll<HTMLSelectElement>(".qc-slice-symbol")
        .forEach((master) =>
            master.addEventListener("change", () => {
                if (!master.value) return;
                const sliceIndex = Number(master.dataset.sliceMaster);
                const storyline = STORYLINE_GRID_BY_VALUE.get(master.value);
                panel
                    .querySelectorAll<HTMLSelectElement>(
                        `.qc-symbol[data-slice="${sliceIndex}"][data-ring]`,
                    )
                    .forEach(
                        (select, ringIndex) =>
                            (select.value = storyline
                                ? String(storyline[ringIndex])
                                : master.value),
                    );
                markGridAsCustom();
            }),
        );
    panel
        .querySelectorAll<HTMLSelectElement>(".qc-symbol[data-ring]")
        .forEach((select) =>
            select.addEventListener("change", () => {
                const sliceIndex = Number(select.dataset.slice);
                const values = Array.from(
                    panel.querySelectorAll<HTMLSelectElement>(
                        `.qc-symbol[data-slice="${sliceIndex}"][data-ring]`,
                    ),
                    (ring) => ring.value,
                );
                const master = panel.querySelector<HTMLSelectElement>(
                    `.qc-slice-symbol[data-slice-master="${sliceIndex}"]`,
                );
                if (master) {
                    master.value = values.every((value) => value === values[0])
                        ? values[0]
                        : "";
                }
                markGridAsCustom();
            }),
        );

    field(panel, "qc-send-preset")?.addEventListener("click", () => {
        const jackpotSelection = field<HTMLSelectElement>(panel, "qc-jackpot")
            ?.value as JackpotSelection;
        if (jackpotSelection === "mini") {
            sendCheat({ case: "fs_mini" });
            return;
        }
        if (jackpotSelection) {
            sendCheat({ jackpot_kind: jackpotSelection });
            return;
        }

        const payload = addSessionPatch(basePayload());
        payload.case = field<HTMLSelectElement>(panel, "qc-case")?.value;
        sendCheat(payload);
    });
    field(panel, "qc-send-random-win")?.addEventListener("click", () => {
        sendCheat(
            addSessionPatch({
                action: "set",
                spins: readNumber("qc-random-spins") ?? 1,
                win: true,
            }),
        );
    });
    field(panel, "qc-send-grid")?.addEventListener("click", () =>
        sendCheat(addSessionPatch({ ...basePayload(), grid: readGrid() })),
    );
    field(panel, "qc-play-winline")?.addEventListener("click", () => {
        const winLines = Array.from(
            panel.querySelectorAll<HTMLSelectElement>(".qc-debug-winline"),
        ).flatMap((select) => {
            const option = DEBUG_WINLINE_OPTIONS.get(select.value);
            if (!option) return [];

            return [
                {
                    slice_idx: Number(select.dataset.debugWinlineSlice),
                    symbol_id: option.symbol_id,
                    lore_id: option.lore_id,
                },
            ];
        });

        if (!winLines.length) {
            showToast("Select at least one winline animation", true);
            return;
        }
        if (!window.showWinlines) {
            showToast("WinLineLayer is not ready", true);
            return;
        }

        window.showWinlines(winLines);
        showToast(`Playing ${winLines.length} FE winline animation(s)`);
    });
    field(panel, "qc-send-patch")?.addEventListener("click", () =>
        sendCheat(addSessionPatch(basePayload())),
    );
    const handleAck = (ack: CheatAck) => {
        const message =
            ack.message ??
            ack.reason ??
            (ack.ok ? "Cheat armed" : "Cheat rejected");
        const status = field<HTMLElement>(panel, "qc-cheat-status");
        if (status) status.textContent = JSON.stringify(ack, null, 2);
        showToast(message, ack.ok === false);
    };
    onSocketCommand?.(666, handleAck);

    const header = field<HTMLElement>(panel, "qc-cheat-header");
    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;
    header?.addEventListener("mousedown", (event) => {
        if ((event.target as HTMLElement).closest("button")) return;
        dragging = true;
        const bounds = panel.getBoundingClientRect();
        offsetX = event.clientX - bounds.left;
        offsetY = event.clientY - bounds.top;
    });
    document.addEventListener("mousemove", (event) => {
        if (!dragging) return;
        panel.style.left = `${Math.max(0, event.clientX - offsetX)}px`;
        panel.style.top = `${Math.max(0, event.clientY - offsetY)}px`;
    });
    document.addEventListener("mouseup", () => (dragging = false));

    const content = field<HTMLElement>(panel, "qc-cheat-content");
    let expandedHeight = panel.getBoundingClientRect().height;
    field(panel, "qc-popout")?.addEventListener("click", () => {
        if (popupWindow && !popupWindow.closed) {
            popupWindow.focus();
            return;
        }

        const popup = window.open(
            "",
            "qc-cheat-tool",
            "popup=yes,width=760,height=820,resizable=yes,scrollbars=no",
        );
        if (!popup) {
            showToast("Popup was blocked by the browser", true);
            return;
        }

        popupWindow = popup;
        popup.document.title = "g-59 QC Cheat Tool";
        popup.document.head.appendChild(style.cloneNode(true));
        popup.document.body.style.margin = "0";
        popup.document.body.style.background = "#080c10";

        panel.dataset.previousStyle = panel.getAttribute("style") ?? "";
        panel.style.inset = "0";
        panel.style.width = "100vw";
        panel.style.height = "100vh";
        panel.style.maxWidth = "none";
        panel.style.maxHeight = "none";
        panel.style.minWidth = "0";
        panel.style.minHeight = "0";
        panel.style.resize = "none";
        popup.document.body.append(panel, toastContainer);

        popup.addEventListener("beforeunload", () => {
            if (closingTool || !document.body) return;
            const previousStyle = panel.dataset.previousStyle ?? "";
            panel.setAttribute("style", previousStyle);
            delete panel.dataset.previousStyle;
            document.body.append(panel, toastContainer);
            popupWindow = null;
        });
        popup.focus();
    });
    field(panel, "qc-toggle")?.addEventListener("click", () => {
        if (!content) return;
        const shouldMinimize = !panel.classList.contains("qc-minimized");
        if (shouldMinimize) {
            expandedHeight = panel.getBoundingClientRect().height;
        } else {
            panel.style.height = `${expandedHeight}px`;
        }
        panel.classList.toggle("qc-minimized", shouldMinimize);
        const toggle = field<HTMLElement>(panel, "qc-toggle");
        if (toggle) toggle.textContent = shouldMinimize ? "+" : "_";
    });
    field(panel, "qc-close")?.addEventListener("click", () => {
        closingTool = true;
        offSocketCommand?.(666, handleAck);
        panel.remove();
        toastContainer.remove();
        style.remove();
        if (popupWindow && !popupWindow.closed) popupWindow.close();
        popupWindow = null;
    });
}
