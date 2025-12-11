export class StateStore {
    constructor() {
        this.listeners = new Set();
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
    getState() {
        return { ...this.state };
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    notify() {
        this.listeners.forEach(listener => listener());
    }
    setFloorPlan(image, width, height) {
        this.state.floorPlanImage = image;
        this.state.floorPlanWidth = width;
        this.state.floorPlanHeight = height;
        this.notify();
    }
    setCalibration(calibration) {
        this.state.calibration = calibration;
        this.notify();
    }
    addReferencePoint(point) {
        this.state.referencePoints.push(point);
        this.notify();
    }
    removeReferencePoint(id) {
        this.state.referencePoints = this.state.referencePoints.filter(p => p.id !== id);
        this.notify();
    }
    updatePose(pose) {
        this.state.currentPose = pose;
        this.state.pathHistory.push({ x: pose.x, y: pose.y });
        this.notify();
    }
    setCorrectionMode(mode) {
        this.state.correctionMode = mode;
        this.notify();
    }
    setShowReferencePoints(show) {
        this.state.showReferencePoints = show;
        this.notify();
    }
    updateCanvasTransform(transform) {
        this.state.canvasTransform = { ...this.state.canvasTransform, ...transform };
        this.notify();
    }
    resetPath() {
        this.state.pathHistory = [];
        this.notify();
    }
}
//# sourceMappingURL=StateStore.js.map