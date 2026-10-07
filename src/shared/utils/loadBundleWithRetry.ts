import { Assets, type ProgressCallback } from "pixi.js";

const BUNDLE_LOAD_TIMEOUT_MS = 30_000;

class BundleLoadTimeoutError extends Error {
    constructor(bundleNames: string) {
        super(
            `Loading bundle timed out after ${BUNDLE_LOAD_TIMEOUT_MS / 1000} seconds: ${bundleNames}`,
        );
        this.name = "BundleLoadTimeoutError";
    }
}

export async function loadBundleWithRetry(
    bundleIds: string | string[],
    onProgress?: ProgressCallback,
    maxRetries = 3,
): Promise<Record<string, unknown>> {
    const bundleNames = Array.isArray(bundleIds)
        ? bundleIds.join(", ")
        : bundleIds;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        let timeoutId: ReturnType<typeof setTimeout> | undefined;

        try {
            const timeoutPromise = new Promise<never>((_, reject) => {
                timeoutId = setTimeout(() => {
                    reject(new BundleLoadTimeoutError(bundleNames));
                }, BUNDLE_LOAD_TIMEOUT_MS);
            });

            const result = await Promise.race([
                Assets.loadBundle(bundleIds, onProgress),
                timeoutPromise,
            ]);

            return result as Record<string, unknown>;
        } catch (error) {
            console.warn(
                `[Loading Bundle - Times ${attempt}/${maxRetries}] Fail for: ${bundleNames}`,
                error,
            );

            // Pixi's loader retries network/parser errors at the individual asset
            // level. Retrying the bundle here can reuse nested cached promises
            // instead of issuing a new request for the failed asset.
            if (!(error instanceof BundleLoadTimeoutError)) {
                throw error;
            }

            if (attempt === maxRetries) {
                throw error;
            }
        } finally {
            clearTimeout(timeoutId);
        }
    }

    throw new Error("Unable to download the bundle after multiple attempts.");
}
