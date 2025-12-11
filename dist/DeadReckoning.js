export class DeadReckoning {
    constructor(initialPose = { x: 0, y: 0, theta: 0 }) {
        this.pose = { ...initialPose };
    }
    /**
     * Get current pose
     */
    getPose() {
        return { ...this.pose };
    }
    /**
     * Step forward by a given distance (meters)
     */
    stepForward(distance) {
        this.pose.x += distance * Math.cos(this.pose.theta);
        this.pose.y += distance * Math.sin(this.pose.theta);
    }
    /**
     * Rotate left by given angle (radians)
     */
    rotateLeft(angle) {
        this.pose.theta -= angle;
        this.normalizeTheta();
    }
    /**
     * Rotate right by given angle (radians)
     */
    rotateRight(angle) {
        this.pose.theta += angle;
        this.normalizeTheta();
    }
    /**
     * Set pose directly
     */
    setPose(pose) {
        this.pose = { ...pose };
        this.normalizeTheta();
    }
    /**
     * Apply correction to pose
     */
    applyCorrection(correctedX, correctedY) {
        this.pose.x = correctedX;
        this.pose.y = correctedY;
    }
    /**
     * Normalize theta to [-PI, PI]
     */
    normalizeTheta() {
        while (this.pose.theta > Math.PI)
            this.pose.theta -= 2 * Math.PI;
        while (this.pose.theta < -Math.PI)
            this.pose.theta += 2 * Math.PI;
    }
}
//# sourceMappingURL=DeadReckoning.js.map