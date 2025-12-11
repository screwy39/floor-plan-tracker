import { Calibration } from './Calibration.js';
export class FloorplanView {
    constructor(canvas) {
        this.canvas = canvas;
        const context = canvas.getContext('2d');
        if (!context) {
            throw new Error('Could not get 2D context from canvas');
        }
        this.ctx = context;
    }
    /**
     * Render the floor plan, path, pose, and reference points
     */
    render(state) {
        const { width, height } = this.canvas;
        this.ctx.clearRect(0, 0, width, height);
        // Apply transform
        this.ctx.save();
        this.ctx.translate(state.canvasTransform.offsetX, state.canvasTransform.offsetY);
        this.ctx.scale(state.canvasTransform.scale, state.canvasTransform.scale);
        // Draw floor plan image
        if (state.floorPlanImage) {
            this.ctx.drawImage(state.floorPlanImage, 0, 0, state.floorPlanWidth, state.floorPlanHeight);
        }
        // Draw path history
        if (state.calibration && state.pathHistory.length > 1) {
            this.drawPath(state.pathHistory, state.calibration);
        }
        // Draw reference points
        if (state.showReferencePoints && state.calibration) {
            state.referencePoints.forEach(ref => {
                this.drawReferencePoint(ref, state.calibration);
            });
        }
        // Draw current pose
        if (state.calibration) {
            this.drawPose(state.currentPose, state.calibration);
        }
        this.ctx.restore();
    }
    /**
     * Draw path polyline
     */
    drawPath(path, calibration) {
        if (!calibration || path.length < 2)
            return;
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2 / this.ctx.getTransform().a; // Scale-aware line width
        this.ctx.beginPath();
        const start = Calibration.worldToImage(path[0].x, path[0].y, calibration);
        this.ctx.moveTo(start.u, start.v);
        for (let i = 1; i < path.length; i++) {
            const point = Calibration.worldToImage(path[i].x, path[i].y, calibration);
            this.ctx.lineTo(point.u, point.v);
        }
        this.ctx.stroke();
    }
    /**
     * Draw current pose marker
     */
    drawPose(pose, calibration) {
        if (!calibration)
            return;
        const imgPos = Calibration.worldToImage(pose.x, pose.y, calibration);
        const scale = 1 / this.ctx.getTransform().a;
        // Draw position circle
        this.ctx.fillStyle = '#ff0000';
        this.ctx.beginPath();
        this.ctx.arc(imgPos.u, imgPos.v, 8 * scale, 0, 2 * Math.PI);
        this.ctx.fill();
        // Draw heading arrow
        const arrowLength = 20 * scale;
        const arrowX = imgPos.u + arrowLength * Math.cos(pose.theta);
        const arrowY = imgPos.v + arrowLength * Math.sin(pose.theta);
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 3 * scale;
        this.ctx.beginPath();
        this.ctx.moveTo(imgPos.u, imgPos.v);
        this.ctx.lineTo(arrowX, arrowY);
        this.ctx.stroke();
        // Arrowhead
        const arrowheadAngle = Math.PI / 6;
        const arrowheadLength = 8 * scale;
        this.ctx.beginPath();
        this.ctx.moveTo(arrowX, arrowY);
        this.ctx.lineTo(arrowX - arrowheadLength * Math.cos(pose.theta - arrowheadAngle), arrowY - arrowheadLength * Math.sin(pose.theta - arrowheadAngle));
        this.ctx.moveTo(arrowX, arrowY);
        this.ctx.lineTo(arrowX - arrowheadLength * Math.cos(pose.theta + arrowheadAngle), arrowY - arrowheadLength * Math.sin(pose.theta + arrowheadAngle));
        this.ctx.stroke();
    }
    /**
     * Draw reference point marker
     */
    drawReferencePoint(ref, calibration) {
        if (!calibration)
            return;
        const scale = 1 / this.ctx.getTransform().a;
        const size = 12 * scale;
        // Choose color based on source
        let color = '#0000ff'; // Default blue
        if (ref.geoSource === 'gps') {
            color = '#00ff00'; // Green for GPS
        }
        else if (ref.geoSource === 'wifi') {
            color = '#ff00ff'; // Magenta for Wi-Fi
        }
        else if (ref.geoSource === 'mixed') {
            color = '#ffff00'; // Yellow for mixed
        }
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2 * scale;
        // Draw square marker
        this.ctx.fillRect(ref.imageU - size / 2, ref.imageV - size / 2, size, size);
        this.ctx.strokeRect(ref.imageU - size / 2, ref.imageV - size / 2, size, size);
        // Draw label if available
        if (ref.name) {
            this.ctx.fillStyle = '#000000';
            this.ctx.font = `${10 * scale}px sans-serif`;
            this.ctx.fillText(ref.name, ref.imageU + size, ref.imageV);
        }
    }
    /**
     * Convert screen coordinates to image coordinates accounting for transform
     */
    screenToImage(screenX, screenY, transform) {
        const u = (screenX - transform.offsetX) / transform.scale;
        const v = (screenY - transform.offsetY) / transform.scale;
        return { u, v };
    }
    /**
     * Resize canvas to match container
     */
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }
}
//# sourceMappingURL=FloorplanView.js.map