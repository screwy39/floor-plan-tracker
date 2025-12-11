import { ReferencePoint, ExternalEstimate, CalibrationData } from './types.js';
import { Calibration } from './Calibration.js';

export class ReferencePoints {
  /**
   * Find nearest reference point by geographic coordinates
   */
  static findNearestByGeo(
    lat: number,
    lon: number,
    references: ReferencePoint[]
  ): ReferencePoint | null {
    if (references.length === 0) return null;

    let nearest: ReferencePoint | null = null;
    let minDistance = Infinity;

    for (const ref of references) {
      if (ref.geoLat === undefined || ref.geoLon === undefined) continue;

      const distance = this.haversineDistance(lat, lon, ref.geoLat, ref.geoLon);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = ref;
      }
    }

    return nearest;
  }

  /**
   * Convert external estimate to world coordinates using nearest reference
   */
  static externalEstimateToWorld(
    estimate: ExternalEstimate,
    references: ReferencePoint[],
    calibration: CalibrationData | null
  ): { worldX: number; worldY: number } | null {
    if (!calibration) return null;

    // If backend already provides world coordinates, use them
    if (estimate.worldX !== undefined && estimate.worldY !== undefined) {
      return { worldX: estimate.worldX, worldY: estimate.worldY };
    }

    // Otherwise, snap to nearest reference point
    const nearest = this.findNearestByGeo(estimate.lat, estimate.lon, references);
    if (!nearest) return null;

    return {
      worldX: nearest.worldX,
      worldY: nearest.worldY,
    };
  }

  /**
   * Haversine distance formula for lat/lon distance
   */
  private static haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Earth radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Generate unique ID for reference point
   */
  static generateId(): string {
    return `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

