# Cách đọc source đang có

File này là bản đồ và luật làm việc cho game Goal (`g-59`). Spec ván chơi nằm ở `storm/goal-plan.md`. Cách chạy Docker nằm ở `storm/docker.md`.

`RULE.md` ở root là ghi chú slot Victory Road. Nhiều folder trong đó không còn trên đĩa (`main-game/`, `BaseModal`, `en{copy}`, `docs/RULE.md`). Khi file đó khác code, code thắng.

## Còn sót, chưa comment

Asset slot và màn slot đã xóa. Mockup Lord of the Rings và script cắt mặt nạ bánh xe đã xóa ở lần rà này.

Những file sau vẫn là code slot, vẫn được TypeScript biên dịch, chưa comment:

| Còn | Vì sao chưa đụng |
| --- | --- |
| `src/modules/game/engine/game.engine.ts`, `game.state.ts`, `game.types.ts` | Payload quay, jackpot, free spin, lore. Boot không vẽ chúng, nhưng handler vẫn gọi |
| `src/modules/game/handlers/` | Opcode slot 100, 101, 202 |
| `src/systems/audio.config.ts` | Tên cue slot |
| `src/shared/i18n/en.ts`, `th.ts`, `en.json` | Câu chữ Hobbit, freespin, jackpot |
| `cheat-tool.ts` | Bảng QC slot. `main.ts` không gọi |
| `src/animations/SpinnerPopup.ts` | Spine spinner trỏ đường `main-game/spine/`, file đó không còn trong `raw-assets/` |

`GameScene` chỉ vẽ nền xanh và chữ GOAL.

## Cây

```
pixi-core-goal/
├── index.html                 title GOAL
├── src/main.ts                boot
├── src/app/create-app.ts      Pixi, resize theo cửa sổ
├── src/scenes/                GameScene, SceneManager, Scene
├── src/components/base/       Popup, Spinner, Button
├── src/animations/            SpinnerPopup
├── src/modules/game/
│   ├── engine/                state và payload. Chưa thuần
│   ├── handlers/
│   └── ws/
├── src/shared/
│   ├── constants/settings.ts  1920×1080
│   ├── i18n/                  I18nManager, en, th
│   ├── types/
│   └── utils/                 createText, createSpine, số, delay
├── src/systems/               audio, keyboard
├── raw-assets/                hình gốc, tên folder có tag {}
├── storm/                     ghi chú, không phải module game
├── RULE.md                    ghi chú slot cũ
└── AGENTS.md                  luật ngắn cho AI
```

Không có `src/state/`, `src/utils/`, `src/i18n/`, `createStore`, `zustand`, `resize.ts`, `BaseModal`, `showModal`. Số dư slot nằm ở `gameState.balance`.

Canvas resize theo cửa sổ. Hai số 1920×1080 là cỡ thiết kế, không phải kích thước renderer.

## Đặt tên

| Thứ | Cách đặt | Ví dụ đang có |
| --- | --- | --- |
| Scene | `PascalCase.ts`, export class cùng tên | `GameScene.ts` |
| Component, Spine | `PascalCase.ts` | `Popup.ts`, `SpinnerPopup.ts` |
| Hằng số, util | `camelCase.ts` | `settings.ts`, `createText.ts` |
| Socket | `game.ws.ts`, `game.handlers.ts`, `game.requests.ts` | |
| Engine | `game.state.ts`, `game.engine.ts`, `game.types.ts` | |
| Import | alias `@/` trỏ vào `src/` | `@/scenes/GameScene` |
| Chữ người chơi | `i18n.t` từ `@/shared/i18n/I18nManager` | |
| File hình | tên thường, gạch ngang, không hash | `icon-play.svg` |
| Folder hình | tag `{}` trên tên folder, không trên tên file | `icons{m}{copy}` |

Tag folder:

| Tag | Việc |
| --- | --- |
| `{m}` | Một bundle. Tên bundle là tên folder sau khi bỏ tag |
| `{copy}` | Chép nguyên. SVG dùng tag này |
| `{tps}` | Ghép ảnh raster thành sprite sheet |
| `{nomip}` | Không mipmap |
| `{nc}` | Không nén |

`background{m}{copy}` là bundle `background`. Ảnh raster UI thì folder cha `{m}`, folder con `{tps}`.

```
raw-assets/  →  npm run assetpack  →  public/assets/ + public/manifest.json
```

Sửa hình ở `raw-assets/` thôi. Repo chưa có `.assetpack.js`. Dev không có manifest thì `main.ts` dùng bundle rỗng và vẫn mở màn xanh.

## Việc code đi đâu

| Đang viết | Để ở |
| --- | --- |
| Luật ván, không Pixi, không DOM, không socket | `src/modules/game/engine/` |
| Nối máy chủ | `src/modules/game/ws/`, `handlers/` |
| Màn hình | `src/scenes/` |
| Nút, modal dùng lại | `src/components/` |
| B Level, hệ số, 30 giây, màu | `src/shared/constants/` |
| Câu chữ | `src/shared/i18n/` |
| Tiếng | `src/systems/audio.ts` |
| Object Pixi mới | `createText`, `createSpine` trong `src/shared/utils/` |
| Hình gốc | `raw-assets/` |

Engine slot hiện tại import `isDemoMode` từ socket và tự sửa `gameState`. Luật Goal mới không làm vậy. Scene đưa số vào, nhận kết quả, rồi mới vẽ và phát tiếng.

Không thêm package, không thêm folder, không thêm test runner, trừ khi task nói. `console.log` không qua lint. Không comment nếu tên đã nói được lý do.

Một việc một lần: một hành động, một đổi state, một thứ nhìn thấy. Luật thì `npx tsc --noEmit`. Màn hình thì `tsc`, rồi mở `http://localhost:8090`. Random nhận một nguồn từ ngoài.

## Boot hiện tại

1. Đọc manifest nếu có.
2. `createApp` gắn canvas vào `#VITE_GAME_ID`, không có thì `#app`.
3. `i18n.init`.
4. `GameScene` nền xanh.
5. `InitGameHandlers`, rồi `WebSocketConnect`.

Không có token thì socket tự gắn `token=demo-<uuid>`. `VITE_WS_URL` trống thì màn vẫn hiện, kết nối thất bại.
