# BitKill Music Website - Technical Documentation

A monochrome-themed progressive web application for electronic music producer BitKill, featuring interactive audio visualization, real-time glitch effects, and offline capabilities.

![BitKill Music](/icons/logo.png)

## Technical Architecture Overview

This application implements a modern frontend architecture with a focus on immersive audio-visual experiences, monochrome aesthetics, and progressive web app functionality. It employs a modular component-based structure with clear separation of concerns across visualization engines, audio processing, UI effects, and service worker integration.

### Tech Stack

- **Core Technologies**:
  - HTML5 with semantic markup and comprehensive metadata
  - CSS3 with modular organization and CSS custom properties
  - Vanilla JavaScript (ES6+) with component-based architecture
  - Web Audio API for audio analysis and processing
  - Canvas API for real-time visualization rendering
  - Service Worker API for offline capabilities

- **Third-Party Dependencies**:
  - GSAP (GreenSock Animation Platform) for advanced animations
  - AOS (Animate on Scroll) for scroll-based animations
  - Vanilla Tilt for 3D tilt effects on CRT frames
  - Three.js with EffectComposer for advanced visual effects

### Core Components and Implementation

### 1. Audio Visualization System

The audio visualization system is built on two primary components:

```javascript
// Main audio visualizer engine
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 512; // Power of 2, affects frequency resolution
const dataArray = new Uint8Array(analyser.frequencyBinCount);
```

Implements multiple visualization modes:
- **Waveform Oscilloscope**: Standard time-domain visualization with 2048-point FFT
- **Circular Visualizer**: Polar coordinate mapping of frequency data
- **Bar Spectrum**: Frequency-domain visualization with color gradients
- **Dot Pattern**: Particle-based visualization with HSL color mapping

Rendering is performed using `requestAnimationFrame` for optimal performance, with canvas operations optimized to prevent layout thrashing:

```javascript
// Optimization for frequent pixel manipulation
const ctx = canvas.getContext('2d', { willReadFrequently: true });
```

### 2. Glitch Effects Engine

The glitch engine implements several visual effect techniques:

- **Color Channel Manipulation**: RGB channel separation and randomization
- **Geometric Distortion**: Random skew, rotation, and displacement using GSAP
- **Scanline Rendering**: CRT-style scanlines with variable intensity
- **Buffer Manipulation**: Direct pixel data manipulation via `getImageData()/putImageData()`
- **DOM Mutation Effects**: Random element distortion and overlay generation

Implementation uses a combination of CSS effects and JavaScript-driven canvas manipulation:

```javascript
// Example of glitch effect implementation
function addGlitchEffect() {
  // Get image data from canvas
  const imageData = ctx.getImageData(0, glitchY, glitchWidth, glitchHeight);
  const data = imageData.data;
  
  // Manipulate color channels
  for (let i = 0; i < data.length; i += 4) {
    if (Math.random() > 0.5) {
      // Swap R and B channels
      const temp = data[i];
      data[i] = data[i + 2];
      data[i + 2] = temp;
    }
  }
  
  // Apply manipulated data
  ctx.putImageData(imageData, 0, glitchY);
}
```

### 3. Monochrome Background System

The website now uses a dedicated monochrome background animation system:

- **Particle System**: Creates a 3D space with floating particles in monochrome colors
- **Glitch Effects**: Occasional glitch effects synchronized with audio playback
- **Audio Reactivity**: Subtle particle movement and color changes based on audio input

```javascript
// Example from mono-engine.js
const particleGeometry = new THREE.BufferGeometry();
const particleCount = 2000;

const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const velocities = []; // Array to store particle velocities for floating effect

for (let i = 0; i < particleCount * 3; i += 3) {
  // Position particles in a wider space
  positions[i] = (Math.random() - 0.5) * 15;
  positions[i + 1] = (Math.random() - 0.5) * 15;
  positions[i + 2] = (Math.random() - 0.5) * 15;
  
  // Store random velocities for each particle
  velocities.push({
    x: (Math.random() - 0.5) * 0.01,
    y: (Math.random() - 0.5) * 0.01,
    z: (Math.random() - 0.5) * 0.01
  });
  
  // Monochrome color palette with slight variations for glitch effect
  const brightness = Math.random() * 0.5 + 0.5; // Value between 0.5 and 1.0
  colors[i] = brightness; // R
  colors[i + 1] = brightness; // G
  colors[i + 2] = brightness; // B
}
```



