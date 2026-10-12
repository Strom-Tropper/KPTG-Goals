# AGENTS.md

PixiJS v8, game Goal `g-59`. Luật ván, opcode và gói dây nằm ở `storm/README.md`. Đọc file đó trước khi đổi bet, bàn, đồng hồ, hoặc socket. Không bịa số cột, số bom, hệ số, bậc cược, hay opcode.

`RULE.md` là slot Victory Road. Cây trong đó (`main-game/`, `BaseModal`, `createStore`) không còn. Khi nó khác code, code thắng.

## Luật

1. Một app, một stage. Không thêm layout `src/` mới, package, test runner, hay thư mục, trừ khi task nói. `storm/` là ghi chú.
2. Luật ván mới nằm trong `goalEngine` / `goalSession` / `goalState`. Không import Pixi, DOM, hay socket. Scene đưa số vào và nhận kết quả. `gameEngine` trong cùng file có import socket. Đừng copy hình đó.
3. Scene và component chỉ vẽ. Pointer gọi engine hoặc `gameRequests` rồi trả về. Một hành động, một đổi state, một kết quả nhìn thấy.
4. Số dư là `gameState.balance`. Dữ liệu ván Goal là `goalState`. Không thêm `zustand` hay `createStore`.
5. Không giả server. Opcode chỉ những mã trong `storm/README.md`.
6. Client không tự tính thưởng, không tự quyết ô nào là bom, không tự giải lượt khi đồng hồ về 0. Vẽ `board`, `current_win`, `turn`, `done`. Trả lời bằng ordinal khung trước cộng 1, hoặc `open.ordinal` lúc khôi phục. Lọc `101` theo `(ticket_id, ordinal)`.
7. `console.log` không qua lint (`warn` và `error` được). Không comment nếu tên đã nói được lý do. Không sửa `public/assets/`. Báo check nào không chạy.

## Chỗ viết

| Việc | File |
| --- | --- |
| Boot, canvas theo cửa sổ | `src/app/create-app.ts`, `src/main.ts` |
| Luật, pha, bet | `src/modules/game/engine/game.engine.ts` (`goalEngine`) |
| Gắn khung 100 / 101 / 206 | `game.session.ts` (`goalSession`) |
| State | `game.state.ts`. Cỡ thiết kế 1920×1080 ở `src/shared/constants/settings.ts` |
| Hằng số bàn, opcode | `game.constants.ts` |
| Kiểu | `game.types.ts` |
| Sự kiện | `game.events.ts`: `goalEvents` cho Goal, `eventBus` cho slot sót |
| Mã lỗi | `game.errors.ts` |
| Tên hình | `game.assets.ts` |
| Socket | `src/modules/game/ws/game.ws.ts`, `handlers/game.handlers.ts`, `handlers/game.requests.ts` |
| Màn | `src/scenes/`. Class `GameScene`, không `create*Scene` |
| Nút bàn | `src/components/GameControls.ts` |
| Modal | kéo `src/components/base/Popup.ts` |
| Chữ người chơi | `i18n.t` từ `@/shared/i18n/I18nManager`, khóa `goal.*` trong `en.ts` và `th.ts` |
| Chữ Pixi, spine | `createText`, `createSpine` trong `src/shared/utils/` |
| Màu bàn | `src/shared/constants/goal.ts` |
| Tiếng | `src/systems/audio.ts`. Scene không tự `new Audio` |
| Hình gốc | `raw-assets/`. Tag `{}` trên tên folder |

`GameScene` nghe `goalEvents` rồi gọi `GameBoard.show`. `goalSession` ghi `goalState` và bắn sự kiện. Pointer không tự sửa `goalState`.

Khung màn hình lấy từ `Archive` cạnh repo này (`components/main-game/`). Repo Goal đã đưa các file đó lên `src/components/`. Giữ đúng vai trò đó khi thêm màn: `NotificationPopup`, `SettingPopup` chỉ mở lịch sử, `HIstoryPopup/` vẽ danh sách và chi tiết, `InfoPopup/` là các trang info, `PopupWin/`, `bonus-game/`, freespin, jackpot. Đổi asset và luật chơi. Không thêm class popup mới cho một việc đã có file. File đang comment giữ nguyên. Khi một màn vào game thì mở file đó, sửa import cho khớp cây hiện tại (`@/components/layouts`, `@/components/InfoPopup`), rồi mới gắn `GameScene`. Không bỏ comment cả cụm một lúc.

Bàn Goal nằm ở `src/scenes/` (`GameBoard`, `GameCells`, `GameBoardArt`). Đó là phần Archive không có. Luật ván vẫn ở `goalEngine`, không chép luật slot trong các file comment.

## Kiểu code

TypeScript, module ESM, alias `@/` trỏ `src/`. Hai space, nháy đôi, chấm phẩy, dấu phẩy cuối ở chỗ nhiều dòng. Số lớn viết `10_000`, `30_000`. Hằng số `as const`.

| Thứ | Cách đặt | Đang có |
| --- | --- | --- |
| Scene, component | file và class `PascalCase`, named export | `GameScene`, `NotificationPopup` |
| Nền modal | `default export class` | `Popup` |
| Engine Goal | object, method `PascalCase` | `goalEngine.CanPlay`, `ChangeBetLevel` |
| Session, request | object, method `camelCase` | `goalSession.applyFrame`, `gameRequests.PlayLevel` |
| Hằng số, tên sự kiện | `SCREAMING_SNAKE` | `GOAL_COLUMN_COUNT`, `GOAL_EVENT_NAMES` |
| Kiểu | `type`, `PascalCase` | `GoalRound`, `GoalStatusFrame` |
| File engine | `game.` + vai trò | `game.state.ts` |
| Hình | chữ thường, gạch ngang | `cell-normal.svg` |
| Folder hình | tag trên folder | `board{m}{copy}` |

`{m}` một bundle, `{copy}` chép nguyên (SVG đang dùng), `{tps}` ghép sprite, `{nomip}` không mipmap, `{nc}` không nén. SVG bàn được import thẳng từ `raw-assets/` hoặc `Assets.load`. Chưa có `.assetpack.js`.

Scene: field `private`, handler gán arrow khi đưa vào object (`onPick = () =>`), method thường cho việc nội bộ. Guard rồi return. `import type` cho kiểu. Tham số không dùng thì prefix `_`.

Popup Goal: class kéo `Popup`, `static show` / `close` / `attach`, một instance. Chữ qua `i18n.t` và `goalLabel`. Nút bàn qua `labeledButton`.

`goalEngine` nhận `balance` và nguồn ngẫu nhiên `0..1` (`RandomSlot(unit)`). Không gọi `Math.random` trong luật.

Lint đang bật: `eqeqeq`, `prefer-const`, không `var`, không `no-param-reassign` lên binding (gán property thì được), không `no-floating-promises` thành lỗi im, `no-explicit-any` là warn. Sửa warn trên dòng vừa đụng. Không tắt rule để né.

## Kiểm tra

Luật: `npx tsc --noEmit`. Màn hình: `tsc`, rồi `http://localhost:8090`. Một slice xong mới sang slice khác.
