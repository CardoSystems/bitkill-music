# BitKill Music Website - Technical Documentation

A cyberpunk-themed progressive web application for electronic music producer BitKill, featuring interactive audio visualization, real-time glitch effects, and offline capabilities.

![BitKill Music](favicon.png)

## Technical Architecture Overview

This application implements a modern frontend architecture with a focus on immersive audio-visual experiences, cyberpunk aesthetics, and progressive web app functionality. It employs a modular component-based structure with clear separation of concerns across visualization engines, audio processing, UI effects, and service worker integration.

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

## Core Components and Implementation

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

### 3. Progressive Web App Implementation

The service worker implements a sophisticated caching strategy with three distinct cache stores:

```javascript
// Service worker cache configuration
const CACHE_NAME = 'bitkill-cache-v1';         // Core assets
const MEDIA_CACHE_NAME = 'bitkill-media-cache-v1'; // Media files
const API_CACHE_NAME = 'bitkill-api-cache-v1';     // API responses
```

- **Core Assets Cache**: Cache-first strategy for HTML, CSS, JS with network fallback
- **Media Cache**: Stale-while-revalidate strategy for audio/video/images
- **API Cache**: Network-first strategy with timeout fallback to cached responses

The service worker also implements:
- Content-specific caching strategies based on MIME types and URL patterns
- Background synchronization for media updates
- Custom offline fallback page with minimal styling
- Cache cleanup on service worker activation

### 4. Security Implementation

The application implements several security best practices:

- **Content Security Policy**: Strict CSP to prevent XSS attacks
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://assets.xperia.pt https://media.xperia.pt https://embed.music.apple.com https://api.web3forms.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://assets.xperia.pt; img-src 'self' https://media.xperia.pt data:; font-src 'self' https://fonts.gstatic.com; frame-src https://embed.music.apple.com; connect-src 'self' https://api.web3forms.com https://cloudflareinsights.com; media-src 'self' https://media.xperia.pt;">
```

- **HSTS Implementation**: HTTP Strict Transport Security enforcement
- **Form Security**: Honeypot fields to prevent spam submissions
- **External Resource Integrity**: Limited script sources with specific domains

### 5. User Interface Components

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

2. **Service Worker**:
   - Strategic caching based on content type
   - Timeout-based fallbacks for network requests
   - Background syncing for media resources

3. **Asset Loading**:
   - Critical CSS inlined in head
   - Non-critical resources loaded asynchronously
   - Media preloading for key visual elements

4. **Animation Performance**:
   - GPU-accelerated animations via transform properties
   - GSAP timeline optimization for animation sequences
   - Throttled event handlers for mouse interactions

## Directory Structure

```
/
├── index.html              # Main application entry point
├── offline.html            # Offline fallback page
├── service-worker.js       # PWA service worker implementation
├── sitemap.xml             # XML sitemap for search engines
├── robots.txt              # Robots crawl instructions
├── assets/
│   ├── css/
│   │   ├── animation-switcher.css   # Theme switching functionality
│   │   ├── audio-visualizer.css     # Audio visualization component styles
│   │   ├── contact-form.css         # Form styling and animations
│   │   ├── cyber-footer.css         # Footer component with glitch effects
│   │   ├── main-styles.css          # Core styling and CSS variables
│   │   ├── music-demos.css          # Music showcase components
│   │   └── sound-buttons.css        # Audio control interface
│   └── js/
│       ├── animation-switcher.js    # Theme switching engine
│       ├── contact-form.js          # Form validation and submission
│       ├── first-input.js           # Input handling and initialization
│       ├── footer-glitch.js         # Footer-specific effects
│       ├── formoid.min.js           # Form utility library
│       ├── glitch-engine.js         # Core visual glitch system
│       ├── meta-data.js             # Dynamic metadata management
│       ├── mono-engine.js           # Monospace text effect system
│       ├── service-worker-registration.js  # PWA registration
│       ├── sound-input.js           # Audio input and processing
│       ├── structured-data.js       # JSON-LD schema implementation
│       ├── visualizer-engine.js     # Audio visualization rendering
│       └── wallpaper-engine.js      # Background effects
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

### Service Worker Caching Strategy

The service worker implements a sophisticated multi-tiered caching approach:

```javascript
// Network-first with timeout fallback
function networkFirstWithTimeout(request, timeoutMs) {
  return new Promise(resolve => {
    // Set timeout for network request
    const timeoutId = setTimeout(() => {
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          resolve(cachedResponse);
        }
      });
    }, timeoutMs);
    
    // Attempt network request
    fetch(request)
      .then(response => {
        clearTimeout(timeoutId);
        const responseToCache = response.clone();
        caches.open(API_CACHE_NAME).then(cache => {
          cache.put(request, responseToCache);
        });
        resolve(response);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        // Fallback to cache on network failure
        // ...error handling
      });
  });
}
```

### Content Security Policy

The site implements a strict CSP that:
- Restricts script execution to specific domains
- Limits style sources to prevent CSS-based attacks
- Controls frame sources to prevent clickjacking
- Restricts media sources to trusted domains

## Browser Compatibility

- **Desktop Browsers**:
  - Chrome/Edge 90+
  - Firefox 88+
  - Safari 14+

- **Mobile Browsers**:
  - iOS Safari 14+
  - Android Chrome 90+
  - Samsung Internet 14+

## Development and Deployment

### Development Environment

1. Clone repository
2. Serve via local development server (e.g., UniServerZ)
3. Test with various browser DevTools (Device Mode, Lighthouse, etc.)

### Production Deployment

1. Implement asset minification and bundling
2. Enable HTTP/2 for parallel asset loading
3. Configure proper MIME types and caching headers
4. Enable HTTPS with TLS 1.3
5. Register service worker for PWA functionality

## License

All rights reserved. The code, design, and content are proprietary to BitKill.

## Technical Contact

For website technical issues: bitkill@ipv7.pt
