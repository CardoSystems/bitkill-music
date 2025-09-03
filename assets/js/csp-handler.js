/**
 * BITKILL - Smart Content Security Policy (CSP) Handler
 * Dynamically applies and manages CSP for enhanced security
 */

(function() {
  // Base CSP configuration
  const cspConfig = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'", 
      "'unsafe-inline'", 
      "'unsafe-eval'", 
      "https://cdn.xperia.pt",
      "https://embed.music.apple.com",
      "https://is1-ssl.mzstatic.com",
      "https://api.web3forms.com",
      "https://static.cloudflareinsights.com",
      "https://app.rybbit.io",
      "https://www.google.com",
      "https://stats.g.doubleclick.net",
      "https://challenges.cloudflare.com",
      "https://*.cloudflarechallenge.com",
      "https://cdn-cgi.challenge-platform.cloudflare.com",
      "https://bitkillmusic.com/cdn-cgi/challenge-platform/"
    ],
    'style-src': [
      "'self'", 
      "'unsafe-inline'", 
      "https://api.fonts.coollabs.io",
      "https://cdn.fonts.coollabs.io",
      "https://cdn.xperia.pt"
    ],
    'img-src': [
      "'self'", 
      "https://cdn.xperia.pt",
      "data:"
    ],
    'font-src': [
      "'self'", 
      "https://api.fonts.coollabs.io",
      "https://cdn.fonts.coollabs.io"
    ],
    'frame-src': [
      "https://embed.music.apple.com",
      "https://is1-ssl.mzstatic.com",
      "https://app.rybbit.io",
      "https://challenges.cloudflare.com"
    ],
    'connect-src': [
      "'self'", 
      "https://api.web3forms.com",
      "https://cloudflareinsights.com",
      "https://app.rybbit.io",
      "https://www.google.com",
      "https://stats.g.doubleclick.net",
      "https://www.google-analytics.com",
      "https://challenges.cloudflare.com"
    ],
    'media-src': [
      "'self'", 
      "https://cdn.xperia.pt"
    ]
  };
  
  // Environment-specific configurations
  const envConfigs = {
    development: {
      // Looser CSP for development
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:", "http:"],
      'connect-src': ["'self'", "https:", "http:", "ws:", "wss:"],
      'img-src': ["'self'", "https:", "http:", "data:", "blob:"]
    },
    production: {
      // Production uses the base config, already secure
    }
  };
  
  /**
   * Detect environment
   * @returns {string} 'development' or 'production'
   */
  function detectEnvironment() {
    const host = window.location.hostname;
    return (host === 'localhost' || host === '127.0.0.1' || host.includes('.local')) 
      ? 'development' 
      : 'production';
  }
  
  /**
   * Build CSP string from configuration
   * @param {Object} config - CSP configuration object
   * @returns {string} Complete CSP string
   */
  function buildCspString(config) {
    return Object.entries(config)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');
  }
  
  /**
   * Apply CSP to the document
   * @param {string} cspString - The complete CSP string
   */
  function applyCSP(cspString) {
    // For older browsers that support http-equiv
    const metaTag = document.createElement('meta');
    metaTag.httpEquiv = 'Content-Security-Policy';
    metaTag.content = cspString;
    document.head.appendChild(metaTag);
    
    // Log application of CSP
    console.log('[CSP Handler] Content Security Policy applied');
  }
  
  /**
   * Initialize the CSP
   */
  function initCSP() {
    try {
      // Detect current environment
      const environment = detectEnvironment();
      console.log(`[CSP Handler] Detected environment: ${environment}`);
      
      // Merge base config with environment-specific config
      const envConfig = envConfigs[environment] || {};
      const finalConfig = { ...cspConfig };
      
      // Apply environment overrides
      Object.entries(envConfig).forEach(([directive, sources]) => {
        finalConfig[directive] = sources;
      });
      
      // Build and apply CSP string
      const cspString = buildCspString(finalConfig);
      applyCSP(cspString);
      
      // Store CSP in window for debugging
      window.__cspConfig = finalConfig;
      
    } catch (error) {
      console.error('[CSP Handler] Error applying CSP:', error);
    }
  }

  // Check if document is already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCSP);
  } else {
    initCSP();
  }
  
  // Report CSP violations if supported
  if (window.ReportingObserver) {
    const reportingObserver = new ReportingObserver((reports) => {
      for (const report of reports) {
        if (report.type === 'csp-violation') {
          console.warn('[CSP Handler] CSP Violation:', report.body);
        }
      }
    }, { buffered: true });
    
    reportingObserver.observe();
  }
})();
