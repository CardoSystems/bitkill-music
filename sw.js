/**
 * BITKILL Music - Modern Service Worker (sw.js)
 * Focus: PWA features, SEO, and modern browser capabilities
 * No offline caching or offline functionality
 * Includes automatic website update detection and refresh
 */

// Service worker version for easy updates
const SW_VERSION = '1.1.0';

// Configuration for the update checker
const UPDATE_CONFIG = {
  checkInterval: 60000, // Check for updates every 60 seconds
  filesToCheck: [
    'index.html',
    'manifest.json',
    'sw.js'
  ],
  lastModified: {} // Store last-modified timestamps
};

// Log when the service worker is starting
console.log(`[Service Worker] Starting version ${SW_VERSION}`);

// Install event - minimal setup without caching
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  
  // Initialize the update checker
  initUpdateChecker();
  
  // Immediately activate this service worker
  self.skipWaiting();
});

// Activate event - take control of clients
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  
  // Take control of all clients as soon as it activates
  event.waitUntil(
    clients.claim().then(() => {
      console.log('[Service Worker] Claimed all clients');
      
      // Optionally notify clients that service worker is active
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            version: SW_VERSION
          });
        });
      });
    })
  );
});

// Fetch event - pass through all requests without caching
self.addEventListener('fetch', event => {
  // For specific files we want to check, add a cache-busting parameter
  // to ensure we always get the latest version
  const url = new URL(event.request.url);
  const isCriticalFile = UPDATE_CONFIG.filesToCheck.some(file => 
    url.pathname.endsWith(file) || url.pathname === '/' || url.pathname === ''
  );
  
  if (isCriticalFile && event.request.method === 'GET') {
    // Add a cache-busting parameter to the URL
    url.searchParams.set('_sw_nocache', Date.now());
    
    // Create a new request with the modified URL
    const noCacheRequest = new Request(url.toString(), {
      method: event.request.method,
      headers: event.request.headers,
      mode: event.request.mode,
      credentials: event.request.credentials,
      redirect: event.request.redirect
    });
    
    // Fetch with the no-cache request
    event.respondWith(
      fetch(noCacheRequest).then(response => {
        // Store last-modified header for update detection
        if (response.headers.has('last-modified')) {
          const filePath = url.pathname;
          const lastModified = response.headers.get('last-modified');
          
          // Check if this is a new version of the file
          if (UPDATE_CONFIG.lastModified[filePath] && 
              UPDATE_CONFIG.lastModified[filePath] !== lastModified) {
            console.log(`[Service Worker] File updated: ${filePath}`);
            notifyClientsOfUpdate(filePath);
          }
          
          // Update the stored last-modified time
          UPDATE_CONFIG.lastModified[filePath] = lastModified;
        }
        
        return response;
      }).catch(error => {
        console.error('[Service Worker] Fetch error:', error);
        // Fall back to normal fetch if our modified request fails
        return fetch(event.request);
      })
    );
  }
  // For all other requests, let the browser handle them normally
});

// Push notification event handler
self.addEventListener('push', event => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New update from BITKILL',
      icon: 'icons/android-chrome-192x192.png',
      badge: 'icons/favicon-32x32.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || './',
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'explore',
          title: 'View Details',
          icon: 'icons/favicon-32x32.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'BITKILL Update', 
        options
      )
    );
  } catch (err) {
    console.error('[Service Worker] Push notification error:', err);
  }
});

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  // Handle notification click - open URL if provided
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.matchAll({type: 'window'}).then(windowClients => {
        // Check if there is already a window/tab open with the target URL
        for (let client of windowClients) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no window/tab is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
    );
  }
});

// Background sync for analytics and forms
self.addEventListener('sync', event => {
  if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics());
  } else if (event.tag === 'form-sync') {
    event.waitUntil(syncForms());
  }
});

