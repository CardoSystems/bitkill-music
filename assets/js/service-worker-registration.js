// BitKill Advanced Service Worker Registration
// Handles offline functionality, updates, and user notifications

// Configuration
const SW_CONFIG = {
  updateInterval: 1000 * 60 * 60, // Check for service worker updates every hour
  showUpdateNotification: true,    // Show notification when updates are available
  offlineIndicatorId: 'offline-indicator', // ID of offline status indicator element (optional)
};

// Initialize the offline mode functionality
function initOfflineMode() {
  // Track offline status
  window.isOffline = !navigator.onLine;
  
  // Create offline indicator if it doesn't exist
  if (SW_CONFIG.offlineIndicatorId && !document.getElementById(SW_CONFIG.offlineIndicatorId)) {
    const indicator = document.createElement('div');
    indicator.id = SW_CONFIG.offlineIndicatorId;
    indicator.className = 'offline-indicator';
    indicator.innerHTML = '<span>OFFLINE MODE</span>';
    indicator.style.display = window.isOffline ? 'block' : 'none';
    document.body.appendChild(indicator);
    
    // Add styles for the offline indicator
    const style = document.createElement('style');
    style.textContent = `
      .offline-indicator {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background-color: rgba(0, 0, 0, 0.8);
        color: #ff0066;
        text-align: center;
        padding: 5px;
        font-family: 'Share Tech Mono', monospace;
        z-index: 9999;
        display: none;
        animation: pulse 2s infinite;
      }
      @keyframes pulse {
        0% { opacity: 0.7; }
        50% { opacity: 1; }
        100% { opacity: 0.7; }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Event listeners for online/offline events
  window.addEventListener('online', handleNetworkChange);
  window.addEventListener('offline', handleNetworkChange);
}

// Handle network status change
function handleNetworkChange() {
  window.isOffline = !navigator.onLine;
  
  // Update offline indicator
  const indicator = document.getElementById(SW_CONFIG.offlineIndicatorId);
  if (indicator) {
    indicator.style.display = window.isOffline ? 'block' : 'none';
  }
  
  // Log status
  console.log(`[BitKill] Network status: ${window.isOffline ? 'Offline' : 'Online'}`);
  
  // Sync data when back online
  if (!window.isOffline && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
    // Tell the service worker to sync data
    navigator.serviceWorker.controller.postMessage({
      type: 'SYNC_DATA'
    });
  }
  
  // Dispatch custom event
  const event = new CustomEvent('networkStatusChange', { 
    detail: { isOffline: window.isOffline } 
  });
  document.dispatchEvent(event);
}

// Register the service worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('[BitKill] ServiceWorker registered with scope:', registration.scope);
        
        // Check for updates on a schedule
        if (SW_CONFIG.updateInterval > 0) {
          setInterval(() => {
            registration.update()
              .then(() => console.log('[BitKill] Checking for ServiceWorker updates...'))
              .catch(error => console.error('[BitKill] ServiceWorker update error:', error));
          }, SW_CONFIG.updateInterval);
        }
        
        // Handle updates
        handleServiceWorkerUpdates(registration);
      })
      .catch(error => {
        console.error('[BitKill] ServiceWorker registration failed:', error);
      });
      
    // Listen for messages from the service worker
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data && event.data.type === 'CACHE_UPDATED') {
        console.log('[BitKill] New content is available; please refresh.');
        
        // Notify user about update if configured
        if (SW_CONFIG.showUpdateNotification) {
          showUpdateNotification();
        }
      }
    });
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
        console.log('[BitKill] New content is available; please refresh.');
        
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
      <p>New version available!</p>
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

// Initialize when the document is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initOfflineMode();
    registerServiceWorker();
  });
} else {
  initOfflineMode();
  registerServiceWorker();
}
