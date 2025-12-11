import { Pose } from './types.js';
export declare class DeadReckoning {
    private pose;
    constructor(initialPose?: Pose);
    /**
     * Get current pose
     */
    getPose(): Pose;
    /**
     * Step forward by a given distance (meters)
     */
    stepForward(distance: number): void;
    /**
     * Rotate left by given angle (radians)
     */
    rotateLeft(angle: number): void;
    /**
     * Rotate right by given angle (radians)
     */
    rotateRight(angle: number): void;
    /**
     * Set pose directly
     */
    setPose(pose: Pose): void;
    /**
     * Apply correction to pose
     */
    applyCorrection(correctedX: number, correctedY: number): void;
    /**
     * Normalize theta to [-PI, PI]
     */
    private normalizeTheta;
}
//# sourceMappingURL=DeadReckoning.d.ts.map