// Helper function for syncing analytics data
async function syncAnalytics() {
  try {
    // Logic for syncing analytics would go here
    // This is just a placeholder since we're focusing on PWA features
    console.log('[Service Worker] Syncing analytics data');
  } catch (error) {
    console.error('[Service Worker] Analytics sync failed:', error);
  }
}

// Helper function for syncing form submissions
async function syncForms() {
  try {
    // Logic for syncing form data would go here
    // This is just a placeholder since we're focusing on PWA features
    console.log('[Service Worker] Syncing form data');
  } catch (error) {
    console.error('[Service Worker] Form sync failed:', error);
  }
}

// Listen for messages from clients
self.addEventListener('message', event => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (!event.data) return;
  
  // Handle skip waiting message
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle version check message
  if (event.data.type === 'VERSION_CHECK') {
    event.ports[0].postMessage({
      type: 'VERSION_INFO',
      version: SW_VERSION
    });
  }
  
  // Handle manual update check request
  if (event.data.type === 'CHECK_FOR_UPDATES') {
    checkForUpdates().then(() => {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({
          type: 'UPDATE_CHECK_COMPLETE',
          timestamp: new Date().toISOString()
        });
      }
    });
  }
  
  // Handle force refresh request from the page
  if (event.data.type === 'REQUEST_REFRESH') {
    notifyClientsOfUpdate('/index.html');
  }
  
  // Handle custom PWA events
  if (event.data.type === 'TRACK_PWA_EVENT') {
    console.log('[Service Worker] Tracking PWA event:', event.data.eventName);
    // Here you could implement tracking/analytics code
  }
});

// Periodic background sync if supported (Chrome 80+)
if ('periodicSync' in self.registration) {
  // This would need to be set up by the page, not the service worker directly
  // Just showing capability here
  console.log('[Service Worker] Periodic sync is supported');
}

// Content indexing for better discoverability (Chrome 84+)
if ('index' in self.registration) {
  console.log('[Service Worker] Content indexing is supported');
  // We could add our music content to the index here in a real implementation
}

console.log('[Service Worker] Initialized successfully');

/**
 * Update checker functionality
 */

// Initialize the update checker
function initUpdateChecker() {
  console.log('[Service Worker] Initializing update checker');
  
  // Immediately check for updates
  checkForUpdates();
  
  // Set up periodic update checks
  setInterval(checkForUpdates, UPDATE_CONFIG.checkInterval);
}

// Check for updates to critical files
async function checkForUpdates() {
  console.log('[Service Worker] Checking for website updates...');
  
  try {
    // Check each critical file for changes
    for (const filePath of UPDATE_CONFIG.filesToCheck) {
      const url = new URL(filePath, self.location.origin);
      url.searchParams.set('_sw_check', Date.now()); // Cache-busting parameter
      
      const response = await fetch(url.toString(), { 
        method: 'HEAD',
        cache: 'no-store'
      });
      
      if (response.ok && response.headers.has('last-modified')) {
        const lastModified = response.headers.get('last-modified');
        
        // If we have a previous timestamp and it's different, the file has changed
        if (UPDATE_CONFIG.lastModified[filePath] && 
            UPDATE_CONFIG.lastModified[filePath] !== lastModified) {
          console.log(`[Service Worker] Detected change in: ${filePath}`);
          notifyClientsOfUpdate(filePath);
        }
        
        // Update the stored timestamp
        UPDATE_CONFIG.lastModified[filePath] = lastModified;
      }
    }
  } catch (error) {
    console.error('[Service Worker] Update check failed:', error);
  }
}

// Notify all clients about an update
function notifyClientsOfUpdate(filePath) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'WEBSITE_UPDATED',
        file: filePath,
        timestamp: new Date().toISOString()
      });
      
      // Force refresh the page with a cache-busting parameter
      if (filePath === 'index.html' || filePath === '/' || filePath === '') {
        client.postMessage({
          type: 'FORCE_REFRESH',
          cacheBust: Date.now()
        });
      }
    });
  });
}