// BitKill Music - Advanced Service Worker for Offline Functionality
const CACHE_NAME = 'bitkill-cache-v1';
const MEDIA_CACHE_NAME = 'bitkill-media-cache-v1';
const API_CACHE_NAME = 'bitkill-api-cache-v1';

// Add core files that should be available offline
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/assets/css/main-styles.css',
  '/assets/css/audio-visualizer.css',
  '/assets/css/cyber-footer.css',
  '/assets/css/music-demos.css',
  '/assets/css/sound-buttons.css',
  '/assets/js/first-input.js',
  '/assets/js/footer-glitch.js',
  '/assets/js/glitch-engine.js',
  '/assets/js/visualizer-engine.js',
  '/assets/js/crt-engine.js',
  '/assets/three.js/mono-engine.js',
  '/assets/js/sound-input.js',
  '/assets/js/service-worker-registration.js',
  'assets/npm/aos.css',
  'assets/npm/aos.js',
  'assets/npm/gsap.min.js',
  'assets/npm/ScrollTrigger.min.js',
  'assets/npm/vanilla-tilt.min.js',
  'assets/npm/typed.min.js',
  'assets/three.js/three.min.js',
  'assets/three.js/EffectComposer.min.js',
  'assets/three.js/RenderPass.min.js',
  'assets/three.js/ShaderPass.min.js',
  'assets/three.js/DigitalGlitch.js',
  'assets/three.js/GlitchPass.min.js',
  'https://api.fonts.coollabs.io/css2?family=Share+Tech+Mono&display=swap'
];

// Media files to cache for offline viewing
const MEDIA_ASSETS = [
  '/favicon.ico',
  '/logo.png',
  'https://cdn.xperia.pt/bitkillmusic.com/vod1.mp4',
  'https://cdn.xperia.pt/bitkillmusic.com/vod2.mp4',
  'https://cdn.xperia.pt/bitkillmusic.com/vod3.mp4',
  'https://cdn.xperia.pt/bitkillmusic.com/vod4.mp4',
  'https://cdn.xperia.pt/bitkillmusic.com/vod5.mp4'
];

// Install event - cache core assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  
  // Cache core assets
  const coreCache = caches.open(CACHE_NAME)
    .then(cache => {
      console.log('[Service Worker] Caching core assets');
      return cache.addAll(CORE_ASSETS);
    });
    
  // Cache media assets
  const mediaCache = caches.open(MEDIA_CACHE_NAME)
    .then(cache => {
      console.log('[Service Worker] Caching media assets');
      return cache.addAll(MEDIA_ASSETS);
    });
  
  event.waitUntil(Promise.all([coreCache, mediaCache]));
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete any cache that isn't in our current set
          if (
            cacheName !== CACHE_NAME && 
            cacheName !== MEDIA_CACHE_NAME && 
            cacheName !== API_CACHE_NAME
          ) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming clients...');
      return self.clients.claim();
    })
  );
});

// Helper function to check if a request is for an image/media file
function isMediaRequest(url) {
  const mediaExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.webm', '.mp3', '.wav'];
  return mediaExtensions.some(ext => url.pathname.endsWith(ext));
}

// Helper function to check if a request is for an API
function isAPIRequest(url) {
  return url.hostname.includes('api.') || 
         url.pathname.includes('/api/') ||
         url.hostname.includes('js-cdn.music.apple.com') ||
         url.hostname.includes('embed.music.apple.com');
}

// Fetch event - network-first for APIs, cache-first for assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip some third-party requests we don't want to cache
  if (url.hostname.includes('analytics') || 
      url.hostname.includes('tracker') || 
      url.hostname.includes('googletagmanager')) {
    return;
  }
  
  // Handle API requests (network-first with fallback to cached)
  if (isAPIRequest(url)) {
    event.respondWith(networkFirstWithTimeout(event.request, 3000));
    return;
  }
  
  // Handle media requests (cache-first with background sync)
  if (isMediaRequest(url)) {
    event.respondWith(cacheFirstWithBackgroundUpdate(event.request, MEDIA_CACHE_NAME));
    return;
  }
  
  // Handle all other requests (cache-first with network fallback)
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Return the cached response
          return cachedResponse;
        }
        
        // Not in cache, get from network
        return fetch(event.request)
          .then(response => {
            // Don't cache if response is not valid
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            // Cache the fetched response
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(error => {
            console.error('[Service Worker] Fetch failed:', error);
            
            // If HTML is requested, return offline page
            if (event.request.headers.get('Accept').includes('text/html')) {
              return caches.match('/offline.html')
                .catch(() => {
                  // If offline page is not available, return minimal offline content
                  return new Response(
                    '<html><head><title>BitKill - Offline</title><style>body{font-family:monospace;background:#000;color:#0f0;text-align:center;padding:50px;} h1{text-shadow:0 0 10px #0f0;} .glitch{animation:glitch 1s infinite;}</style></head><body><h1 class="glitch">BITKILL</h1><p>CONNECTION LOST // SYSTEM OFFLINE</p><p>Please check your internet connection.</p></body></html>',
                    { headers: { 'Content-Type': 'text/html' } }
                  );
                });
            }
            
            // For other resources, return a simple error response
            return new Response('Resource unavailable offline', { 
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Network-first strategy with timeout
function networkFirstWithTimeout(request, timeoutMs) {
  return new Promise(resolve => {
    // Set a timeout to reject the network request
    const timeoutId = setTimeout(() => {
      caches.match(request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // Return cached response if available
            console.log('[Service Worker] Network timeout, using cache for:', request.url);
            resolve(cachedResponse);
          }
        });
    }, timeoutMs);
    
    // Try network first
    fetch(request)
      .then(response => {
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);
        
        // Clone the response
        const responseToCache = response.clone();
        
        // Cache the response for future use
        caches.open(API_CACHE_NAME)
          .then(cache => {
            cache.put(request, responseToCache);
          });
          
        resolve(response);
      })
      .catch(error => {
        // Network failed, clear timeout and try cache
        clearTimeout(timeoutId);
        
        caches.match(request)
          .then(cachedResponse => {
            if (cachedResponse) {
              // Return cached response if available
              resolve(cachedResponse);
            } else {
              // Both network and cache failed
              console.error('[Service Worker] Both network and cache failed:', error);
              resolve(new Response('Service unavailable', { status: 503 }));
            }
          });
      });
  });
}

// Cache-first with background update strategy
function cacheFirstWithBackgroundUpdate(request, cacheName) {
  // Try cache first
  return caches.match(request, { cacheName })
    .then(cachedResponse => {
      // Background update
      const fetchPromise = fetch(request)
        .then(networkResponse => {
          // Update cache with new response
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(cacheName)
              .then(cache => {
                cache.put(request, responseToCache);
                console.log('[Service Worker] Updated cache for:', request.url);
              });
          }
          return networkResponse;
        })
        .catch(error => {
          console.log('[Service Worker] Background update failed:', error);
        });
      
      // Start the fetch anyway (don't await it)
      if ('navigator' in self && 'serviceWorker' in navigator) {
        fetchPromise.catch(() => {}); // Silently fail background updates
      }
      
      // Return the cached response if we have it
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // If not cached, wait for the network response
      return fetchPromise;
    });
}

// Listen for messages from the client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
