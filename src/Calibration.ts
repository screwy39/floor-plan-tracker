import { CalibrationData, ImagePoint, WorldPoint } from './types.js';

export class Calibration {
  /**
   * Compute calibration from two-point distance measurement
   */
  static computeFromTwoPoints(
    point1Image: ImagePoint,
    point2Image: ImagePoint,
    realWorldDistanceMeters: number,
    originImage: ImagePoint
  ): CalibrationData {
    // Calculate pixel distance
    const dx = point2Image.u - point1Image.u;
    const dy = point2Image.v - point1Image.v;
    const pixelDistance = Math.sqrt(dx * dx + dy * dy);

    // Scale: pixels per meter
    const scale = pixelDistance / realWorldDistanceMeters;

    // Rotation: angle of the line in image space
    const rotation = Math.atan2(dy, dx);

    // Origin is set to the tapped start point
    return {
      scale,
      rotation,
      originWorldX: 0,
      originWorldY: 0,
      originImageU: originImage.u,
      originImageV: originImage.v,
    };
  }

  /**
   * Convert world coordinates to image coordinates
   */
  static worldToImage(
    worldX: number,
    worldY: number,
    calibration: CalibrationData
  ): ImagePoint {
    // Rotate world coordinates to align with image orientation
    const cosR = Math.cos(calibration.rotation);
    const sinR = Math.sin(calibration.rotation);
    
    // Apply rotation and scale
    const rotatedX = worldX * cosR - worldY * sinR;
    const rotatedY = worldX * sinR + worldY * cosR;
    
    // Scale to pixels
    const pixelX = rotatedX * calibration.scale;
    const pixelY = rotatedY * calibration.scale;
    
    // Translate to origin
    return {
      u: calibration.originImageU + pixelX,
      v: calibration.originImageV + pixelY,
    };
  }

  /**
   * Convert image coordinates to world coordinates
   */
  static imageToWorld(
    imageU: number,
    imageV: number,
    calibration: CalibrationData
  ): WorldPoint {
    // Translate to origin
    const pixelX = imageU - calibration.originImageU;
    const pixelY = imageV - calibration.originImageV;
    
    // Scale to meters
    const scaledX = pixelX / calibration.scale;
    const scaledY = pixelY / calibration.scale;
    
    // Rotate back to world orientation
    const cosR = Math.cos(-calibration.rotation);
    const sinR = Math.sin(-calibration.rotation);
    
    return {
      x: scaledX * cosR - scaledY * sinR,
      y: scaledX * sinR + scaledY * cosR,
    };
  }
}

