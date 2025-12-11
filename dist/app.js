import { StateStore } from './StateStore.js';
import { FloorplanView } from './FloorplanView.js';
import { Calibration } from './Calibration.js';
import { ReferencePoints } from './ReferencePoints.js';
import { SensorsFusion } from './SensorsFusion.js';
import { DeadReckoning } from './DeadReckoning.js';
export class FloorPlanTrackerApp {
    constructor(canvas) {
        // Calibration state
        this.calibrationMode = 'none';
        this.twoPointCalibration = {
            point1: null,
            point2: null,
        };
        // Touch/gesture state
        this.isPanning = false;
        this.lastPanPoint = { x: 0, y: 0 };
        this.lastPinchDistance = 0;
        this.touchStartPoints = [];
        this.canvas = canvas;
        this.stateStore = new StateStore();
        this.floorplanView = new FloorplanView(canvas);
        this.deadReckoning = new DeadReckoning();
        this.setupEventListeners();
        this.setupUI();
        this.setupResize();
        // Subscribe to state changes
        this.stateStore.subscribe(() => {
            this.render();
        });
        // Auto-correction loop
        this.startCorrectionLoop();
    }
    setupEventListeners() {
        // Canvas touch events
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        // Prevent default touch behaviors
        this.canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    }
    setupUI() {
        // Load floor plan input (overlay on the green button)
        const fileInput = document.getElementById('floorplan-input');
        if (!fileInput) {
            console.error('File input not found');
            return;
        }
        fileInput.addEventListener('change', (e) => this.handleFloorPlanLoad(e));
        // Calibration buttons
        document.getElementById('cal-two-point')?.addEventListener('click', () => {
            this.startTwoPointCalibration();
        });
        document.getElementById('cal-start-point')?.addEventListener('click', () => {
            this.startStartPointCalibration();
        });
        document.getElementById('cal-reference-point')?.addEventListener('click', () => {
            this.startReferencePointCalibration();
        });
        // Dead reckoning controls
        document.getElementById('dr-forward')?.addEventListener('click', () => {
            this.deadReckoning.stepForward(1.0);
            this.updatePose();
        });
        document.getElementById('dr-left')?.addEventListener('click', () => {
            this.deadReckoning.rotateLeft(Math.PI / 18); // 10 degrees
            this.updatePose();
        });
        document.getElementById('dr-right')?.addEventListener('click', () => {
            this.deadReckoning.rotateRight(Math.PI / 18); // 10 degrees
            this.updatePose();
        });
        // Settings
        const correctionModeSelect = document.getElementById('correction-mode');
        correctionModeSelect?.addEventListener('change', (e) => {
            const mode = e.target.value;
            this.stateStore.setCorrectionMode(mode);
        });
        const showRefsToggle = document.getElementById('show-refs');
        showRefsToggle?.addEventListener('change', (e) => {
            this.stateStore.setShowReferencePoints(e.target.checked);
        });
        // Reference list
        this.updateReferenceList();
    }
    setupResize() {
        const resize = () => {
            const container = this.canvas.parentElement;
            if (container) {
                const rect = container.getBoundingClientRect();
                this.floorplanView.resize(rect.width, rect.height);
                this.render();
            }
        };
        window.addEventListener('resize', resize);
        resize();
    }
    async handleFloorPlanLoad(e) {
        const input = e.target;
        const file = input.files?.[0];
        if (!file)
            return;
        // PDF handling
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        if (isPdf) {
            try {
                const img = await this.loadPdfAsImage(file);
                if (img) {
                    this.setFloorPlanImage(img);
                }
                else {
                    alert('Could not load PDF floor plan');
                }
            }
            catch (err) {
                console.error('PDF load error', err);
                alert('Failed to load PDF. Please try an image or another PDF.');
            }
            return;
        }
        // Image handling
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                this.setFloorPlanImage(img);
            };
            img.src = event.target?.result;
        };
        reader.readAsDataURL(file);
    }
    setFloorPlanImage(img) {
        this.stateStore.setFloorPlan(img, img.width, img.height);
        this.fitImageToCanvas(img);
        // Reset calibration
        this.stateStore.setCalibration(null);
        this.calibrationMode = 'none';
    }
    async loadPdfAsImage(file) {
        const objectUrl = URL.createObjectURL(file);
        try {
            // @ts-ignore: remote module import for pdf.js
            const pdfjs = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/legacy/build/pdf.mjs');
            pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/legacy/build/pdf.worker.min.mjs';
            const pdf = await pdfjs.getDocument({ url: objectUrl }).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx)
                return null;
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: ctx, viewport }).promise;
            return await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = (e) => reject(e);
                img.src = canvas.toDataURL('image/png');
            });
        }
        finally {
            URL.revokeObjectURL(objectUrl);
        }
    }
    fitImageToCanvas(img) {
        const canvasRect = this.canvas.getBoundingClientRect();
        const canvasW = canvasRect.width || this.canvas.width;
        const canvasH = canvasRect.height || this.canvas.height;
        if (!canvasW || !canvasH)
            return;
        const scale = Math.min(canvasW / img.width, canvasH / img.height);
        const offsetX = (canvasW - img.width * scale) / 2;
        const offsetY = (canvasH - img.height * scale) / 2;
        this.stateStore.updateCanvasTransform({
            scale: scale,
            offsetX,
            offsetY,
        });
    }
    startTwoPointCalibration() {
        this.calibrationMode = 'two-point';
        this.twoPointCalibration = { point1: null, point2: null };
        this.showMessage('Tap two points on the floor plan with a known distance');
    }
    startStartPointCalibration() {
        this.calibrationMode = 'start-point';
        this.showMessage('Tap your current location on the floor plan');
    }
    async startReferencePointCalibration() {
        this.calibrationMode = 'reference-point';
        this.showMessage('Tap the location on the floor plan, then we will capture GPS/Wi-Fi');
    }
    handleTouchStart(e) {
        e.preventDefault();
        const touches = Array.from(e.touches);
        this.touchStartPoints = touches.map(t => ({ x: t.clientX, y: t.clientY }));
        if (touches.length === 1) {
            // Single touch - could be tap or pan start
            const touch = touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            this.lastPanPoint = { x, y };
            // Check if this is a calibration tap
            if (this.calibrationMode !== 'none') {
                this.handleCalibrationTap(x, y);
            }
            else {
                this.isPanning = true;
            }
        }
        else if (touches.length === 2) {
            // Pinch start
            const dist = this.getTouchDistance(touches[0], touches[1]);
            this.lastPinchDistance = dist;
            this.isPanning = false;
        }
    }
    handleTouchMove(e) {
        e.preventDefault();
        const touches = Array.from(e.touches);
        const state = this.stateStore.getState();
        if (touches.length === 1 && this.isPanning && this.calibrationMode === 'none') {
            // Panning
            const touch = touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            const dx = x - this.lastPanPoint.x;
            const dy = y - this.lastPanPoint.y;
            this.stateStore.updateCanvasTransform({
                offsetX: state.canvasTransform.offsetX + dx,
                offsetY: state.canvasTransform.offsetY + dy,
            });
            this.lastPanPoint = { x, y };
        }
        else if (touches.length === 2) {
            // Pinch zoom
            const dist = this.getTouchDistance(touches[0], touches[1]);
            const scaleDelta = dist / this.lastPinchDistance;
            const rect = this.canvas.getBoundingClientRect();
            const centerX = (touches[0].clientX + touches[1].clientX) / 2 - rect.left;
            const centerY = (touches[0].clientY + touches[1].clientY) / 2 - rect.top;
            const newScale = state.canvasTransform.scale * scaleDelta;
            const clampedScale = Math.max(0.1, Math.min(5, newScale));
            // Adjust offset to zoom around center point
            const scaleChange = clampedScale / state.canvasTransform.scale;
            const newOffsetX = centerX - (centerX - state.canvasTransform.offsetX) * scaleChange;
            const newOffsetY = centerY - (centerY - state.canvasTransform.offsetY) * scaleChange;
            this.stateStore.updateCanvasTransform({
                scale: clampedScale,
                offsetX: newOffsetX,
                offsetY: newOffsetY,
            });
            this.lastPinchDistance = dist;
        }
    }
    handleTouchEnd(e) {
        e.preventDefault();
        this.isPanning = false;
        this.touchStartPoints = [];
    }
    getTouchDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    handleCalibrationTap(x, y) {
        const state = this.stateStore.getState();
        if (!state.floorPlanImage)
            return;
        const imagePoint = this.floorplanView.screenToImage(x, y, state.canvasTransform);
        if (this.calibrationMode === 'two-point') {
            if (!this.twoPointCalibration.point1) {
                this.twoPointCalibration.point1 = imagePoint;
                this.showMessage('Tap the second point');
            }
            else {
                this.twoPointCalibration.point2 = imagePoint;
                this.promptTwoPointDistance();
            }
        }
        else if (this.calibrationMode === 'start-point') {
            this.setStartPoint(imagePoint);
        }
        else if (this.calibrationMode === 'reference-point') {
            this.addReferencePoint(imagePoint);
        }
    }
    promptTwoPointDistance() {
        const distanceStr = prompt('Enter the real-world distance between these two points (in meters):');
        if (!distanceStr) {
            this.calibrationMode = 'none';
            return;
        }
        const distance = parseFloat(distanceStr);
        if (isNaN(distance) || distance <= 0) {
            alert('Invalid distance');
            this.calibrationMode = 'none';
            return;
        }
        const state = this.stateStore.getState();
        if (!this.twoPointCalibration.point1 || !this.twoPointCalibration.point2)
            return;
        // Use first point as origin for now
        const calibration = Calibration.computeFromTwoPoints(this.twoPointCalibration.point1, this.twoPointCalibration.point2, distance, this.twoPointCalibration.point1);
        this.stateStore.setCalibration(calibration);
        this.calibrationMode = 'none';
        this.twoPointCalibration = { point1: null, point2: null };
        this.showMessage('Two-point calibration complete');
    }
    setStartPoint(imagePoint) {
        const state = this.stateStore.getState();
        if (!state.calibration) {
            alert('Please perform two-point calibration first');
            this.calibrationMode = 'none';
            return;
        }
        // Update calibration origin
        const newCalibration = {
            ...state.calibration,
            originImageU: imagePoint.u,
            originImageV: imagePoint.v,
            originWorldX: 0,
            originWorldY: 0,
        };
        this.stateStore.setCalibration(newCalibration);
        this.deadReckoning.setPose({ x: 0, y: 0, theta: 0 });
        this.updatePose();
        this.calibrationMode = 'none';
        this.showMessage('Start point set');
    }
    async addReferencePoint(imagePoint) {
        const state = this.stateStore.getState();
        if (!state.calibration) {
            alert('Please perform calibration first');
            this.calibrationMode = 'none';
            return;
        }
        // Get world coordinates
        const worldPos = Calibration.imageToWorld(imagePoint.u, imagePoint.v, state.calibration);
        // Capture GPS/Wi-Fi
        this.showMessage('Capturing GPS/Wi-Fi position...');
        const externalEstimate = await SensorsFusion.getExternalPositionEstimate();
        const wifiScan = await SensorsFusion.captureWifiFingerprintOrScan();
        const ref = {
            id: ReferencePoints.generateId(),
            worldX: worldPos.x,
            worldY: worldPos.y,
            imageU: imagePoint.u,
            imageV: imagePoint.v,
            geoLat: externalEstimate?.lat,
            geoLon: externalEstimate?.lon,
            geoAccuracy: externalEstimate?.accuracy,
            geoSource: externalEstimate?.source,
            wifiFingerprintId: wifiScan ? `wifi_${Date.now()}` : undefined,
            wifiScanSummary: wifiScan || undefined,
            name: `Ref ${this.stateStore.getState().referencePoints.length + 1}`,
        };
        this.stateStore.addReferencePoint(ref);
        this.calibrationMode = 'none';
        this.updateReferenceList();
        this.showMessage('Reference point added');
    }
    updatePose() {
        const pose = this.deadReckoning.getPose();
        this.stateStore.updatePose(pose);
    }
    async startCorrectionLoop() {
        const loop = async () => {
            const state = this.stateStore.getState();
            if (state.calibration && state.correctionMode !== 'manual-only') {
                const drPose = this.deadReckoning.getPose();
                const externalEstimate = await SensorsFusion.getExternalPositionEstimate();
                if (externalEstimate) {
                    const correction = SensorsFusion.computeCorrection({ x: drPose.x, y: drPose.y }, externalEstimate, state.referencePoints, state.calibration, state.correctionMode);
                    if (correction) {
                        this.deadReckoning.applyCorrection(correction.x, correction.y);
                        this.updatePose();
                    }
                }
            }
            setTimeout(loop, 5000); // Check every 5 seconds
        };
        loop();
    }
    updateReferenceList() {
        const listEl = document.getElementById('reference-list');
        if (!listEl)
            return;
        const state = this.stateStore.getState();
        listEl.innerHTML = '';
        state.referencePoints.forEach(ref => {
            const item = document.createElement('div');
            item.className = 'reference-item';
            const sources = [];
            if (ref.geoSource)
                sources.push(ref.geoSource.toUpperCase());
            if (ref.wifiFingerprintId)
                sources.push('Wi-Fi');
            item.innerHTML = `
        <div class="ref-name">${ref.name || ref.id}</div>
        <div class="ref-sources">${sources.join(', ')}</div>
        <div class="ref-accuracy">${ref.geoAccuracy ? `±${Math.round(ref.geoAccuracy)}m` : 'N/A'}</div>
        <button class="ref-snap-btn" data-id="${ref.id}">Snap Here</button>
      `;
            const snapBtn = item.querySelector('.ref-snap-btn');
            snapBtn.addEventListener('click', () => {
                this.deadReckoning.setPose({ x: ref.worldX, y: ref.worldY, theta: 0 });
                this.updatePose();
            });
            listEl.appendChild(item);
        });
    }
    render() {
        const state = this.stateStore.getState();
        this.floorplanView.render(state);
    }
    showMessage(message) {
        const msgEl = document.getElementById('status-message');
        if (msgEl) {
            msgEl.textContent = message;
            setTimeout(() => {
                if (msgEl.textContent === message) {
                    msgEl.textContent = '';
                }
            }, 3000);
        }
    }
}
// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
}
else {
    init();
}
function init() {
    const canvas = document.getElementById('floorplan-canvas');
    if (canvas) {
        new FloorPlanTrackerApp(canvas);
    }
}
//# sourceMappingURL=app.js.map