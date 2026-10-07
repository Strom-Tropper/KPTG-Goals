# Cách đọc source đang có

File này là bản đồ và luật làm việc cho game Goal (`g-59`). Spec ván chơi nằm ở `storm/goal-plan.md`. Cách chạy Docker nằm ở `storm/docker.md`.

`RULE.md` ở root là ghi chú slot Victory Road. Nhiều folder trong đó không còn trên đĩa (`main-game/`, `BaseModal`, `en{copy}`, `docs/RULE.md`). Khi file đó khác code, code thắng.

Ván đang chơi là Goal. Trong `src/modules/game/engine/` có hai họ file: `goal-*` là luật bàn hiện tại, `game.*` là slot còn sót và vẫn được TypeScript biên dịch.

## Cây

```
pixi-core-goal/
├── index.html                      title GOAL, nền #111111
├── cheat-tool.ts                   bảng QC slot, main.ts không gọi
├── src/main.ts                     boot
├── src/app/create-app.ts           Pixi, canvas theo cửa sổ
├── src/scenes/
│   ├── GameScene.ts                gọi goalEngine, vẽ một kết quả
│   ├── GoalBoard.ts                xếp bàn ngang hoặc dọc
│   ├── goal-cells.ts               một ô và icon trên ô
│   ├── goal-board-art.ts           nạp SVG bàn từ raw-assets
│   ├── Scene.ts                    pause, resume, destroy
│   └── SceneManager.ts             giữ GameScene, destroy khi thoát
├── src/components/
│   ├── GoalControls.ts             PLAY, RANDOM, CASHOUT, +/−, i, S
│   └── base/                       Popup, Spinner, Button của slot
├── src/modules/game/
│   ├── engine/                     goal-* và game.*
│   ├── handlers/                   opcode slot
│   └── ws/                         socket slot
├── src/shared/
│   ├── constants/                  màu bàn, 1920×1080
│   ├── i18n/                       chữ người chơi
│   ├── types/common.ts
│   └── utils/                      chữ, số, spine, tween
├── src/systems/                    tiếng, phím
├── src/animations/                 spinner slot
├── raw-assets/                     hình gốc, tag {} trên folder
├── storm/                          ghi chú, không phải module game
├── RULE.md                         ghi chú slot cũ
└── AGENTS.md                       luật ngắn cho AI
```

Không có `src/state/`, `src/utils/`, `src/i18n/`, `createStore`, `zustand`, `resize.ts`, `BaseModal`, `showModal`.

Canvas resize theo cửa sổ. `DEFAULT_GAME_WIDTH` và `DEFAULT_GAME_HEIGHT` trong `src/shared/constants/settings.ts` là cỡ thiết kế 1920×1080, không phải kích thước renderer.

## Goal

Scene không tự nhớ ván. `goalEngine` ghi vào `goalState`. Scene đưa số dư và một số ngẫu nhiên vào, nhận kết quả, rồi vẽ. Đồng hồ 30 giây và khoảng dừng ô nổ nằm ở `GameScene`, vì đó là việc của màn hình.

| File | Ý nghĩa |
| --- | --- |
| `goal-types.ts` | Kiểu ván `standby` / `playing`, ô đã đi, kết quả PLAY và pick, mặt ô |
| `goal-state.ts` | Object `goalState`: ván hiện tại, mảng mặt ô, mã lỗi gần nhất |
| `goal-constants.ts` | 7 cột, 4 ô, 30 giây, danh sách B Level, hệ số, mã lỗi, chữ `1.29x` |
| `goal-events.ts` | `goalEvents` và tên sự kiện: đổi bet, PLAY, pick, cashout, về standby |
| `goal-errors.ts` | Đổi lý do thất bại thành mã: không đủ tiền, sai pha, sai ô |
| `goal-assets.ts` | Tên file hình bàn (`cell-normal`, `mark-bomb`, …). Không nạp texture, không import Pixi |
| `goal-engine.ts` | Object `goalEngine`. Đổi bet, PLAY, pick, cashout, hết giờ. Ghi `goalState` và bắn `goalEvents` |

`goalEngine` có các việc: `ChangeBetLevel`, `CanChangeBet`, `CanPlay`, `CanRandom`, `CanCashout`, `Play`, `Pick`, `Cashout`, `TakeCashout`, `ApplyRound`, `RandomSlot`.

Số dư người chơi vẫn là `gameState.balance` trong `game.state.ts`. `GameScene` trừ và cộng số đó. Khi số dư đang 0, scene gán ví chơi thử để bấm được PLAY.

Màu vẽ bàn (`GOAL_BACKGROUND`, `GOAL_FRAME`, `GOAL_INK`) nằm ở `src/shared/constants/goal.ts`.

