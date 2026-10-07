# g-59 Frontend

g-59 is a game frontend built with Vite, TypeScript, PixiJS, and Spine.

## Requirements

- Node.js 18 or newer
- npm 9 or newer

## Installation

Clone the repository and install dependencies:

```bash
npm ci
```

> Use `npm install` instead if you need to update `package-lock.json`.

After installation, generate the asset manifest for the first time:

```bash
npm run assetpack
```

This generates processed assets in `public/assets` based on the files in `raw-assets`. The regular build commands also run this step automatically.

## Environment configuration

Create a local `.env` file from the example:

```bash
cp storm/env.example .env
```

Important variables:

| Variable                         | Purpose                                                                                                                                                                                |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_GAME_ID`                   | ID of the game container element in `index.html`                                                                                                                                       |
| `VITE_WS_URL`                    | WebSocket endpoint for the game service                                                                                                                                                |
| `VITE_WALLET_LIST`               | Comma-separated wallet keys to show in the frontend (for example, `main,points:g-59,points:g-59_2`). Leave empty or unset to show all wallets returned by the initial response |
| `VITE_ASSETPACK_ENTRY`           | Source asset directory; defaults to `./raw-assets`                                                                                                                                     |
| `VITE_ASSETPACK_OUTPUT`          | Generated asset directory; defaults to `./public/assets`                                                                                                                               |
| `VITE_PRODUCTION_ASSET_BASE_URL` | Base URL for production assets                                                                                                                                                         |
| `VITE_ASSETS_PATH`               | Production asset path                                                                                                                                                                  |
| `VITE_JS_PATH`                   | Production JavaScript path                                                                                                                                                             |

The values in `storm/env.example` are suitable for development. Review the endpoints and configuration values before building or deploying.

## Development

Start the Vite development server:

```bash
npm run dev
```

The server runs at [http://localhost:8090](http://localhost:8090) by default and opens the browser automatically.

To allow access from another device on the same network:

```bash
npm run dev:host
```

`start` is an alias for `dev`:

```bash
npm start
```

## Build

Create a full production build:

```bash
npm run build
```

The build process generates the asset manifest with AssetPack, runs ESLint, checks TypeScript, and creates the Vite bundle in `dist/`.

Create a development-mode build:

```bash
npm run build:dev
```

Preview the built bundle locally:

```bash
npm run preview
```

Production builds require `VITE_PRODUCTION_ASSET_BASE_URL`, `VITE_ASSETS_PATH`, and `VITE_JS_PATH` to be configured in `.env`.

## Code quality

```bash
npm run lint
```

Automatically fix supported lint issues:

```bash
npm run lint:fix
```
