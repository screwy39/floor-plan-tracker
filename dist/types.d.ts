export interface Point2D {
    x: number;
    y: number;
}
export interface ImagePoint {
    u: number;
    v: number;
}
export interface WorldPoint extends Point2D {
}
export interface Pose {
    x: number;
    y: number;
    theta: number;
}
export interface CalibrationData {
    scale: number;
    rotation: number;
    originWorldX: number;
    originWorldY: number;
    originImageU: number;
    originImageV: number;
}
export interface ReferencePoint {
    id: string;
    worldX: number;
    worldY: number;
    imageU: number;
    imageV: number;
    geoLat?: number;
    geoLon?: number;
    geoAccuracy?: number;
    geoSource?: "gps" | "cell" | "wifi" | "mixed";
    wifiFingerprintId?: string;
    wifiScanSummary?: object;
    name?: string;
}
export interface WifiScan {
    bssids: Array<{
        bssid: string;
        rssi: number;
    }>;
    timestamp: number;
}
export interface ExternalEstimate {
    lat: number;
    lon: number;
    accuracy: number;
    source: "gps" | "cell" | "wifi" | "mixed";
    worldX?: number;
    worldY?: number;
    timestamp: number;
}
export interface AppState {
    floorPlanImage: HTMLImageElement | null;
    floorPlanWidth: number;
    floorPlanHeight: number;
    calibration: CalibrationData | null;
    referencePoints: ReferencePoint[];
    currentPose: Pose;
    pathHistory: WorldPoint[];
    correctionMode: "gps-wifi" | "wifi-only" | "manual-only";
    showReferencePoints: boolean;
    canvasTransform: {
        scale: number;
        offsetX: number;
        offsetY: number;
    };
}
//# sourceMappingURL=types.d.ts.map