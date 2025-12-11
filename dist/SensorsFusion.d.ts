import { ExternalEstimate, WifiScan, ReferencePoint, CalibrationData } from './types.js';
export declare class SensorsFusion {
    /**
     * Capture Wi-Fi fingerprint/scan (mock for web version)
     * In a native app, this would call native APIs to scan Wi-Fi networks
     */
    static captureWifiFingerprintOrScan(): Promise<WifiScan | null>;
    /**
     * Get external position estimate from GPS/cell/Wi-Fi
     */
    static getExternalPositionEstimate(): Promise<ExternalEstimate | null>;
    /**
     * Infer source type from geolocation position
     */
    private static inferSource;
    /**
     * Apply drift correction using external estimate
     */
    static computeCorrection(deadReckoningPose: {
        x: number;
        y: number;
    }, externalEstimate: ExternalEstimate, references: ReferencePoint[], calibration: CalibrationData | null, correctionMode: "gps-wifi" | "wifi-only" | "manual-only"): {
        x: number;
        y: number;
        alpha: number;
    } | null;
}
//# sourceMappingURL=SensorsFusion.d.ts.map