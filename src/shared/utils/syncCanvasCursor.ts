const canvasRef: HTMLCanvasElement | null = null;
const lastPointerX = 0;
const lastPointerY = 0;

/**
 * Force PixiJS to re-evaluate the cursor by dispatching a synthetic
 * pointermove at the last known position. This triggers the full
 * EventBoundary hit-test pipeline so the CSS cursor updates
 * immediately — even when the real pointer hasn't moved.
 */
export function syncCanvasCursor() {
    if (!canvasRef) return;

    canvasRef.dispatchEvent(
        new PointerEvent("pointermove", {
            clientX: lastPointerX,
            clientY: lastPointerY,
            bubbles: true,
            pointerType: "mouse",
        }),
    );
}
