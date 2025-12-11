import { Pose } from './types.js';

export class DeadReckoning {
  private pose: Pose;

  constructor(initialPose: Pose = { x: 0, y: 0, theta: 0 }) {
    this.pose = { ...initialPose };
  }

  /**
   * Get current pose
   */
  getPose(): Pose {
    return { ...this.pose };
  }

  /**
   * Step forward by a given distance (meters)
   */
  stepForward(distance: number): void {
    this.pose.x += distance * Math.cos(this.pose.theta);
    this.pose.y += distance * Math.sin(this.pose.theta);
  }

  /**
   * Rotate left by given angle (radians)
   */
  rotateLeft(angle: number): void {
    this.pose.theta -= angle;
    this.normalizeTheta();
  }

  /**
   * Rotate right by given angle (radians)
   */
  rotateRight(angle: number): void {
    this.pose.theta += angle;
    this.normalizeTheta();
  }

  /**
   * Set pose directly
   */
  setPose(pose: Pose): void {
    this.pose = { ...pose };
    this.normalizeTheta();
  }

  /**
   * Apply correction to pose
   */
  applyCorrection(correctedX: number, correctedY: number): void {
    this.pose.x = correctedX;
    this.pose.y = correctedY;
  }

  /**
   * Normalize theta to [-PI, PI]
   */
  private normalizeTheta(): void {
    while (this.pose.theta > Math.PI) this.pose.theta -= 2 * Math.PI;
    while (this.pose.theta < -Math.PI) this.pose.theta += 2 * Math.PI;
  }
}

