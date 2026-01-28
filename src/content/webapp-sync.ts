// WebApp Sync Content Script - Syncs authentication between web app and extension
// This runs on the Recollect web app domain (recollectai.app) to sync tokens

console.log('[Recollect Extension] WebApp sync script loaded on:', window.location.href);

let lastToken: string | null = null;

// Function to sync token from web app to extension
function syncTokenToExtension() {
  // Check if extension context is still valid
  if (!chrome || !chrome.runtime || !chrome.runtime.id) {
    console.log('[Recollect Extension] Extension context invalidated - page needs refresh to reconnect');
    return;
  }

  try {
    // Get token from localStorage (where the web app stores it)
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');

    // Always sync on first load or if token changed
    // We removed the 'lastToken' check for the initial sync to ensure consistency

    console.log('[Recollect Extension] Syncing token...', {
      tokenExists: !!token,
      lastTokenExists: !!lastToken
    });

    lastToken = token;

    // Send message to background script to update storage
    chrome.runtime.sendMessage({
      action: 'updateToken',
      token: token || null
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('[Recollect Extension] Error sending token update:', chrome.runtime.lastError.message);
        // If we get "Extension context invalidated", we should stop trying
        if (chrome.runtime.lastError.message?.includes('invalidated')) {
          console.error('[Recollect Extension] CRITICAL: Extension reloaded. Please refresh this page.');
        }
        return;
      }
      if (token) {
        console.log('[Recollect Extension] ✅ Token synced to extension storage via background');
      } else {
        console.log('[Recollect Extension] ✅ Token removed from extension storage via background');
      }
    });
  } catch (error) {
    console.log('[Recollect Extension] Error in syncTokenToExtension:', error);
  }
}

// Sync token immediately when script loads
try {
  console.log('[Recollect Extension] Initial sync...');
  syncTokenToExtension();
} catch (error) {
  console.log('[Recollect Extension] Error during initial sync:', error);
}

// Watch for changes to localStorage (Note: storage event only fires for OTHER windows/tabs)
window.addEventListener('storage', (e) => {
  try {
    console.log('[Recollect Extension] Storage event fired:', e.key);
    if (e.key === 'token' || e.key === 'access_token') {
      console.log('[Recollect Extension] Token changed in localStorage (from another tab), syncing...');
      syncTokenToExtension();
    }
  } catch (error) {
    console.log('[Recollect Extension] Error in storage event handler:', error);
  }
});

// Check frequently in case storage event doesn't fire (for same-window changes)
console.log('[Recollect Extension] Starting periodic sync (every 1 second)');
const syncInterval = setInterval(() => {
  try {
    syncTokenToExtension();
  } catch (error) {
    // Silently ignore errors in interval
  }
}, 1000);

// Listen for messages from the web app (this is the primary method for same-window updates)
window.addEventListener('message', (event) => {
  try {
    // Only accept messages from our own domain
    if (event.origin !== window.location.origin) {
      return;
    }

    console.log('[Recollect Extension] Message received:', event.data);

    if (event.data.type === 'RECOLLECT_TOKEN_UPDATE') {
      console.log('[Recollect Extension] Token update message received, syncing immediately...');

      // Check if extension context is still valid
      if (!chrome || !chrome.runtime) {
        console.log('[Recollect Extension] Extension context invalidated - cannot sync');
        return;
      }

      // Use token from message if provided, otherwise read from localStorage
      const token = event.data.token !== undefined
        ? event.data.token
        : (localStorage.getItem('token') || localStorage.getItem('access_token'));

      console.log('[Recollect Extension] Syncing token from message:', {
        tokenFromMessage: event.data.token !== undefined ? 'YES' : 'NO',
        tokenValue: token ? token.substring(0, 20) + '...' : 'null'
      });

      lastToken = token;

      // Send to background worker
      chrome.runtime.sendMessage({
        action: 'updateToken',
        token: token
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('[Recollect Extension] Error sending token update:', chrome.runtime.lastError.message);
          return;
        }
        if (token) {
          console.log('[Recollect Extension] ✅ Token synced to extension storage via background');
        } else {
          console.log('[Recollect Extension] ✅ Token removed from extension storage via background');
        }
      });
    }
  } catch (error) {
    console.log('[Recollect Extension] Error in message event handler:', error);
  }
});

// Also watch for URL changes (SPA navigation)
let lastPath = window.location.pathname;
const navInterval = setInterval(() => {
  try {
    if (window.location.pathname !== lastPath) {
      console.log('[Recollect Extension] Navigation detected:', lastPath, '->', window.location.pathname);
      lastPath = window.location.pathname;
      syncTokenToExtension();
    }
  } catch (error) {
    // Silently ignore errors in interval
  }
}, 500);

// Clean up intervals when page unloads
window.addEventListener('beforeunload', () => {
  clearInterval(syncInterval);
  clearInterval(navInterval);
});

export { };
