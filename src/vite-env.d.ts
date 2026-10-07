/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_WS_URL?: string;
    readonly VITE_WALLET?: string;
    readonly VITE_WALLET_PROVIDER?: string;
    readonly VITE_WALLET_RESOURCE?: string;
    readonly VITE_WALLET_LIST?: string;
    readonly VITE_POINTS_PLATFORM_ID?: string;
    readonly VITE_SOCKET_GAME_ID?: string;
    readonly VITE_GAME_ID?: string;
    readonly VITE_DEFAULT_LANG?: string;
    readonly VITE_ASSETPACK_ENTRY?: string;
    readonly VITE_ASSETPACK_OUTPUT?: string;
    readonly VITE_PRODUCTION_ASSET_BASE_URL?: string;
    readonly VITE_ASSETS_PATH?: string;
    readonly VITE_JS_PATH?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