- **HSTS Implementation**: HTTP Strict Transport Security enforcement
- **Form Security**: Honeypot fields to prevent spam submissions
- **External Resource Integrity**: Limited script sources with specific domains

### 6. User Interface Components

The UI implements several advanced techniques:

- **Terminal Emulation**: Realistic command-line interface with variable typing speeds
```javascript
// Terminal typing effect with irregular timing for realism
function typeTerminal() {
  // Add random typing irregularities
  typingSpeed = Math.random() > 0.9 ? 300 : Math.random() > 0.5 ? 80 : 40;
  // ...typing logic
}
```

- **CRT Display Effects**: Scanlines, phosphor glow, and screen distortion
- **Interactive Audio Controls**: Real-time parameter adjustment with visual feedback
- **Contact Form**: Form with animation effects and cyberpunk aesthetic
- **CSS Grid Layout**: Responsive grid system for content organization

## Performance Optimizations

1. **Canvas Rendering**:
   - Off-screen canvas rendering for complex operations
   - Limited redraw regions for glitch effects
   - Optimized animation loops with conditional rendering

2. **Asset Loading**:
   - Critical CSS inlined in head
   - Non-critical resources loaded asynchronously
   - Media preloading for key visual elements

3. **Animation Performance**:
   - GPU-accelerated animations via transform properties
   - GSAP timeline optimization for animation sequences
   - Throttled event handlers for mouse interactions

## Directory Structure

```
/
├── index.html              # Main application entry point
├─
├── sw.js       # PWA service worker implementation
├── sitemap.xml             # XML sitemap for search engines
├── robots.txt              # Robots crawl instructions
├── assets/
│   ├── css/
│   │   ├── audio-visualizer.css     # Audio visualization component styles
│   │   ├── contact-form.css         # Form styling and animations
│   │   ├── cyber-footer.css         # Footer component with glitch effects
│   │   ├── main-styles.css          # Core styling and CSS variables
│   │   ├── music-demos.css          # Music showcase components
│   │   └── sound-buttons.css        # Audio control interface
│   └── js/
│       ├── contact-form.js          # Form validation and submission
│       ├── first-input.js           # Input handling and initialization
│       ├── footer-glitch.js         # Footer-specific effects
│       ├── formoid.min.js           # Form utility library
│       ├── glitch-engine.js         # Core visual glitch system
│       ├── meta-data.js             # Dynamic metadata management
│       ├── mono-engine.js           # Monochrome background animation system
│       ├── sw-init.js               # PWA and Service Worker initialization
│       ├── sound-input.js           # Audio input and processing
│       ├── structured-data.js       # JSON-LD schema implementation
│       ├── visualizer-engine.js     # Audio visualization rendering
│       └── wallpaper-engine.js      # Legacy cyberpunk background animation (not in use)
```

## Implementation Details

### Audio Processing Pipeline

The audio processing implements a multi-stage pipeline:

1. **Input Capture**: Audio input from file playback or oscillator
2. **Analysis**: FFT processing via AnalyserNode with configurable FFT size
3. **Data Extraction**: Time/frequency domain data via Uint8Array buffers
4. **Visualization Rendering**: Canvas-based rendering with multiple visualization modes

```javascript
// Audio processing pipeline
audioSource.connect(analyser);
analyser.connect(gainNode);
gainNode.connect(audioCtx.destination);
analyser.getByteFrequencyData(dataArray);
```


## Browser Compatibility

- **Desktop Browsers**:
  - Chrome/Edge 90+
  - Firefox 88+
  - Safari 14+

- **Mobile Browsers**:
  - iOS Safari 14+
  - Android Chrome 90+
  - Samsung Internet 14+


## License

All rights reserved. The code, design, and content are proprietary to BitKill.

## Technical Contact

For website technical issues: bitkill@ipv7.pt

