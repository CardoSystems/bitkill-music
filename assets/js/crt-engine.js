
class AdvancedCRTInjector {
    constructor(options = {}) {
        this.settings = this.mergeDefaults(options);
        
        // Core state management
        this.isActive = false;
        this.overlayElement = null;
        this.styleElement = null;
        this.performanceMonitor = null;
        this.autoRandomizeTimer = null;
        this.batteryInfo = null;
        
        // Performance tracking
        this.frameCount = 0;
        this.averageFPS = 60;
        this.lastFrameTime = performance.now();
        
        // Initialize system
        this.detectEnvironment();
        this.initialize();
    }

    mergeDefaults(userOptions) {
        // Smart randomization system - creates unique experiences on each load
        const shouldRandomize = userOptions.randomizeOnLoad !== false;
        const randomIntensity = userOptions.randomIntensity || 'medium';
        
        // Intensity multipliers for randomization
        const intensityMultipliers = {
            'low': 0.3,
            'medium': 0.6, 
            'high': 0.9,
            'extreme': 1.2
        };
        
        const multiplier = intensityMultipliers[randomIntensity] || 0.6;
        
        // Generate random values if randomization is enabled
        const randomSeed = Math.random();
        const randomMode = Math.floor(Math.random() * 4);
        const modes = ['tv', 'monitor', 'oscilloscope', 'terminal'];
        const colors = ['green', 'amber', 'white', 'blue', 'red'];
        
        const defaults = {
            // Core randomization settings
            randomizeOnLoad: shouldRandomize,
            randomIntensity: randomIntensity,
            preserveUserSettings: userOptions.preserveUserSettings !== undefined ? userOptions.preserveUserSettings : true,
            autoRandomizeInterval: userOptions.autoRandomizeInterval || 0, // 0 = disabled
            
            // Display configuration (randomized if enabled)
            mode: userOptions.mode || (shouldRandomize ? modes[randomMode] : 'monitor'),
            targetElement: userOptions.targetElement || (typeof document !== 'undefined' ? document.body : null),
            
            // Noise settings
            enableNoise: userOptions.enableNoise !== undefined ? userOptions.enableNoise : true,
            noiseIntensity: userOptions.noiseIntensity || (shouldRandomize ? 
                Math.max(0.05, Math.min(0.4, 0.15 + (randomSeed - 0.5) * multiplier)) : 0.15),
            noiseSpeed: userOptions.noiseSpeed || (shouldRandomize ? 
                Math.max(0.5, Math.min(5, 2 + (randomSeed - 0.5) * multiplier * 3)) : 2),
            noiseScale: userOptions.noiseScale || (shouldRandomize ? 
                Math.max(40, Math.min(150, 80 + (randomSeed - 0.5) * multiplier * 60)) : 80),
            
            // Scanline settings
            enableScanlines: userOptions.enableScanlines !== undefined ? userOptions.enableScanlines : true,
            scanlineHeight: userOptions.scanlineHeight || (shouldRandomize ? 
                Math.max(1, Math.min(8, 2 + Math.floor((randomSeed - 0.5) * multiplier * 4))) : 2),
            scanlineOpacity: userOptions.scanlineOpacity || (shouldRandomize ? 
                Math.max(0.02, Math.min(0.3, 0.1 + (randomSeed - 0.5) * multiplier * 0.2)) : 0.1),
            scanlineFlicker: userOptions.scanlineFlicker !== undefined ? userOptions.scanlineFlicker : 
                (shouldRandomize ? randomSeed > 0.3 : false),
            
            // Phosphor effects
            enablePhosphor: userOptions.enablePhosphor !== undefined ? userOptions.enablePhosphor : true,
            phosphorColor: userOptions.phosphorColor || (shouldRandomize ? 
                colors[Math.floor(randomSeed * colors.length)] : 'green'),
            phosphorIntensity: userOptions.phosphorIntensity || (shouldRandomize ? 
                Math.max(0.1, Math.min(0.8, 0.3 + (randomSeed - 0.5) * multiplier)) : 0.3),
            phosphorDecay: userOptions.phosphorDecay !== undefined ? userOptions.phosphorDecay : true,
            phosphorDecayTime: userOptions.phosphorDecayTime || (shouldRandomize ? 
                Math.max(0.5, Math.min(3, 1.5 + (randomSeed - 0.5) * multiplier * 2)) : 1.5),
            
            // Visual effects
            enableFlicker: userOptions.enableFlicker !== undefined ? userOptions.enableFlicker : 
                (shouldRandomize ? randomSeed > 0.4 : false),
            enableChromatic: userOptions.enableChromatic !== undefined ? userOptions.enableChromatic : 
                (shouldRandomize ? randomSeed > 0.5 : false),
            enableCurvature: userOptions.enableCurvature !== undefined ? userOptions.enableCurvature : 
                (shouldRandomize ? randomSeed > 0.6 : false),
            enableVignette: userOptions.enableVignette !== undefined ? userOptions.enableVignette : 
                (shouldRandomize ? randomSeed > 0.3 : false),
            enableInterference: userOptions.enableInterference !== undefined ? userOptions.enableInterference : 
                (shouldRandomize ? randomSeed > 0.7 : false),
            
            // Performance settings
            qualityMode: userOptions.qualityMode || 'auto',
            batteryAware: userOptions.batteryAware !== undefined ? userOptions.batteryAware : true,
            targetFPS: userOptions.targetFPS || 60,
            reducedMotion: userOptions.reducedMotion !== undefined ? userOptions.reducedMotion : 
                (typeof window !== 'undefined' && window.matchMedia ? 
                 window.matchMedia('(prefers-reduced-motion: reduce)').matches : false),
            
            // Advanced settings
            glowIntensity: userOptions.glowIntensity || (shouldRandomize ? 
                Math.max(0.1, Math.min(0.6, 0.3 + (randomSeed - 0.5) * multiplier * 0.4)) : 0.3),
            chromaticAmount: userOptions.chromaticAmount || (shouldRandomize ? 
                Math.max(1, Math.min(6, 3 + (randomSeed - 0.5) * multiplier * 4)) : 3),
            curvatureAmount: userOptions.curvatureAmount || (shouldRandomize ? 
                Math.max(0.02, Math.min(0.15, 0.08 + (randomSeed - 0.5) * multiplier * 0.1)) : 0.08)
        };
        
        return defaults;
    }

