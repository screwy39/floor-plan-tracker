import { AppState, CalibrationData, ReferencePoint, Pose } from './types.js';

export class StateStore {
  private state: AppState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = {
      floorPlanImage: null,
      floorPlanWidth: 0,
      floorPlanHeight: 0,
      calibration: null,
      referencePoints: [],
      currentPose: { x: 0, y: 0, theta: 0 },
      pathHistory: [],
      correctionMode: "gps-wifi",
      showReferencePoints: true,
      canvasTransform: {
        scale: 1,
        offsetX: 0,
        offsetY: 0,
      },
    };
  }

  getState(): AppState {
    return { ...this.state };
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }

  setFloorPlan(image: HTMLImageElement, width: number, height: number): void {
    this.state.floorPlanImage = image;
    this.state.floorPlanWidth = width;
    this.state.floorPlanHeight = height;
    this.notify();
  }

  setCalibration(calibration: CalibrationData | null): void {
    this.state.calibration = calibration;
    this.notify();
  }

  addReferencePoint(point: ReferencePoint): void {
    this.state.referencePoints.push(point);
    this.notify();
  }

  removeReferencePoint(id: string): void {
    this.state.referencePoints = this.state.referencePoints.filter(p => p.id !== id);
    this.notify();
  }

  updatePose(pose: Pose): void {
    this.state.currentPose = pose;
    this.state.pathHistory.push({ x: pose.x, y: pose.y });
    this.notify();
  }

  setCorrectionMode(mode: "gps-wifi" | "wifi-only" | "manual-only"): void {
    this.state.correctionMode = mode;
    this.notify();
  }

  setShowReferencePoints(show: boolean): void {
    this.state.showReferencePoints = show;
    this.notify();
  }

  updateCanvasTransform(transform: Partial<AppState['canvasTransform']>): void {
    this.state.canvasTransform = { ...this.state.canvasTransform, ...transform };
    this.notify();
  }

  resetPath(): void {
    this.state.pathHistory = [];
    this.notify();
  }
}

