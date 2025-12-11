import { AppState } from './types.js';
export declare class FloorplanView {
    private canvas;
    private ctx;
    constructor(canvas: HTMLCanvasElement);
    /**
     * Render the floor plan, path, pose, and reference points
     */
    render(state: AppState): void;
    /**
     * Draw path polyline
     */
    private drawPath;
    /**
     * Draw current pose marker
     */
    private drawPose;
    /**
     * Draw reference point marker
     */
    private drawReferencePoint;
    /**
     * Convert screen coordinates to image coordinates accounting for transform
     */
    screenToImage(screenX: number, screenY: number, transform: AppState['canvasTransform']): {
        u: number;
        v: number;
    };
    /**
     * Resize canvas to match container
     */
    resize(width: number, height: number): void;
}
//# sourceMappingURL=FloorplanView.d.ts.map