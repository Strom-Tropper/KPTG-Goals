# How we work

AI that is about to write code: stop. `AGENTS.md` is already loaded. This file is the long form. Read it only when a rule there is unclear.

`pixi-core` is the company PixiJS v8 template. A new game is built inside this tree. Do not create a second app, a second bundler, or a `src/` layout of your own.

Sibling folder `../Demo html` is the Goal prototype. Read it. Do not implement the new game there, and do not migrate that folder into TypeScript.

## Five rules

1. The template is the architecture. A reference game is not.
2. Read the reference game before building a similar mechanic. Mark each piece reuse, extract, rewrite, or discard. Do not copy its files in.
3. Game rules live in `src/modules/game/engine/`. They do not import Pixi, the DOM, a store, or a socket. The scene passes values in and receives a result.
4. Scenes and components paint state. They do not own the rules. A pointer handler calls a store or an engine function and returns.
5. Check the scope you changed. This repo has no test runner. Do not add one unless the task asks.

Also:

- Do not add a directory that `docs/RULE.md` does not list, unless the task says to. `storm/` exists because this task asked for notes here. Game code does not go in `storm/`.
- Do not add a package the template does not use.
- Do not expand the task. No audio rewrite, no socket rewrite, no theme system, while the task is one mechanic.
- Do not refactor unrelated files. `src/scenes/main/MainGame.ts` uses `new Text`. That is not a pattern. New code uses the factories.

## Docs and the code

| Docs say | Code does |
| --- | --- |
| Zustand | There is no `zustand` dependency. Stores use `createStore` in `src/shared/utils/store-utils.ts`. `gameStore`, `uiStore`, `userStore` expose `getState`, `setState`, `subscribe`. |
| Scene files are only `PascalCaseScene.ts` | `docs/RULE.md` is the naming table. Scenes export `setup*Scene` or `create*Scene`. Match the file you are extending. |
| README project tree | `docs/RULE.md` tree, plus `src/modules/game/engine/` for pure rules. That engine folder is not created yet. |
| Shell is `index.html` plus `public/css/` | `index.html` is the shell. `public/css/` is not on disk. |

Do not `npm install zustand` to match the README.

State that more than one scene needs goes in `src/state/`, through `setState`. Unsubscribe in the scene `destroy`. Do not keep the source of truth on a display object.

The balance number the HUD counter reads is `userStore.balance`. `gameStore.wallets` is the socket wallet list used for the wallet icon.

## Where new code goes

| Job | Place |
| --- | --- |
| Boot, resize, design size | `src/app/`. Design size is `DEFAULT_GAME_WIDTH` / `DEFAULT_GAME_HEIGHT` in `src/app/resize.ts` (1920×1080). Use that. Do not invent a second viewport. |
| Pure rules | `src/modules/game/engine/` |
| Socket and server messages | `src/modules/game/ws/`, `src/modules/game/handlers/`. Leave them alone unless the task is network. |
| Screens | `src/scenes/` |
| Shared UI | `src/components/`. Modals go through `showModal` in `src/components/base/BaseModal.ts`. |
| Spine | A wrapper in `src/animations/` that exports `create*Spine` or `create*Effect`. Scenes do not call `createSpineAnimation`. |
| Pixi objects | `createSprite`, `createContainer`, `createText`, `createBitmapText`, `createGraphics` from `@/utils`. |
| Colors, bets, limits | `src/shared/constants/` |
| Copy | `src/i18n/`. Call `i18n.t("...")` from `@/i18n/i18nManager`. No hardcoded player strings in a component. |
| Textures, spines, fonts | `TEX`, `SPINES`, `FONT` in `src/shared/constants/assets-config.ts`. |
| Sound | `src/systems/audio.ts`. Add a cue there. Do not spawn `Audio` from a scene. |
| Images and spines on disk | `raw-assets/`. Then `npm run assetpack`. Do not edit `public/assets/`. |

Imports use `@/`. Exports are functions. Spine wrappers are the exception that may be classes, matching the files already in `src/animations/`.

`src/animations/` is for Spine wrappers. A ticker flip from the Goal prototype stays with the board scene.

`en{copy}` is the language source. A new file there needs the same name in every other language folder. `npm run validate:lang` checks this. Extensions may differ.

Pre-commit runs `validate:lang`, `check-asset-sizes`, and lint-staged. Do not skip the hooks. Files over 5MB in a language folder fail the commit.

`console.log` fails lint. `console.warn` and `console.error` are allowed.

No comment, unless the next reader cannot get the reason from the names. Do not bring the Vietnamese comments from the Goal prototype into this repo.

## Rendering

The shell is `index.html`. The game surface is one Pixi stage. Balance, modals, buttons, and the board in this template are Pixi, built with the factories.

