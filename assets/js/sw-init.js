/**
 * BITKILL - Modern Service Worker Registration
 * This script handles the registration of the service worker for PWA features
 */

// Configuration
const SW_CONFIG = {
  updateInterval: 1000 * 60 * 60, // Check for service worker updates every hour
  showUpdateNotification: true,   // Show notification when updates are available
  autoRefreshOnUpdate: true,      // Auto refresh the page when website files are updated
};

// Register the service worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    // Register the new service worker (sw.js)
    navigator.serviceWorker.register('sw.js')
      .then(registration => {
        console.log('[BITKILL] Service Worker registered with scope:', registration.scope);
        
        // Check for updates on a schedule
        if (SW_CONFIG.updateInterval > 0) {
          setInterval(() => {
            registration.update()
              .then(() => console.log('[BITKILL] Checking for Service Worker updates...'))
              .catch(error => console.error('[BITKILL] Service Worker update error:', error));
          }, SW_CONFIG.updateInterval);
        }
        
        // Handle updates
        handleServiceWorkerUpdates(registration);
      })
      .catch(error => {
        console.error('[BITKILL] Service Worker registration failed:', error);
      });
      
    // Listen for messages from the service worker
    navigator.serviceWorker.addEventListener('message', event => {
      if (!event.data) return;
      
      // Handle SW activation message
      if (event.data.type === 'SW_ACTIVATED') {
        console.log(`[BITKILL] Service Worker activated (version ${event.data.version})`);
      }
      
      // Handle version info message
      if (event.data.type === 'VERSION_INFO') {
        console.log(`[BITKILL] Service Worker version: ${event.data.version}`);
      }
      
      // Handle website update notification
      if (event.data.type === 'WEBSITE_UPDATED') {
        console.log(`[BITKILL] Website file updated: ${event.data.file} at ${event.data.timestamp}`);
        showWebsiteUpdateNotification(event.data.file);
      }
      
      // Handle force refresh request
      if (event.data.type === 'FORCE_REFRESH' && SW_CONFIG.autoRefreshOnUpdate) {
        console.log('[BITKILL] Force refreshing page due to content update');
        // Add a cache-busting parameter to prevent browser caching
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('_updated', event.data.cacheBust || Date.now());
        window.location.href = currentUrl.toString();
      }
    });
  } else {
    console.log('[BITKILL] Service Workers not supported in this browser');
  }
}

// Handle service worker updates
function handleServiceWorkerUpdates(registration) {
  // When the service worker is updated, show a notification
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;
    
    newWorker.addEventListener('statechange', () => {
      // When the service worker is installed, show a notification
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        console.log('[BITKILL] New content is available; please refresh.');
        
        // Notify user about update if configured
        if (SW_CONFIG.showUpdateNotification) {
          showUpdateNotification();
        }
      }
    });
  });
}