| File màn hình | Ý nghĩa |
| --- | --- |
| `GameScene.ts` | Pointer gọi `goalEngine`, rồi `GoalBoard.show`. Giữ timer 30 giây và khoảng hiện ô nổ |
| `GoalBoard.ts` | Chia khung ngang/dọc, lưới 7×4, hệ số trên cột, đồng hồ, hàng nút |
| `goal-cells.ts` | Một ô: nền theo mặt, icon bóng / bom / nổ / chấm trắng. Ô `active` mới nhận bấm |
| `goal-board-art.ts` | Import SVG trong `raw-assets/board{m}{copy}/` và `Assets.load` |
| `GoalControls.ts` | Nút có 3 mặt: thường, hover, bấm được. `goalLabel` vẽ chữ trên nút |

Hình bàn trong `raw-assets/board{m}{copy}/`:

| Nhóm | File |
| --- | --- |
| 3 màu ô | `cell-normal.svg`, `cell-active.svg`, `cell-explode.svg` |
| 4 dấu trên ô | `mark-ball.svg`, `mark-bomb.svg`, `mark-explode.svg`, `mark-bullet.svg` |
| Mặt nút | `button-face.svg`, `button-face-hover.svg`, `button-face-active.svg` |
| Núm và góc | `button-plus`, `button-minus`, `button-info`, `button-sound`, mỗi cái 3 file thường / hover / active |

`raw-assets/background{m}{copy}/` có `goal-bg-before.svg` và `goal-bg-after.svg`. Bàn hiện tại chưa gắn hai nền này. `raw-assets/icons{m}{copy}/` là icon slot cũ, không phải núm tròn trên bàn.

## Slot còn sót

Asset slot và màn slot đã xóa. Những file sau vẫn biên dịch, chưa comment, boot không vẽ chúng:

| File | Ý nghĩa | Vì sao còn |
| --- | --- | --- |
| `game.types.ts` | Payload quay, jackpot, free spin, lore | Handler còn đọc |
| `game.state.ts` | `gameState`, gồm `balance` | Scene Goal đọc số dư ở đây |
| `game.constants.ts` | Opcode 100, 101, 202, mã lỗi server, mức bet slot | Handler còn dùng |
| `game.events.ts` | `eventBus` và tên sự kiện quay | Handler còn bắn |
| `game.errors.ts` | Map mã server sang câu `i18n` | `game.engine` gọi |
| `game.assets.ts` | `gameAssets` và `PreloadAssets` | `main.ts` gọi preload, hiện trả map rỗng |
| `game.engine.ts` | `gameEngine`: nạp payload, bet, ví, jackpot. Import `isDemoMode` từ socket | Handler gọi |
| `handlers/game.handlers.ts` | `InitGameHandlers`, nghe opcode | `main.ts` gọi |
| `handlers/game.requests.ts` | Gửi request quay | Socket slot |
| `ws/game.ws.ts` | `WebSocketConnect`. Không token thì `token=demo-<uuid>` | `main.ts` gọi |
| `systems/audio.config.ts` | Tên cue slot | Chưa đổi sang Goal |
| `shared/i18n/en.ts`, `th.ts`, `en.json` | Chữ Hobbit, freespin, jackpot, và khối `goal.*` | Chữ Goal nằm chung file |
| `cheat-tool.ts` | Bảng QC slot | `main.ts` không gọi |
| `animations/SpinnerPopup.ts` | Spine spinner, đường `main-game/spine/` không còn | File vẫn biên dịch |
| `components/base/Button.ts` | Nút texture slot | Bàn Goal dùng `GoalControls` |
| `components/base/Popup.ts`, `Spinner.ts` | Modal và vòng xoay boot | Boot vẫn tạo spinner |

## Shared và systems

| File | Ý nghĩa |
| --- | --- |
| `shared/constants/settings.ts` | `DEFAULT_GAME_WIDTH` 1920, `DEFAULT_GAME_HEIGHT` 1080 |
| `shared/constants/goal.ts` | Ba màu vẽ bàn |
| `shared/i18n/I18nManager.ts` | `i18n.t`. Scene chỉ gọi hàm này |
| `shared/utils/text/createText.ts` | Chữ Pixi. `goalLabel` đi qua đây |
| `shared/utils/createSpine.ts` | Spine. Scene Goal chưa dùng |
| `shared/utils/formatNumber.ts` | Thêm dấu phẩy cho số tiền |
| `shared/utils/animateNumber.ts`, `delay.ts`, `pagination.ts` | Số chạy, chờ, phân trang. Slot để lại |
| `shared/utils/createBlinkAnimation.ts`, `createScalePulseAnimation.ts` | Tween slot |
| `shared/utils/drawGrapicsRect.ts`, `syncCanvasCursor.ts` | Hình chữ nhật, con trỏ |
| `shared/utils/loadBundleWithRetry.ts`, `localizationTextures.ts` | Bundle assetpack, texture chữ |
| `systems/audio.ts` | Phát tiếng. Scene không tự tạo `Audio` |
| `systems/keyboard.ts` | Phím slot |
| `app/create-app.ts` | Tạo `Application`, gắn canvas vào `#VITE_GAME_ID`, không có thì `#app` |