    async detectEnvironment() {
        // Skip browser-specific detection in server environments
        if (typeof window === 'undefined') {
            this.deviceInfo = {
                isMobile: false,
                isLowEnd: false,
                supportsWebGL: false,
                prefersReducedMotion: false
            };
            return;
        }
        
        // Battery API detection
        try {
            if ('getBattery' in navigator) {
                this.batteryInfo = await navigator.getBattery();
                this.monitorBattery();
            }
        } catch (error) {
            console.log('Battery API not available');
        }
        
        // Device capabilities detection
        this.deviceInfo = {
            isMobile: typeof navigator !== 'undefined' ? 
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) : false,
            isLowEnd: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency <= 2 : false,
            supportsWebGL: typeof document !== 'undefined' ? 
                !!document.createElement('canvas').getContext('webgl') : false,
            prefersReducedMotion: typeof window !== 'undefined' && window.matchMedia ? 
                window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
        };
        
        // Adjust settings based on environment
        this.optimizeForEnvironment();
    }

    optimizeForEnvironment() {
        if (this.deviceInfo.isMobile || this.deviceInfo.isLowEnd) {
            this.settings.targetFPS = Math.min(this.settings.targetFPS, 30);
            this.settings.noiseScale = Math.max(this.settings.noiseScale * 0.7, 40);
        }
        
        if (this.deviceInfo.prefersReducedMotion) {
            this.settings.enableFlicker = false;
            this.settings.scanlineFlicker = false;
            this.settings.enableInterference = false;
        }
        
        if (this.batteryInfo && this.batteryInfo.level < 0.2) {
            this.enablePowerSaveMode();
        }
    }

    enablePowerSaveMode() {
        this.settings.targetFPS = 15;
        this.settings.enableFlicker = false;
        this.settings.enableInterference = false;
        this.settings.noiseIntensity *= 0.5;
        this.settings.qualityMode = 'low';
    }

    initialize() {
        // Skip DOM operations in server environments
        if (typeof document === 'undefined') {
            this.isActive = true;
            return;
        }
        
        this.createStyles();
        this.createOverlay();
        this.applyEffects();
        this.startPerformanceMonitoring();
        
        // Start auto-randomization if enabled
        if (this.settings.autoRandomizeInterval > 0) {
            this.startAutoRandomize(this.settings.autoRandomizeInterval, this.settings.randomIntensity);
        }
        
        this.isActive = true;
    }

    createStyles() {
        // Skip DOM operations in server environments
        if (typeof document === 'undefined') return;
        
        if (this.styleElement) {
            this.styleElement.remove();
        }
        
        this.styleElement = document.createElement('style');
        this.styleElement.id = 'crt-injector-styles';
        
        const phosphorColors = {
            green: '#00ff00',
            amber: '#ffaa00', 
            white: '#ffffff',
            blue: '#0088ff',
            red: '#ff4444'
        };
        
        const phosphorColor = phosphorColors[this.settings.phosphorColor] || phosphorColors.green;
        
        this.styleElement.textContent = `
            .crt-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                pointer-events: none;
                z-index: 999999;
                opacity: ${this.settings.noiseIntensity};
                mix-blend-mode: screen;
                background-image: url("data:image/svg+xml,${this.generateNoiseSVG()}");
                background-size: ${this.settings.noiseScale}px ${this.settings.noiseScale}px;
                animation: crt-noise ${this.settings.noiseSpeed}s infinite linear;
            }
            
            @keyframes crt-noise {
                0% { transform: translateX(0) translateY(0); }
                10% { transform: translateX(-5%) translateY(2%); }
                20% { transform: translateX(-10%) translateY(5%); }
                30% { transform: translateX(-15%) translateY(-1%); }
                40% { transform: translateX(-20%) translateY(3%); }
                50% { transform: translateX(-25%) translateY(0); }
                60% { transform: translateX(-30%) translateY(2%); }
                70% { transform: translateX(-35%) translateY(-2%); }
                80% { transform: translateX(-40%) translateY(1%); }
                90% { transform: translateX(-45%) translateY(-1%); }
                100% { transform: translateX(-50%) translateY(0); }
            }
            
            .crt-target {
                position: relative;
            }
            
            .crt-target::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
                z-index: 1000;
                background: linear-gradient(
                    transparent 50%,
                    rgba(0, 0, 0, ${this.settings.scanlineOpacity}) 50%
                );
                background-size: 100% ${this.settings.scanlineHeight}px;
                ${this.settings.scanlineFlicker ? 'animation: crt-scanlines 0.1s infinite linear;' : ''}
            }
            
            ${this.settings.enablePhosphor ? `
            .crt-target::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                pointer-events: none;
                z-index: 999;
                box-shadow: 
                    inset 0 0 20px ${phosphorColor}33,
                    inset 0 0 40px ${phosphorColor}22,
                    0 0 10px ${phosphorColor}44;
                ${this.settings.enableFlicker ? 'animation: crt-glow 0.16s infinite ease-in-out alternate;' : ''}
            }` : ''}
            
            ${this.settings.enableCurvature ? `
            .crt-target {
                transform: perspective(1000px) rotateX(${this.settings.curvatureAmount * 100}deg);
                border-radius: 20px;
                overflow: hidden;
            }` : ''}
            
            ${this.settings.enableChromatic ? `
            .crt-target {
                filter: 
                    drop-shadow(${this.settings.chromaticAmount}px 0 #ff0000) 
                    drop-shadow(-${this.settings.chromaticAmount}px 0 #00ffff);
            }` : ''}
            
            ${this.settings.enableVignette ? `
            .crt-target {
                box-shadow: inset 0 0 100px rgba(0,0,0,0.5);
            }` : ''}
            
            @keyframes crt-scanlines {
                0% { background-position: 0 0; }
                100% { background-position: 0 ${this.settings.scanlineHeight}px; }
            }
            
            @keyframes crt-glow {
                0% { 
                    box-shadow: 
                        inset 0 0 20px ${phosphorColor}33,
                        inset 0 0 40px ${phosphorColor}22,
                        0 0 10px ${phosphorColor}44;
                }
                100% { 
                    box-shadow: 
                        inset 0 0 30px ${phosphorColor}55,
                        inset 0 0 60px ${phosphorColor}33,
                        0 0 20px ${phosphorColor}66;
                }
            }
            
            ${this.settings.enableInterference ? `
            @keyframes crt-interference {
                0%, 90%, 100% { opacity: 1; }
                92% { opacity: 0.8; transform: skewX(2deg); }
                94% { opacity: 0.9; transform: skewX(-1deg); }
                96% { opacity: 0.7; transform: skewX(1deg); }
            }
            
            .crt-target {
                animation: crt-interference 3s infinite;
            }` : ''}
        `;
        
        document.head.appendChild(this.styleElement);
    }

    generateNoiseSVG() {
        const scale = Math.max(0.01, Math.min(0.1, this.settings.noiseScale / 1000));
        const octaves = Math.max(1, Math.min(4, Math.floor(this.settings.noiseIntensity * 4)));
        
        return encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
                <defs>
                    <filter id="noise">
                        <feTurbulence type="fractalNoise" 
                                    baseFrequency="${scale}" 
                                    numOctaves="${octaves}" 
                                    seed="${Math.floor(Math.random() * 1000)}"
                                    stitchTiles="stitch"/>
                        <feColorMatrix type="saturate" values="0"/>
                        <feComponentTransfer>
                            <feFuncA type="discrete" tableValues="0 0.1 0.2 0.3 0.4 0.5"/>
                        </feComponentTransfer>
                    </filter>
                </defs>
                <rect width="100%" height="100%" filter="url(#noise)" opacity="${this.settings.noiseIntensity}"/>
            </svg>
        `);
    }

    createOverlay() {
        // Skip DOM operations in server environments
        if (typeof document === 'undefined') return;
        
        if (this.overlayElement) {
            this.overlayElement.remove();
        }
        
        if (this.settings.enableNoise) {
            this.overlayElement = document.createElement('div');
            this.overlayElement.className = 'crt-overlay';
            document.body.appendChild(this.overlayElement);
        }
    }

    applyEffects() {
        // Skip DOM operations in server environments
        if (typeof document === 'undefined' || !this.settings.targetElement) return;
        
        this.settings.targetElement.classList.add('crt-target');
    }

    startPerformanceMonitoring() {
        // Skip performance monitoring in server environments
        if (typeof performance === 'undefined' || typeof requestAnimationFrame === 'undefined') return;
        
        let frameCount = 0;
        let lastTime = performance.now();
        
        const monitor = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                this.averageFPS = frameCount;
                frameCount = 0;
                lastTime = currentTime;
                
                // Auto-adjust quality based on performance
                if (this.settings.qualityMode === 'auto') {
                    this.adjustQualityBasedOnPerformance();
                }
            }
            
            if (this.isActive) {
                requestAnimationFrame(monitor);
            }
        };
        
        monitor();
    }

    adjustQualityBasedOnPerformance() {
        const targetFPS = this.settings.targetFPS;
        
        if (this.averageFPS < targetFPS * 0.7) {
            // Performance is poor, reduce quality
            this.settings.noiseIntensity *= 0.8;
            this.settings.targetFPS = Math.max(15, this.settings.targetFPS - 5);
            this.updateEffects();
        } else if (this.averageFPS > targetFPS * 1.2 && this.settings.noiseIntensity < 0.4) {
            // Performance is good, can increase quality
            this.settings.noiseIntensity = Math.min(0.4, this.settings.noiseIntensity * 1.1);
            this.updateEffects();
        }
    }

    monitorBattery() {
        if (!this.batteryInfo) return;
        
        this.batteryInfo.addEventListener('levelchange', () => {
            if (this.batteryInfo.level < 0.2 && this.settings.batteryAware) {
                this.enablePowerSaveMode();
                this.updateEffects();
            }
        });
    }

    updateEffects() {
        this.createStyles();
        this.createOverlay();
    }

    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
        this.updateEffects();
    }

    // 🎲 RANDOMIZATION SYSTEM
    randomizeSettings(intensity = 'medium') {
        const multipliers = { low: 0.3, medium: 0.6, high: 0.9, extreme: 1.2 };
        const multiplier = multipliers[intensity] || 0.6;
        
        const randomSeed = Math.random();
        const modes = ['tv', 'monitor', 'oscilloscope', 'terminal'];
        const colors = ['green', 'amber', 'white', 'blue', 'red'];
        
        const randomizedSettings = {
            mode: modes[Math.floor(Math.random() * modes.length)],
            noiseIntensity: Math.max(0.05, Math.min(0.4, 0.15 + (randomSeed - 0.5) * multiplier)),
            noiseSpeed: Math.max(0.5, Math.min(5, 2 + (randomSeed - 0.5) * multiplier * 3)),
            noiseScale: Math.max(40, Math.min(150, 80 + (randomSeed - 0.5) * multiplier * 60)),
            scanlineHeight: Math.max(1, Math.min(8, 2 + Math.floor((randomSeed - 0.5) * multiplier * 4))),
            scanlineOpacity: Math.max(0.02, Math.min(0.3, 0.1 + (randomSeed - 0.5) * multiplier * 0.2)),
            phosphorColor: colors[Math.floor(randomSeed * colors.length)],
            phosphorIntensity: Math.max(0.1, Math.min(0.8, 0.3 + (randomSeed - 0.5) * multiplier)),
            glowIntensity: Math.max(0.1, Math.min(0.6, 0.3 + (randomSeed - 0.5) * multiplier * 0.4)),
            enableFlicker: Math.random() > 0.4,
            enableChromatic: Math.random() > 0.5,
            enableCurvature: Math.random() > 0.6,
            enableVignette: Math.random() > 0.3,
            enableInterference: Math.random() > 0.7,
            scanlineFlicker: Math.random() > 0.3
        };
        
        // Preserve user settings if enabled
        if (this.settings.preserveUserSettings) {
            // Only randomize non-explicitly-set values
            Object.keys(randomizedSettings).forEach(key => {
                if (this.originalUserOptions && this.originalUserOptions.hasOwnProperty(key)) {
                    delete randomizedSettings[key];
                }
            });
        }
        
        this.updateSettings(randomizedSettings);
        return randomizedSettings;
    }

    randomizeVisuals() {
        const colors = ['green', 'amber', 'white', 'blue', 'red'];
        const visualSettings = {
            phosphorColor: colors[Math.floor(Math.random() * colors.length)],
            noiseIntensity: Math.max(0.05, Math.min(0.4, Math.random() * 0.35 + 0.05)),
            glowIntensity: Math.max(0.1, Math.min(0.6, Math.random() * 0.5 + 0.1)),
            enableVignette: Math.random() > 0.5,
            enableChromatic: Math.random() > 0.5
        };
        
        this.updateSettings(visualSettings);
        return visualSettings;
    }

    randomizePerformance() {
        const performanceSettings = {
            targetFPS: [15, 30, 60, 120][Math.floor(Math.random() * 4)],
            noiseScale: Math.max(40, Math.min(150, Math.random() * 110 + 40)),
            qualityMode: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
        };
        
        this.updateSettings(performanceSettings);
        return performanceSettings;
    }

    randomizeAnimations() {
        const animationSettings = {
            noiseSpeed: Math.max(0.5, Math.min(5, Math.random() * 4.5 + 0.5)),
            enableFlicker: Math.random() > 0.3,
            scanlineFlicker: Math.random() > 0.4,
            enableInterference: Math.random() > 0.6,
            phosphorDecayTime: Math.max(0.5, Math.min(3, Math.random() * 2.5 + 0.5))
        };
        
        this.updateSettings(animationSettings);
        return animationSettings;
    }

    randomizeWithIntensity(intensity) {
        return this.randomizeSettings(intensity);
    }

    startAutoRandomize(intervalMs = 30000, intensity = 'medium') {
        this.stopAutoRandomize(); // Clear any existing timer
        
        this.autoRandomizeTimer = setInterval(() => {
            this.randomizeSettings(intensity);
        }, intervalMs);
        
        return this.autoRandomizeTimer;
    }

    stopAutoRandomize() {
        if (this.autoRandomizeTimer) {
            clearInterval(this.autoRandomizeTimer);
            this.autoRandomizeTimer = null;
        }
    }

    // Utility methods
    resetToDefaults() {
        const defaultSettings = this.mergeDefaults({});
        this.updateSettings(defaultSettings);
    }

    destroy() {
        this.stopAutoRandomize();
        
        if (this.styleElement) {
            this.styleElement.remove();
        }
        
        if (this.overlayElement) {
            this.overlayElement.remove();
        }
        
        this.settings.targetElement.classList.remove('crt-target');
        this.isActive = false;
    }

    // Event system for advanced usage
    on(event, callback) {
        if (!this.eventListeners) {
            this.eventListeners = {};
        }
        
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        
        this.eventListeners[event].push(callback);
    }

    emit(event, data) {
        if (this.eventListeners && this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(data));
        }
    }

    // Getters for current state
    get currentSettings() {
        return { ...this.settings };
    }

    get performanceInfo() {
        return {
            averageFPS: this.averageFPS,
            isLowPerformance: this.averageFPS < this.settings.targetFPS * 0.7,
            batteryLevel: this.batteryInfo ? this.batteryInfo.level : null,
            deviceInfo: this.deviceInfo
        };
    }
}

// Backward compatibility
class CRTNoiseInjector extends AdvancedCRTInjector {
    constructor(options = {}) {
        super(options);
        console.warn('CRTNoiseInjector is deprecated. Use AdvancedCRTInjector instead.');
    }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdvancedCRTInjector, CRTNoiseInjector };
} else if (typeof define === 'function' && define.amd) {
    define(() => ({ AdvancedCRTInjector, CRTNoiseInjector }));
} else {
    window.AdvancedCRTInjector = AdvancedCRTInjector;
    window.CRTNoiseInjector = CRTNoiseInjector;
}
