# Cách đọc source đang có

File này mô tả cây đang nằm trên đĩa. Màn chơi là nền xanh, chữ GOAL. Package vẫn tên `igt-game-victory-road-fe`. Bàn quay, bonus, spine slot, và art `main-game` đã xóa. Engine và socket vẫn còn payload slot, để cắt tiếp khi có spec Goal.

`AGENTS.md`, `storm/how-we-work.md`, và `storm/team-guide.md` vẫn viết theo khung Keno (store `createStore`, `src/state/`, `docs/RULE.md`, engine thuần). Những file đó chưa khớp code. Khi hai bên khác nhau, code thắng. Luật đặt tên và asset nằm ở `RULE.md` ngay root, không có `docs/RULE.md`.

Game tiếp theo là Goal. Danh sách giữ, xóa, và comment nằm ở `storm/goal-plan.md`. File này không chốt bảng trả.

## Năm tầng, đọc theo việc

Không tạo folder mới cho khớp sơ đồ. Tên folder dưới `src/` không ngang hàng.

```
                         GAME
                          │
             ┌────────────┴────────────┐
             │                         │
          GAME CORE               PRESENTATION
             │                         │
        modules/game                 scenes
        shared                       components
                                     animations
             │                         │
             └────────────┬────────────┘
                          │
                       SYSTEMS
                   audio, keyboard
                          │
             ┌────────────┴────────────┐
             │                         │
           app                        assets
           shared/utils               shared/i18n
```

Luật slot hiện tại không thuần. `src/modules/game/engine/game.engine.ts` sửa object `gameState`, và import `isDemoMode` từ `ws/game.ws.ts`. Scene vẽ state đó. Goal mới nên đưa luật thuần vào engine và để scene chỉ vẽ, dù slot hiện tại chưa làm vậy.

## Cây thật

```
pixi-core-goal/
├── index.html              shell, title GOAL, div #app và #%VITE_GAME_ID%
├── src/main.ts             boot: manifest, Pixi, i18n, loading, GameScene, socket
├── cheat-tool.ts           opcode 666 của slot, không được gọi lúc boot
├── src/
│   ├── app/create-app.ts   tạo Application, gắn canvas, resize theo cửa sổ
│   ├── animations/         SpinnerPopup và hằng số spine spinner
│   ├── components/
│   │   ├── base/           Popup, Spinner, Button
│   │   └── LoadingView.ts
│   ├── modules/game/
│   │   ├── engine/         state, payload socket, hằng số opcode, asset handle
│   │   ├── handlers/       gắn opcode vào engine
│   │   └── ws/             WebSocket, reconnect, demo token khi không có token
│   ├── scenes/             GameScene nền xanh, SceneManager, Scene
│   ├── shared/
│   │   ├── constants/      DEFAULT_GAME_WIDTH 1920, DEFAULT_GAME_HEIGHT 1080
│   │   ├── i18n/           I18nManager, en, th
│   │   ├── types/
│   │   └── utils/          createText, createSpine, format, delay, vẽ rect
│   ├── systems/            audio.ts, audio.config.ts, keyboard.ts
│   └── vite-env.d.ts
├── raw-assets/             nguồn hình. Tag {} trên tên folder, xem mục assets
├── public/                 manifest.json và assets đã sinh, không sửa tay
├── scripts/                generate-wheel-symbol-masks.mjs
├── RULE.md                 luật folder và asset của repo này
└── storm/                  ghi chú, không phải module game
```

Không có `src/state/`, `src/utils/`, `src/i18n/`, `src/assets/`, `resize.ts`, `assets-config.ts`, `createStore`, hay package `zustand`. Số dư nằm ở `gameState.balance`. Scene đọc `gameEngine`, không đọc một store riêng.

Design size 1920×1080 nằm ở `src/shared/constants/settings.ts`. Canvas không khóa đúng hai số đó. `create-app.ts` resize renderer theo kích thước container.

## Boot

`src/main.ts` làm một mạch:

1. Lấy manifest. Production thì Vite nhét JSON vào marker trong `main.ts`. Dev thì `fetch("/manifest.json")`.
2. `createApp` gắn canvas vào `#VITE_GAME_ID`, fallback `#app`.
3. `i18n.init`, load bundle `localization_*`, rồi bundle `loading`.
4. `LoadingView` trong lúc `PreloadAssets`.
5. Tạo `GameScene` và `SceneManager` trước khi gỡ màn loading.
6. `InitGameHandlers`, cheat tool, rồi `WebSocketConnect`.
7. Spinner chỉ tắt sau opcode 100 và 110, hoặc khi socket lỗi.

Không có token trên URL thì `game.ws.ts` tự gắn `token=demo-<uuid>` và `walletPlatformId=demo`. Vẫn cần `VITE_WS_URL`. URL rỗng thì client vẫn dựng scene, rồi báo mất kết nối.