## Đặt tên

| Thứ | Cách đặt | Ví dụ đang có |
| --- | --- | --- |
| Scene | `PascalCase.ts`, export class cùng tên | `GameScene.ts`, `GoalBoard.ts` |
| Component | `PascalCase.ts` | `GoalControls.ts`, `Popup.ts` |
| Helper vẽ, không phải class | `camelCase.ts` hoặc `kebab-case.ts` cạnh scene | `goal-cells.ts`, `goal-board-art.ts` |
| Engine Goal | `goal-` rồi vai trò | `goal-state.ts`, `goal-engine.ts` |
| Engine slot | `game.` rồi vai trò | `game.state.ts`, `game.engine.ts` |
| Socket | `game.ws.ts`, `game.handlers.ts`, `game.requests.ts` | |
| Import | alias `@/` trỏ vào `src/` | `@/scenes/GameScene` |
| Chữ người chơi | `i18n.t` từ `@/shared/i18n/I18nManager` | khóa `goal.balance`, `goal.play` |
| File hình | tên thường, gạch ngang, không hash | `cell-normal.svg` |
| Folder hình | tag `{}` trên tên folder, không trên tên file | `board{m}{copy}` |

Tag folder:

| Tag | Việc |
| --- | --- |
| `{m}` | Một bundle. Tên bundle là tên folder sau khi bỏ tag |
| `{copy}` | Chép nguyên. SVG dùng tag này |
| `{tps}` | Ghép ảnh raster thành sprite sheet |
| `{nomip}` | Không mipmap |
| `{nc}` | Không nén |

`board{m}{copy}` là bundle `board`. SVG bàn đang được Vite import thẳng từ `raw-assets/`, chưa chạy assetpack. Repo chưa có `.assetpack.js`.

```
raw-assets/  →  npm run assetpack  →  public/assets/ + public/manifest.json
```

Sửa hình ở `raw-assets/` thôi. Không sửa tay `public/assets/`. Dev không có manifest thì `main.ts` dùng bundle rỗng và vẫn mở bàn.

## Việc code đi đâu

| Đang viết | Để ở |
| --- | --- |
| Luật ván, không Pixi, không DOM, không socket | `src/modules/game/engine/goal-*.ts` |
| Kiểu, số, lỗi, tên hình, sự kiện của luật đó | file `goal-` cùng vai với `game.types`, `game.constants`, `game.errors`, `game.assets`, `game.events` |
| Nối máy chủ | `src/modules/game/ws/`, `handlers/`. Không bịa opcode |
| Màn hình | `src/scenes/` |
| Nút dùng lại | `src/components/` |
| Màu vẽ | `src/shared/constants/goal.ts` |
| Cỡ thiết kế | `src/shared/constants/settings.ts` |
| Câu chữ | `src/shared/i18n/en.ts` và `th.ts`, khóa `goal.*` |
| Tiếng | `src/systems/audio.ts` |
| Chữ Pixi, spine | `createText`, `createSpine` trong `src/shared/utils/` |
| Hình gốc | `raw-assets/` |

`game.engine.ts` import `isDemoMode` từ socket và tự sửa `gameState`. Luật Goal không import socket và không import Pixi. Scene đưa `balance` và một số `0..1` vào `Play` / `Pick` / `RandomSlot`.

Không thêm package, không thêm folder, không thêm test runner, trừ khi task nói. `console.log` không qua lint. Không comment nếu tên đã nói được lý do.

Một việc một lần: một hành động, một đổi state, một thứ nhìn thấy. Luật thì `npx tsc --noEmit` trong container `pj-59-goal`. Màn hình thì `tsc`, rồi mở `http://localhost:8090`.

## Boot hiện tại

1. Đọc manifest nếu có. Marker `/*__ASSETPACK_MANIFEST__*/` trong `main.ts` phải giữ.
2. `createApp` gắn canvas.
3. `i18n.init`.
4. `Assets.init`, rồi `GameScene` gắn bàn Goal.
5. `InitGameHandlers`, rồi `WebSocketConnect`.

`VITE_WS_URL` trống thì bàn vẫn hiện, kết nối thất bại. Không có token thì socket tự gắn `token=demo-<uuid>`.
