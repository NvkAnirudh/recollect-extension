// Background Service Worker - Handles cross-tab communication

console.log('[Recollect] Background service worker started');

const API_ENDPOINT = 'https://video-ingest.up.railway.app/api/contents/submit';
const VALIDATE_TOKEN_ENDPOINT = 'https://auth-production-a.up.railway.app/auth/validate-token';

// Extension installed handler
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Recollect] Extension installed');
});

// Validate token with backend
async function validateToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(VALIDATE_TOKEN_ENDPOINT, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401 || response.status === 403) {
      console.log('[Recollect] Token validation failed: Unauthorized');
      return false;
    }

    if (!response.ok) {
      console.log('[Recollect] Token validation failed: Network error');
      return false;
    }

    const data = await response.json();
    console.log('[Recollect] Token validation successful');
    return data.valid === true;
  } catch (error) {
    console.error('[Recollect] Token validation error:', error);
    return false;
  }
}

// Fetch user's saved content
async function fetchUserContent(): Promise<any> {
  const { token } = await chrome.storage.local.get('token');

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch('https://video-ingest.up.railway.app/api/contents', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      await chrome.storage.local.remove('token');
      throw new Error('Authentication expired');
    }
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Failed to fetch content');
  }

  const data = await response.json();
  return data;
}

// Fetch summary of user's content by platform
async function fetchContentSummary(): Promise<any> {
  const { token } = await chrome.storage.local.get('token');

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch('https://video-ingest.up.railway.app/api/contents-summary', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      await chrome.storage.local.remove('token');
      throw new Error('Authentication expired');
    }
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Failed to fetch summary');
  }

  const data = await response.json();
  return data;
}

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveVideo') {
    handleSaveVideo(request.url, sender.tab?.id)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));

    // Return true to indicate we'll respond asynchronously
    return true;
  }

  if (request.action === 'fetchContent') {
    fetchUserContent()
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));

    // Return true to indicate we'll respond asynchronously
    return true;
  }

  if (request.action === 'fetchContentSummary') {
    fetchContentSummary()
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));

    // Return true to indicate we'll respond asynchronously
    return true;
  }

  if (request.action === 'openSignIn') {
    // Open sign-in page in new tab
    chrome.tabs.create({ url: 'https://recollectai.app/recordar/signin' });
    return false;
  }

  if (request.action === 'validateToken') {
    // Handle token validation request from content scripts
    chrome.storage.local.get('token').then(({ token }) => {
      if (!token) {
        sendResponse({ valid: false });
        return;
      }

      validateToken(token).then(isValid => {
        // Don't auto-remove token on validation failure
        // Let the user action (save attempt) handle auth errors
        sendResponse({ valid: isValid });
      });
    });

    // Return true to indicate we'll respond asynchronously
    return true;
  }

  if (request.action === 'updateToken') {
    // Handle token update from webapp-sync content script
    const token = request.token;

    if (token) {
      // Store token
      chrome.storage.local.set({ token }, () => {
        console.log('[Recollect] Background: Token stored');
        sendResponse({ success: true });
      });
    } else {
      // Remove token (user signed out)
      chrome.storage.local.remove('token', () => {
        console.log('[Recollect] Background: Token removed (user signed out)');
        sendResponse({ success: true });
      });
    }

    // Return true to indicate we'll respond asynchronously
    return true;
  }
});

// Handle content save request (videos, LinkedIn posts, etc.)
async function handleSaveVideo(url: string, tabId?: number): Promise<any> {
  const { token } = await chrome.storage.local.get('token');

  // Check if user is authenticated
  if (!token) {
    throw new Error('Please sign in to save content');
  }

  const response = await fetch(`${API_ENDPOINT}?url=${encodeURIComponent(url)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();

    // If authentication error, clear invalid token
    if (response.status === 401) {
      await chrome.storage.local.remove('token');
    }

    throw new Error(error.detail || 'Failed to save video');
  }

  const data = await response.json();

  // Show success badge
  if (tabId) {
    chrome.action.setBadgeText({ text: '✓', tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#10b981', tabId });

    setTimeout(() => {
      chrome.action.setBadgeText({ text: '', tabId });
    }, 2000);
  }

  return data;
}

export { };
