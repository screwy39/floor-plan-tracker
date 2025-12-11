import { AppState, CalibrationData, ReferencePoint, Pose } from './types.js';
export declare class StateStore {
    private state;
    private listeners;
    constructor();
    getState(): AppState;
    subscribe(listener: () => void): () => void;
    private notify;
    setFloorPlan(image: HTMLImageElement, width: number, height: number): void;
    setCalibration(calibration: CalibrationData | null): void;
    addReferencePoint(point: ReferencePoint): void;
    removeReferencePoint(id: string): void;
    updatePose(pose: Pose): void;
    setCorrectionMode(mode: "gps-wifi" | "wifi-only" | "manual-only"): void;
    setShowReferencePoints(show: boolean): void;
    updateCanvasTransform(transform: Partial<AppState['canvasTransform']>): void;
    resetPath(): void;
}
//# sourceMappingURL=StateStore.d.ts.map