// Show update notification
function showUpdateNotification() {
  // Check if notification exists
  if (document.getElementById('sw-update-notification')) {
    return;
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'sw-update-notification';
  notification.className = 'sw-update-notification';
  notification.innerHTML = `
    <div class="sw-update-content">
      <p>NEW VERSION AVAILABLE</p>
      <div class="sw-update-buttons">
        <button id="sw-update-refresh">UPDATE</button>
        <button id="sw-update-dismiss">LATER</button>
      </div>
    </div>
  `;
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .sw-update-notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: rgba(0, 0, 0, 0.9);
      color: #00ff99;
      border: 1px solid #00ff99;
      font-family: 'Share Tech Mono', monospace;
      padding: 10px;
      z-index: 10000;
      animation: slideIn 0.3s forwards;
      box-shadow: 0 0 10px rgba(0, 255, 153, 0.5);
    }
    .sw-update-content {
      text-align: center;
    }
    .sw-update-buttons {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
    }
    .sw-update-buttons button {
      background-color: transparent;
      color: #00ff99;
      border: 1px solid #00ff99;
      padding: 5px 15px;
      cursor: pointer;
      font-family: 'Share Tech Mono', monospace;
      transition: all 0.3s;
    }
    .sw-update-buttons button:hover {
      background-color: #00ff99;
      color: #000;
    }
    @keyframes slideIn {
      from { transform: translateY(100px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  // Add to DOM
  document.body.appendChild(notification);
  
  // Add event listeners
  document.getElementById('sw-update-refresh').addEventListener('click', () => {
    // Reload the page to activate the new service worker
    window.location.reload();
  });
  
  document.getElementById('sw-update-dismiss').addEventListener('click', () => {
    // Remove the notification
    notification.remove();
  });
}

// Show website update notification
function showWebsiteUpdateNotification(filePath) {
  // Only show notification if auto-refresh is disabled
  if (SW_CONFIG.autoRefreshOnUpdate) {
    return; // No need for notification if we're auto-refreshing
  }
  
  // Check if notification exists
  if (document.getElementById('website-update-notification')) {
    return;
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'website-update-notification';
  notification.className = 'sw-update-notification';
  notification.innerHTML = `
    <div class="sw-update-content">
      <p>WEBSITE UPDATED</p>
      <p class="update-details">New content is available</p>
      <div class="sw-update-buttons">
        <button id="website-update-refresh">RELOAD NOW</button>
        <button id="website-update-dismiss">LATER</button>
      </div>
    </div>
  `;
  
  // Add styles if not already added
  if (!document.getElementById('sw-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'sw-notification-styles';
    style.textContent = `
      .sw-update-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: rgba(0, 0, 0, 0.9);
        color: #00ff99;
        border: 1px solid #00ff99;
        font-family: 'Share Tech Mono', monospace;
        padding: 10px;
        z-index: 10000;
        animation: slideIn 0.3s forwards;
        box-shadow: 0 0 10px rgba(0, 255, 153, 0.5);
      }
      .sw-update-content {
        text-align: center;
      }
      .update-details {
        font-size: 0.8em;
        margin: 5px 0;
        opacity: 0.8;
      }
      .sw-update-buttons {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
      }
      .sw-update-buttons button {
        background-color: transparent;
        color: #00ff99;
        border: 1px solid #00ff99;
        padding: 5px 15px;
        cursor: pointer;
        font-family: 'Share Tech Mono', monospace;
        transition: all 0.3s;
      }
      .sw-update-buttons button:hover {
        background-color: #00ff99;
        color: #000;
      }
      @keyframes slideIn {
        from { transform: translateY(100px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Add to DOM
  document.body.appendChild(notification);
  
  // Add event listeners
  document.getElementById('website-update-refresh').addEventListener('click', () => {
    // Reload the page with a cache-busting parameter
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('_updated', Date.now());
    window.location.href = currentUrl.toString();
  });
  
  document.getElementById('website-update-dismiss').addEventListener('click', () => {
    // Remove the notification
    notification.remove();
  });
  
  // Auto-dismiss after 30 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 30000);
}

// Register Web App Manifest for PWA
function registerWebAppManifest() {
  // Check if the browser supports manifest
  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (!manifestLink) {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/manifest.json';
    document.head.appendChild(link);
  }
}

// Set up PWA installation prompt
function setupInstallPrompt() {
  // Store the install prompt event for later use
  let deferredPrompt;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    
    // Store the event so it can be triggered later
    deferredPrompt = e;
    
    // Optionally, show your own install button
    console.log('[BITKILL] App can be installed');
  });
  
  // Handle app installed event
  window.addEventListener('appinstalled', (evt) => {
    console.log('[BITKILL] Application was installed successfully');
    
    // Track the PWA installation
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'TRACK_PWA_EVENT',
        eventName: 'app_installed'
      });
    }
  });
}

// Initialize when the document is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    registerServiceWorker();
    registerWebAppManifest();
    setupInstallPrompt();
  });
} else {
  registerServiceWorker();
  registerWebAppManifest();
  setupInstallPrompt();
}

// Function to manually check for website updates
function checkForWebsiteUpdates() {
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    console.log('[BITKILL] Manually checking for website updates...');
    
    // Create a message channel for the response
    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = event => {
      if (event.data && event.data.type === 'UPDATE_CHECK_COMPLETE') {
        console.log('[BITKILL] Manual update check completed at:', event.data.timestamp);
      }
    };
    
    // Send check request to service worker
    navigator.serviceWorker.controller.postMessage({
      type: 'CHECK_FOR_UPDATES'
    }, [messageChannel.port2]);
    
    return true;
  } else {
    console.warn('[BITKILL] Cannot check for updates - service worker not active');
    return false;
  }
}

// Expose the update checker to the global scope
window.bitkillCheckForUpdates = checkForWebsiteUpdates;