## modules/game

| File | Việc trên đĩa |
| --- | --- |
| `engine/game.state.ts` | Object mutable: số dư, cược, lưới, jackpot, free spin, journey, mini game |
| `engine/game.engine.ts` | Nhận payload socket, ghi state, phát `eventBus` |
| `engine/game.types.ts` | Lưới slot, paytable, journey, response |
| `engine/game.constants.ts` | Opcode. Vào: 100, 101, 102, 104, 110, 196, 199, 451, 452. Ra: 202, 203, 208, 210, 401, 402 |
| `engine/game.events.ts` | `eventBus` trong process, không phải socket |
| `engine/game.errors.ts` | Mã lỗi người chơi thấy |
| `engine/game.assets.ts` | Handle bundle đã load |
| `domain/symbols.ts` | 16 symbol, id 1–16 |
| `handlers/game.handlers.ts` | `socketClient.on` rồi gọi engine |
| `handlers/game.requests.ts` | Gửi spin, mini game, đổi ví, history |
| `ws/game.ws.ts` | Connect, reconnect tối đa 5 lần, demo token |

Bàn chơi là 9 lát × 3 vòng (27 ô). Ba symbol giống nhau trên một lát thì thắng. Luật đó nằm rải trong engine và scene, không phải một hàm thuần `canSelect`.

## scenes và components

`GameScene` dựng cả màn slot: nền, bàn quay, số dư, cược, spin, turbo, auto, jackpot, free spin, bản đồ, popup. `SceneManager` mở `BonusScene` khi event bonus hoặc minigame.

`components/base/Popup.ts` là modal dùng chung. Không có `showModal` hay `BaseModal.ts`.

`src/animations/` là class Spine, extends container. Scene slot gọi các class đó trực tiếp.

Pixi object mới trong slot đang dùng `new Sprite` / `new Container` ở nhiều chỗ. Helper có sẵn là `createText` và `createSpine` trong `src/shared/utils/`. Code Goal mới đi qua helper đó.

## shared, systems, assets

`src/shared/i18n/` có `en` và `th`. Gọi `i18n.t` từ `@/shared/i18n/I18nManager`.

`src/systems/audio.ts` là một lối tiếng: mở khoá sau gesture, nhạc và hiệu ứng tách nhau. Cue slot nằm ở `audio.config.ts`.

Hình đi một chiều:

```
raw-assets/  →  npm run assetpack  →  public/assets/ + public/manifest.json
```

Tên folder trong `raw-assets/` mang tag trong `{}`. AssetPack đọc tag rồi bỏ tag khỏi tên bundle. Không ghi tag vào tên file.

| Tag | Việc |
| --- | --- |
| `{m}` | Một bundle trong manifest. Tên bundle là tên folder sau khi bỏ tag |
| `{copy}` | Chép file nguyên, không nén, không ghép sprite sheet. Dùng cho SVG |
| `{tps}` | Ghép ảnh trong folder thành một sprite sheet |
| `{nomip}` | Không tạo mipmap |
| `{nc}` | Không nén |

Nhiều tag viết liền: `background{m}{copy}` là bundle `background`, file bên trong được chép nguyên.

Ảnh raster của UI thì folder cha `{m}`, folder con `{tps}`. Ví dụ cũ: `loading{m}/loading{tps}/`. SVG của Goal không đi vào `{tps}`.

Cây nguồn hiện tại:

```
raw-assets/
├── background{m}{copy}/    goal-bg-before.svg, goal-bg-after.svg
└── icons{m}{copy}/         icon-play.svg, icon-close.svg, …
```

Tên file không có hash. `icon-play.51f0….svg` thành `icon-play.svg`.

Repo chưa có `.assetpack.js`. `public/assets/` và `dist/` là output slot đã xóa, không sửa tay. Chưa chạy assetpack thì dev không có `/manifest.json`. `main.ts` coi manifest thiếu là bundle rỗng và vẫn mở màn xanh.

`npm run dev` chạy Vite. Cổng trong `vite.config.ts` là `8090`. Production cần `VITE_PRODUCTION_ASSET_BASE_URL`, `VITE_ASSETS_PATH`, `VITE_JS_PATH`.

## Khi người chơi bấm Spin, code hiện tại

```
Nút Spin
    │
    ▼
GameScene phát event / gọi request
    │
    ▼
handlers gửi opcode 202
    │
    ▼
Socket trả 101
    │
    ▼
game.engine ghi gameState, phát eventBus
    │
    ▼
GameScene vẽ lưới, line thắng, số dư
```

Engine vừa giữ state vừa đọc socket. Goal không nên copy đường này nguyên khối. Giữ socket và event bus. Luật ô, mìn, và hệ số để ở hàm thuần, scene chỉ đưa số vào và vẽ kết quả.