A DOM layer for header, bet bar, or payout is a per-game decision. Do it only when the task for that game names the exact controls. For this Keno demo, the board, picks, draw, balance, bet, and play stay on the Pixi stage.

## Plan, then a thin slice

1. Read `docs/RULE.md`, `storm/README.md`, `storm/how-we-work.md`, `storm/architecture.md`, and the template files you will touch.
2. If the mechanic exists in the Goal prototype, read that code and mark reuse, extract, rewrite, or discard.
3. Search this repo for a factory, store, i18n key, texture constant, or audio cue that already does the job.
4. Write a short plan: files to create or edit, the reference decision, and the check you will run.
5. Build a thin slice. One action, one state change, one visible result. Then the next action.
6. Run the check below for that slice before starting the next.
7. Stop at the done list. Report what you did not run.

The engine returns a result. The scene writes the store, plays a cue, and paints. The engine does not subtract a balance, play a sound, or touch a display object.

Before writing code, answer:

- Is this file inside `pixi-core/src`, the Goal folder, or `storm/`?
- Does `docs/RULE.md` already say where this code goes?
- Does a factory, store, key, or cue already exist?
- Which reference file did you read, and is it reuse, extract, rewrite, or discard?
- What spec number is still missing? Do not invent a paytable, a pick limit, or a bet step.
- What single command can show this slice is wrong?

## What to run

There is no unit-test script. `npm run build:prod` is the full gate: `validate:lang`, assetpack, manifest, lint, `tsc`, Vite build.

| Change | Run |
| --- | --- |
| A pure rule in `engine/` | `npx tsc --noEmit` on that work. Do not open the game unless the task also changes what the player sees. |
| A store field | `tsc`, then the one flow that reads the field, in `npm run dev`. |
| A scene, component, or animation | `tsc`, lint on the touched files, then the screen in `npm run dev`. |
| Copy or a texture alias | `npm run assetpack` and `npm run validate:lang`, then the screen. |
| Socket or handler | `tsc`, lint, then the flow with the backend the task names. Do not fake a server. |
| A playable round, or a milestone | `npm run build:prod`, then one full play in the browser. |

Random rules take a random source argument. A check that calls `Math.random()` and hopes is not a check.

Visual check means using the control. The first frame is not enough. Look at desktop, a tablet width, and a narrow width. Text stays readable, controls stay usable, nothing clips, a modal stays inside the stage.

Do not claim a command or a browser pass you did not run.

Dev server port in `vite.config.ts` is `8090`.

## Done

- The new code sits in the table above.
- Rules do not import Pixi, DOM, a store, or a socket.
- Shared state is in a store from `createStore`.
- Pixi objects come from `@/utils`, aliases from `assets-config.ts`, strings from i18n.
- The reference pieces you touched are marked reuse, extract, rewrite, or discard.
- The command for that change was run.
- A visible change was looked at in the browser, or the report says it was not.
- No unrelated files, no new package, no skipped git hook.

## Goal reference

Source files are under `Demo html/asset/js/`: `main.js`, `animation.js`, `data.js`, `sound.js`, `palette.js`, `history.js`.

Useful ideas: balance, bet step, not-enough-balance, one audio entry point, mute, music after the first gesture, one palette used by every view, a modal for the round result, a viewport with one design size.

Leave these in that folder: field sizes, column walk, mines, cash out, the theme dots, history UI, `server.py`, `data/*.json`, `palette.js`, Vietnamese comments, and the all-Pixi page. That prototype stores balance in JSON and has no `localStorage`. None of that storage moves here unless the task says so.

| Goal | Keno in the template | Decision |
| --- | --- | --- |
| `main.js` round state | `src/state/` plus `src/modules/game/engine/` | Rewrite |
| `animation.js` | The board scene, using factories | Rewrite. Not a file in `src/animations/`. |
| `sound.js` | `src/systems/audio.ts` | Extract cue names only. Leave mine sounds such as `boom`. |
| `palette.js` | One color table in `src/shared/constants/` if Keno needs colors | One palette. Leave the theme switcher. |
| `data.js`, `server.py`, `data/*.json` | `userStore.balance` for a local demo number | Discard |
| `history.js` | `src/components/settings/openHistoryPopup.ts` when a backend exists | Discard for a demo with no backend |
| Pixi drawing in `main.js` | Factories in `@/utils` | Rewrite |
| Field, mines, cash out | — | Discard. Reference only. |

Goal viewport is 900×600. The template design size is 1920×1080.

Keno numbers are not written yet. Do not invent a paytable, a pick limit, a draw count, or a bet step. When a spec exists, add it as its own short file in `storm/` and link it from this file.
