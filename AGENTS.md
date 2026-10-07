# AGENTS.md

PixiJS v8 game `g-59`. Build Goal in this tree. The long map is `storm/architecture.md`. The round spec is `storm/goal-plan.md`.

`RULE.md` is the old Victory Road note. Where it disagrees with the code, the code wins. There is no `docs/RULE.md`.

1. Do not add a second app or a new `src/` layout.
2. New round rules go in `src/modules/game/engine/`. They do not import Pixi, the DOM, or a socket. The scene passes values in and gets a result back. The slot engine already on disk does not follow this. Do not copy that shape.
3. Scenes and components paint. A pointer handler calls the engine and returns.
4. No test runner, no new package, and no new directory unless the task says so. `storm/` is notes.
5. Board size, B Level, and multipliers are in `storm/goal-plan.md`. Do not invent a trap count, a probability, or an opcode.

There is no `zustand` and no `createStore`. Shared round data for the slot leftovers is the object `gameState` in `src/modules/game/engine/game.state.ts`. Design size is `DEFAULT_GAME_WIDTH` and `DEFAULT_GAME_HEIGHT` in `src/shared/constants/settings.ts`: 1920×1080. The canvas follows the window.

| Job | Place |
| --- | --- |
| Boot, resize | `src/app/create-app.ts` |
| Rules | `src/modules/game/engine/` |
| Socket | `src/modules/game/ws/`, `handlers/`. Do not fake a server. |
| Screens | `src/scenes/`. This tree uses classes (`GameScene`), not `create*Scene`. |
| Modals | `src/components/base/Popup.ts` |
| Spine | `src/animations/`. A cell tween stays in the scene. |
| Pixi text and spine | `createText`, `createSpine` in `src/shared/utils/` |
| Limits, colors | `src/shared/constants/` |
| Player strings | `i18n.t` from `@/shared/i18n/I18nManager` |
| Sound | `src/systems/audio.ts`. Do not spawn `Audio` from a scene. |
| Images | `raw-assets/`. Folder names carry `{}` tags. Do not edit `public/assets/`. |

One Pixi stage. One action, one state change, one visible result. An engine slice: `npx tsc --noEmit`. A scene slice: `tsc`, then the screen on port `8090`. Random rules take a random source argument. `console.log` fails lint. No comment unless the name cannot carry the reason. Report any check you did not run.
