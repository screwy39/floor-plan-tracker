# Floor Plan Tracker

A mobile-first web application for tracking position on a floor plan using dead reckoning with GPS/cell/Wi-Fi fusion corrections. Designed to run in Safari/Chrome on iPhone.

## Features

- **Floor Plan Loading**: Load floor plan images from iPhone photo library
- **Two-Point Calibration**: Calibrate scale and rotation using known distances
- **Reference Points**: Create GPS/Wi-Fi reference points for position correction
- **Dead Reckoning**: Track position using step-based navigation
- **Sensor Fusion**: Automatic position correction using GPS, cell, and Wi-Fi data
- **Touch Controls**: Pinch-zoom and pan for floor plan navigation
- **Mobile-First UI**: Optimized for iPhone Safari/Chrome

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Serve the app:
```bash
npm run serve
```

Or use any static file server. Open `http://localhost:8080` in your iPhone browser.

## Usage

### 1. Load Floor Plan
- Tap "Load Floor Plan" button
- Select an image from your photo library
- The floor plan will appear on the canvas

### 2. Calibrate
- **Two-Point Distance**: Tap two points on the floor plan with a known real-world distance (e.g., 5 meters), then enter the distance when prompted
- **Set Start Point**: Tap your current location on the floor plan to set the world origin (0, 0)
- **Add Reference Point**: Tap a location, then the app will capture GPS/Wi-Fi data at that spot

### 3. Navigate
- Use the navigation buttons:
  - **Step Forward**: Move forward 1 meter
  - **Left 10°**: Rotate left 10 degrees
  - **Right 10°**: Rotate right 10 degrees
- Your position and path will be tracked on the floor plan

### 4. Settings
- **Correction Mode**:
  - GPS + Wi-Fi: Use both GPS/cell and Wi-Fi for corrections
  - Wi-Fi Only: Use only Wi-Fi-based corrections
  - Manual Only: Disable automatic corrections
- **Show Reference Points**: Toggle visibility of reference point markers

### 5. Reference Points
- View all reference points in the list
- Tap "Snap Here" on any reference point to instantly correct your position

## Architecture

The app is built with modular TypeScript modules:

- **StateStore**: Centralized state management
- **FloorplanView**: Canvas rendering and touch gesture handling
- **Calibration**: World-to-image coordinate transformations
- **ReferencePoints**: Reference point management and nearest-point lookup
- **SensorsFusion**: GPS/cell/Wi-Fi data capture and fusion
- **DeadReckoning**: Position tracking using step-based navigation

## Technical Details

- **Coordinate System**: World coordinates (meters) with origin at start point
- **Calibration**: Scale (pixels/meter) and rotation from two-point measurement
- **Correction**: Blended correction using alpha factor based on accuracy
- **Touch Gestures**: Single-finger pan, two-finger pinch-zoom
- **Geolocation**: Uses HTML5 Geolocation API with high accuracy mode

## Browser Compatibility

- iPhone Safari (iOS 12+)
- iPhone Chrome (iOS 12+)
- Requires geolocation permissions
- Requires camera/photo library access for floor plan loading

## Future Enhancements

- Native Wi-Fi scanning API integration (requires native app wrapper)
- Backend Wi-Fi fingerprinting/trilateration service
- IMU sensor integration for more accurate dead reckoning
- Path export and sharing
- Multiple floor plan support

