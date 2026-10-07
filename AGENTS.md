# AGENTS.md

PixiJS v8 company template. Build the game in this tree. `docs/RULE.md` wins over this file. The code wins over the README and over `docs/RULE.md`.

Do not open `storm/` to start coding. Cursor already loaded this file. `storm/architecture.md` and `storm/team-guide.md` are the long guide for people. Open `storm/architecture.md` only when a placement is still unclear.

1. The template is the architecture. Do not copy the Goal prototype (`../Demo html`) in.
2. Rules live in `src/modules/game/engine/`. They do not import Pixi, the DOM, a store, or a socket. The scene passes values in. The engine returns a result.
3. Scenes and components paint state. A pointer handler calls a store or an engine function and returns.
4. No test runner, no new package, and no new directory unless `docs/RULE.md` lists it or the task says so. `storm/` is notes, not a module.
5. Do not invent a paytable, a pick limit, a draw count, or a bet step.

Stores use `createStore` in `src/shared/utils/store-utils.ts`. There is no `zustand`. Shared state goes in `src/state/`. Unsubscribe in `destroy`. The balance number is `userStore.balance`.

| Job | Place |
| --- | --- |
| Boot, design size 1920×1080 | `src/app/resize.ts` |
| Rules | `src/modules/game/engine/` |
| Socket | `src/modules/game/ws/`, `handlers/`. Leave them unless the task is network. Do not fake a server. |
| Screens | `src/scenes/`. Match that file's export (`create*` or `setup*`). |
| Modals | `showModal` in `src/components/base/BaseModal.ts` |
| Spine | `src/animations/`, `create*Spine` or `create*Effect`. A cell tween stays in the scene. |
| Pixi objects | `createSprite`, `createContainer`, `createText`, `createBitmapText`, `createGraphics` from `@/utils` |
| Limits, colors | `src/shared/constants/` |
| Player strings | `i18n.t` from `@/i18n/i18nManager` |
| Texture, spine, font aliases | `TEX`, `SPINES`, `FONT` in `src/shared/constants/assets-config.ts` |
| Sound | `src/systems/audio.ts`. Do not spawn `Audio` from a scene. |
| Images | `raw-assets/`, then `npm run assetpack`. Do not edit `public/assets/`. |

One Pixi stage. For this demo, the board, picks, draw, balance, bet, and play stay on it.

From Goal, keep the ideas: bet step, not-enough-balance, one audio entry, mute, music after the first gesture, one palette, a result modal, one design size. Leave mines, cash out, the theme switch, history UI, `server.py`, and JSON balance in that folder.

One action, one state change, one visible result, then the next. An engine slice: `npx tsc --noEmit`. A scene slice: `tsc`, then the screen on port `8090`. Random rules take a random source argument. `console.log` fails lint. No comment unless the name cannot carry the reason. Report any check you did not run.
