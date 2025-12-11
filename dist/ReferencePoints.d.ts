import { ReferencePoint, ExternalEstimate, CalibrationData } from './types.js';
export declare class ReferencePoints {
    /**
     * Find nearest reference point by geographic coordinates
     */
    static findNearestByGeo(lat: number, lon: number, references: ReferencePoint[]): ReferencePoint | null;
    /**
     * Convert external estimate to world coordinates using nearest reference
     */
    static externalEstimateToWorld(estimate: ExternalEstimate, references: ReferencePoint[], calibration: CalibrationData | null): {
        worldX: number;
        worldY: number;
    } | null;
    /**
     * Haversine distance formula for lat/lon distance
     */
    private static haversineDistance;
    private static toRadians;
    /**
     * Generate unique ID for reference point
     */
    static generateId(): string;
}
//# sourceMappingURL=ReferencePoints.d.ts.map