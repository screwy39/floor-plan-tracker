import { CalibrationData, ImagePoint, WorldPoint } from './types.js';
export declare class Calibration {
    /**
     * Compute calibration from two-point distance measurement
     */
    static computeFromTwoPoints(point1Image: ImagePoint, point2Image: ImagePoint, realWorldDistanceMeters: number, originImage: ImagePoint): CalibrationData;
    /**
     * Convert world coordinates to image coordinates
     */
    static worldToImage(worldX: number, worldY: number, calibration: CalibrationData): ImagePoint;
    /**
     * Convert image coordinates to world coordinates
     */
    static imageToWorld(imageU: number, imageV: number, calibration: CalibrationData): WorldPoint;
}
//# sourceMappingURL=Calibration.d.ts.map