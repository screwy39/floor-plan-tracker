export class ReferencePoints {
    /**
     * Find nearest reference point by geographic coordinates
     */
    static findNearestByGeo(lat, lon, references) {
        if (references.length === 0)
            return null;
        let nearest = null;
        let minDistance = Infinity;
        for (const ref of references) {
            if (ref.geoLat === undefined || ref.geoLon === undefined)
                continue;
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
    static externalEstimateToWorld(estimate, references, calibration) {
        if (!calibration)
            return null;
        // If backend already provides world coordinates, use them
        if (estimate.worldX !== undefined && estimate.worldY !== undefined) {
            return { worldX: estimate.worldX, worldY: estimate.worldY };
        }
        // Otherwise, snap to nearest reference point
        const nearest = this.findNearestByGeo(estimate.lat, estimate.lon, references);
        if (!nearest)
            return null;
        return {
            worldX: nearest.worldX,
            worldY: nearest.worldY,
        };
    }
    /**
     * Haversine distance formula for lat/lon distance
     */
    static haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000; // Earth radius in meters
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) *
                Math.cos(this.toRadians(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    static toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    /**
     * Generate unique ID for reference point
     */
    static generateId() {
        return `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
//# sourceMappingURL=ReferencePoints.js.map