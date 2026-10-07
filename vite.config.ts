import { promises as fs } from "fs";
import nodePath from "path";
import { fileURLToPath } from "url";
import { defineConfig, loadEnv, Plugin } from "vite";

const MANIFEST_MARKER_REGEX =
    /\/\*__ASSETPACK_MANIFEST__\*\/\s*'__LOAD_FROM_FILE__'/;

type ManifestSrcItem = string | { src: string; [key: string]: unknown };

function joinUrl(baseUrl: string, path: string) {
    const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
    const normalizedPath = path.replace(/^\/+/, "");
    return `${normalizedBaseUrl}/${normalizedPath}`;
}

function toProductionAssetUrl(src: string, baseUrl: string) {
    const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
    const normalizedSrc = src.replace(/^assets\//, "").replace(/^\/+/, "");
    return `${normalizedBaseUrl}/${normalizedSrc}`;
}

function rewriteManifestForProduction(manifest: unknown, baseUrl: string) {
    const clonedManifest = JSON.parse(JSON.stringify(manifest)) as {
        bundles?: Array<{
            assets?: Array<{
                src?: ManifestSrcItem[];
            }>;
        }>;
    };

    for (const bundle of clonedManifest.bundles ?? []) {
        for (const asset of bundle.assets ?? []) {
            asset.src = (asset.src ?? []).map((item) =>
                typeof item === "string"
                    ? toProductionAssetUrl(item, baseUrl)
                    : { ...item, src: toProductionAssetUrl(item.src, baseUrl) },
            );
        }
    }

    return clonedManifest;
}

function createInjectedManifestLiteral(manifest: unknown) {
    return JSON.stringify(manifest).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function injectManifestForProductionPlugin(baseUrl: string): Plugin {
    let injectedManifestLiteral = "";

    return {
        name: "inject-manifest-for-production",
        apply: "build" as const,
        enforce: "pre" as const,
        async buildStart() {
            const manifestPath = nodePath.resolve(
                process.cwd(),
                "public/manifest.json",
            );
            const manifestText = await fs.readFile(manifestPath, "utf8");
            const productionManifest = rewriteManifestForProduction(
                JSON.parse(manifestText),
                baseUrl,
            );
            injectedManifestLiteral =
                createInjectedManifestLiteral(productionManifest);
        },
        transform(code, id) {
            const normalizedId = id.split("?")[0];
            const mainTsPath = nodePath.resolve(process.cwd(), "src/main.ts");

            if (normalizedId !== mainTsPath) return null;

            if (!MANIFEST_MARKER_REGEX.test(code)) {
                this.error(
                    "Cannot inject manifest. Marker /*__ASSETPACK_MANIFEST__*/ not found in src/main.ts",
                );
            }

            return code.replace(
                MANIFEST_MARKER_REGEX,
                `/*__ASSETPACK_MANIFEST__*/ '${injectedManifestLiteral}'`,
            );
        },
    };
}

function rewriteFaviconForProductionPlugin(baseUrl: string): Plugin {
    const faviconUrl = joinUrl(baseUrl, "favicon.png");

    return {
        name: "rewrite-favicon-for-production",
        apply: "build" as const,
        enforce: "post" as const,
        transformIndexHtml(html) {
            return html.replace(
                /(<link\s+rel="icon"\s+type="image\/png"\s+href=")[^"]+("\s*\/?>)/,
                `$1${faviconUrl}$2`,
            );
        },
    };
}

export default defineConfig(({ mode }) => {
    const isProduction = mode === "production";
    const env = loadEnv(mode, process.cwd(), "");
    const productionAssetBaseUrl = env.VITE_PRODUCTION_ASSET_BASE_URL;
    const assetsPath = env.VITE_ASSETS_PATH;
    const jsPath = env.VITE_JS_PATH ?? "";
    const normalizedJsPath = jsPath.replace(/^\/+/, "");
    const productionAssetsUrl =
        productionAssetBaseUrl && assetsPath
            ? joinUrl(productionAssetBaseUrl, assetsPath)
            : "";
    const productionJsBaseUrl =
        productionAssetBaseUrl && jsPath
            ? `${productionAssetBaseUrl.replace(/\/+$/, "")}/`
            : "/";

    if (isProduction && (!productionAssetBaseUrl || !assetsPath || !jsPath)) {
        throw new Error(
            "Missing VITE_PRODUCTION_ASSET_BASE_URL, VITE_ASSETS_PATH, or VITE_JS_PATH in environment variables.",
        );
    }

    return {
        base: isProduction ? productionJsBaseUrl : "/",
        resolve: {
            alias: {
                "@": fileURLToPath(new URL("./src", import.meta.url)),
            },
        },
        server: {
            port: 8090,
            host: true,
            strictPort: true,
            open: process.env.BROWSER !== "none",
        },
        plugins: [
            ...(isProduction && productionAssetsUrl
                ? [
                      injectManifestForProductionPlugin(productionAssetsUrl),
                      rewriteFaviconForProductionPlugin(productionAssetsUrl),
                  ]
                : []),
        ],
        build: {
            emptyOutDir: true,
            rollupOptions: {
                input: "index.html",
                output: {
                    inlineDynamicImports: true,
                    manualChunks: undefined,
                    entryFileNames: `${normalizedJsPath}.js`,
                    chunkFileNames: `${normalizedJsPath}.js`,
                    assetFileNames: "assets/[name][extname]",
                },
            },
        },
    };
});
