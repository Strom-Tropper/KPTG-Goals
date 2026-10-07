# Docker

File compose nằm trong folder này. Không thêm Dockerfile ở root.

`compose.yml` chạy `node:20` và mount repo (`..`) vào `/app`. `node_modules` nằm trong volume `dev_node_modules` để không dùng binary macOS của máy host.

Tên project và tên container đều là `pj-59-goal`. Docker Desktop hiện app này dưới tên đó.

Vite lắng nghe `8090` (`vite.config.ts` và cờ trong compose). Trong container process bind `0.0.0.0`. Trình duyệt máy host mở `http://localhost:8090`.

`npm run dev` trên máy host cũng dùng cổng `8090`. Compose không gọi `npm run dev`: script đó không có `--host`, và `open: true` sẽ cố mở browser trong container. `BROWSER=none` tắt việc mở browser. `npm ci` dùng `--ignore-scripts` để `husky` không chạy trong container, và `--legacy-peer-deps` theo lockfile hiện tại.

`public/manifest.json` đã có trên đĩa. Compose không chạy assetpack và không gọi script sinh manifest. Repo không có `.assetpack.js`, cũng không có `scripts/generate-manifest.mjs`.

Từ folder `storm`:

```bash
cp env.example ../.env
docker compose up
```

File `.env` để ở root repo, cạnh `vite.config.ts`. Vite đọc nó khi khởi động. Không có `.env` thì client vẫn lên màn hình: `VITE_GAME_ID` fallback `app`, ngôn ngữ fallback `en`. Socket để trống thì scene slot vẫn được dựng, rồi báo mất kết nối. Muốn chơi được một vòng thì điền `VITE_WS_URL` trong `.env` rồi `docker compose up` lại.

Dừng bằng Ctrl-C, hoặc `docker compose down` trong folder này.

`vite build` production cần `VITE_PRODUCTION_ASSET_BASE_URL`, `VITE_ASSETS_PATH`, và `VITE_JS_PATH`. Compose này không set ba biến đó và không chạy `build:prod`.
