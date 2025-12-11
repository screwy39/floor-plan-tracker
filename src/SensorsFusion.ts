import { ExternalEstimate, WifiScan, ReferencePoint, CalibrationData } from './types.js';
import { ReferencePoints } from './ReferencePoints.js';

export class SensorsFusion {
  /**
   * Capture Wi-Fi fingerprint/scan (mock for web version)
   * In a native app, this would call native APIs to scan Wi-Fi networks
   */
  static async captureWifiFingerprintOrScan(): Promise<WifiScan | null> {
    // Mock implementation for web
    return {
      bssids: [
        { bssid: "00:11:22:33:44:55", rssi: -45 },
        { bssid: "00:11:22:33:44:56", rssi: -67 },
        { bssid: "00:11:22:33:44:57", rssi: -72 },
      ],
      timestamp: Date.now(),
    };
  }

  /**
   * Get external position estimate from GPS/cell/Wi-Fi
   */
  static async getExternalPositionEstimate(): Promise<ExternalEstimate | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const estimate: ExternalEstimate = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy,
            source: this.inferSource(position),
            timestamp: position.timestamp,
          };
          resolve(estimate);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          resolve(null);
        },
        options
      );
    });
  }

  /**
   * Infer source type from geolocation position
   */
  private static inferSource(position: GeolocationPosition): "gps" | "cell" | "wifi" | "mixed" {
    const accuracy = position.coords.accuracy;
    
    if (accuracy < 10) {
      return "gps"; // High accuracy suggests GPS
    } else if (accuracy < 100) {
      return "mixed"; // Medium accuracy suggests mixed
    } else {
      return "cell"; // Low accuracy suggests cell tower
    }
  }

  /**
   * Apply drift correction using external estimate
   */
  static computeCorrection(
    deadReckoningPose: { x: number; y: number },
    externalEstimate: ExternalEstimate,
    references: ReferencePoint[],
    calibration: CalibrationData | null,
    correctionMode: "gps-wifi" | "wifi-only" | "manual-only"
  ): { x: number; y: number; alpha: number } | null {
    if (correctionMode === "manual-only") return null;

    // Filter by source if needed
    if (correctionMode === "wifi-only" && externalEstimate.source !== "wifi") {
      return null;
    }

    const worldPos = ReferencePoints.externalEstimateToWorld(
      externalEstimate,
      references,
      calibration
    );

    if (!worldPos) return null;

    // Compute error vector
    const deltaX = worldPos.worldX - deadReckoningPose.x;
    const deltaY = worldPos.worldY - deadReckoningPose.y;

    // Compute alpha based on accuracy and source
    let alpha = 0.3; // Default blending factor

    if (externalEstimate.accuracy < 10) {
      alpha = 0.7; // High confidence GPS
    } else if (externalEstimate.accuracy < 50) {
      alpha = 0.5; // Medium confidence
    } else {
      alpha = 0.2; // Low confidence
    }

    // Adjust based on source
    if (externalEstimate.source === "gps") {
      alpha *= 1.2; // Prefer GPS outdoors
    } else if (externalEstimate.source === "wifi") {
      alpha *= 1.1; // Prefer Wi-Fi indoors
    }

    alpha = Math.min(1, Math.max(0, alpha)); // Clamp to [0, 1]

    return {
      x: deadReckoningPose.x + alpha * deltaX,
      y: deadReckoningPose.y + alpha * deltaY,
      alpha,
    };
  }
}

