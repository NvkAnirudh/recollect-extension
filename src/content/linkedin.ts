// LinkedIn Content Script - Recollect sidebar with saved content and save link functionality

console.log('[Recollect] LinkedIn content script loaded');

// Sidebar state
let sidebarOpen = false;
let sidebarElement: HTMLElement | null = null;
let toggleButton: HTMLElement | null = null;
let overlayElement: HTMLElement | null = null;
let currentPlatformFilter: 'all' | 'linkedin' | 'instagram' | 'youtube' | 'tiktok' = 'all'; // Default to all platforms
let currentMainTab: 'saved-content' | 'save-link' = 'saved-content';
let platformSummary: any = null; // Store platform counts

// Inject styles
function injectStyles() {
  const style = document.createElement('style');
  style.id = 'recollect-styles';
  style.textContent = `
    .recollect-notification {
      position: fixed;
      bottom: 24px;
      right: 24px;
      padding: 12px 20px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 999999;
      transition: opacity 0.3s;
    }

    .recollect-notification--success {
      color: #10b981;
      border-left: 4px solid #10b981;
    }

    .recollect-notification--error {
      color: #ef4444;
      border-left: 4px solid #ef4444;
    }

    /* Professional spinner animation */
    .recollect-spinner {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(147, 112, 219, 0.2);
      border-top-color: rgba(147, 112, 219, 1);
      border-radius: 50%;
      animation: recollect-spin 0.8s linear infinite;
    }

    @keyframes recollect-spin {
      to { transform: rotate(360deg); }
    }

    /* Sidebar Popup Styles */
    .recollect-sidebar {
      position: fixed;
      left: -400px;
      top: 0;
      width: 380px;
      height: 100vh;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      box-shadow: 4px 0 24px rgba(0, 0, 0, 0.3);
      z-index: 999998;
      transition: left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .recollect-sidebar.open {
      left: 0;
    }

    .recollect-sidebar-header {
      padding: 20px 20px 16px;
      background: rgba(147, 112, 219, 0.1);
      border-bottom: 1px solid rgba(147, 112, 219, 0.3);
    }

    .recollect-header-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .recollect-sidebar-title {
      font-size: 20px;
      font-weight: 700;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .recollect-sidebar-close {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      font-size: 24px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .recollect-sidebar-close:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    /* Main Tab Navigation (Saved Content / Save Link) */
    .recollect-main-tabs {
      display: flex;
      gap: 0;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      padding: 3px;
      margin-bottom: 12px;
    }

    .recollect-main-tab {
      flex: 1;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.5);
      background: transparent;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
      white-space: nowrap;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .recollect-main-tab:hover {
      color: rgba(255, 255, 255, 0.7);
      background: rgba(255, 255, 255, 0.05);
    }

    .recollect-main-tab.active {
      background: rgba(147, 112, 219, 0.3);
      color: #fff;
    }

    /* Save Link View */
    .recollect-save-link-view {
      padding: 20px;
      display: flex;
      flex-direction: column;
    }

    .recollect-save-link-title {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .recollect-save-link-subtitle {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .recollect-save-link-input-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .recollect-save-link-input {
      width: 100%;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(147, 112, 219, 0.3);
      border-radius: 8px;
      color: #fff;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      outline: none;
      transition: border-color 0.2s, background 0.2s;
      box-sizing: border-box;
    }

    .recollect-save-link-input::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }

    .recollect-save-link-input:focus {
      border-color: rgba(147, 112, 219, 0.6);
      background: rgba(255, 255, 255, 0.1);
    }

    .recollect-save-link-input.error {
      border-color: #ef4444;
    }

    .recollect-save-link-submit {
      width: 100%;
      padding: 12px 24px;
      background: linear-gradient(135deg, #9370db 0%, #7b68ee 100%);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
    }

    .recollect-save-link-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(147, 112, 219, 0.4);
    }

    .recollect-save-link-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .recollect-save-link-feedback {
      margin-top: 12px;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .recollect-save-link-feedback.success {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .recollect-save-link-feedback.error {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .recollect-save-link-loading {
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 13px;
      margin-top: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .recollect-sidebar-content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    .recollect-sidebar-content::-webkit-scrollbar {
      width: 8px;
    }

    .recollect-sidebar-content::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
    }

    .recollect-sidebar-content::-webkit-scrollbar-thumb {
      background: rgba(147, 112, 219, 0.5);
      border-radius: 4px;
    }

    .recollect-sidebar-content::-webkit-scrollbar-thumb:hover {
      background: rgba(147, 112, 219, 0.7);
    }

    .recollect-platform-section {
      margin-bottom: 32px;
    }

    /* Platform Navigation Tabs */
    .recollect-platform-nav {
      display: flex;
      gap: 4px;
      margin-top: 12px;
      padding: 4px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      overflow-x: auto;
      scrollbar-width: none;
    }

    .recollect-platform-nav::-webkit-scrollbar {
      display: none;
    }

    .recollect-platform-tab {
      flex: 1;
      min-width: 50px;
      padding: 10px 8px;
      background: transparent;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      color: rgba(255, 255, 255, 0.5);
    }

    .recollect-platform-tab:hover {
      background: rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.7);
    }

    .recollect-platform-tab.active {
      background: rgba(147, 112, 219, 0.3);
      color: #fff;
    }

    .recollect-platform-tab-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 24px;
      font-size: 18px;
    }

    .recollect-platform-tab-text {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 24px;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .recollect-platform-tab-count {
      font-size: 16px !important;
      font-weight: 800 !important;
      color: #a78bfa !important;
      line-height: 1 !important;
      min-height: 22px !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      text-align: center !important;
      margin-top: 4px !important;
    }

    .recollect-platform-tab.active .recollect-platform-tab-count {
      color: #fff !important;
      text-shadow: 0 0 8px rgba(255, 255, 255, 0.5) !important;
    }

    .recollect-platform-header {
      font-size: 14px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 16px;
      margin-top: 24px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .recollect-platform-header:first-child {
      margin-top: 0;
    }

    /* Date Sub-heading */
    .recollect-date-subheading {
      font-size: 12px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.5);
      margin: 16px 0 12px 0;
      padding-left: 4px;
    }

    .recollect-platform-icon {
      width: 20px;
      height: 20px;
      object-fit: contain;
    }

    .recollect-content-item {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(147, 112, 219, 0.2);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .recollect-content-item:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(147, 112, 219, 0.5);
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(147, 112, 219, 0.2);
    }

    /* Post Header */
    .recollect-post-header {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
    }

    .recollect-post-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
      background: rgba(147, 112, 219, 0.2);
    }

    .recollect-post-author-info {
      flex: 1;
      min-width: 0;
    }

    .recollect-post-author-name {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 2px;
    }

    .recollect-verified-badge {
      color: #0a66c2;
      font-size: 14px;
    }

    .recollect-post-author-headline {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-bottom: 2px;
    }

    .recollect-post-time {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* Post Body */
    .recollect-post-body {
      margin-bottom: 12px;
    }

    .recollect-post-text {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.5;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
      margin-bottom: 8px;
    }

    .recollect-post-hashtags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .recollect-post-hashtag {
      color: #70b5f9;
      font-size: 13px;
      font-weight: 500;
    }

    .recollect-post-thumbnail {
      width: 100%;
      border-radius: 8px;
      object-fit: cover;
      margin-top: 8px;
      max-height: 200px;
    }

    /* Engagement Footer */
    .recollect-post-engagement {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
    }

    .recollect-engagement-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .recollect-engagement-icon {
      font-size: 14px;
    }

    /* Action Bar */
    .recollect-post-actions {
      display: flex;
      justify-content: space-around;
      padding-top: 8px;
      margin-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      opacity: 0.6;
    }

    .recollect-action-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.6);
      padding: 6px 12px;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .recollect-action-btn:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .recollect-toggle-button {
      position: fixed;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      /* background: transparent; */
      border: none;
      border-radius: 50%;
      width: 56px;
      height: 56px;
      padding: 0;
      cursor: pointer;
      z-index: 999997;
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: none;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .recollect-toggle-button:hover {
      transform: translateY(-50%) scale(1.1);
      box-shadow: none;
    }

    .recollect-toggle-button:active {
      transform: translateY(-50%) scale(1.05);
    }

    .recollect-toggle-button.hidden {
      left: -80px;
    }

    .recollect-toggle-icon {
      width: 60px;
      /* height: 100%; */
      object-fit: contain;
      border-radius: 50px;
    }

    .recollect-loading {
      text-align: center;
      padding: 40px 20px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
    }

    .recollect-empty {
      text-align: center;
      padding: 40px 20px;
      color: rgba(255, 255, 255, 0.5);
      font-size: 14px;
    }

    .recollect-empty-icon {
      font-size: 48px;
      margin-bottom: 12px;
      opacity: 0.3;
    }

    .recollect-empty-platform {
      padding: 20px;
      text-align: center;
    }

    /* Sidebar overlay */
    .recollect-sidebar-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999997;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    .recollect-sidebar-overlay.visible {
      opacity: 1;
      pointer-events: all;
    }
  `;
  document.head.appendChild(style);
}

// Show notification toast
function showNotification(message: string, type: 'success' | 'error') {
  const notification = document.createElement('div');
  notification.className = `recollect-notification recollect-notification--${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Check if user is authenticated
async function isUserAuthenticated(): Promise<boolean> {
  const { token } = await chrome.storage.local.get('token');
  console.log('[Recollect] Auth check - Token exists:', !!token);
  if (token) {
    console.log('[Recollect] Auth check - Token preview:', token.substring(0, 20) + '...');
  }

  // If no token, definitely not authenticated
  if (!token) {
    return false;
  }
  
  // Validate token with backend via background script
  try {
    const response = await new Promise<{ valid: boolean }>((resolve) => {
      chrome.runtime.sendMessage({
        action: 'validateToken'
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[Recollect] Token validation error:', chrome.runtime.lastError);
          // Don't remove token on error - might be network issue
          resolve({ valid: false });
        } else {
          resolve(response);
        }
      });
    });

    if (!response?.valid) {
      console.log('[Recollect] Token validation failed');
      // Don't remove token here - let the click handler deal with it
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Recollect] Token validation error:', error);
    // Don't remove token on network errors
    return false;
  }
  // return !!token;
}


// Fetch saved content from backend
async function fetchSavedContent(): Promise<any[]> {
  try {
    const { token } = await chrome.storage.local.get('token');

    if (!token) {
      console.log('[Recollect] No token found, cannot fetch content');
      return [];
    }

    console.log('[Recollect] Fetching content for authenticated user...');

    // Use the background script to make the request (to avoid CORS issues)
    const response = await new Promise<any>((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          action: 'fetchContent'
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('[Recollect] Message error:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
            return;
          }
          resolve(response);
        }
      );
    });

    if (response?.success) {
      console.log('[Recollect] Fetched content:', response.data);

      // Handle paginated response format: { contents: [], total: 0, page: 1, page_size: 20 }
      let contents: any[] = [];

      if (response.data?.contents && Array.isArray(response.data.contents)) {
        contents = response.data.contents;
      } else if (Array.isArray(response.data)) {
        contents = response.data;
      }

      console.log(`[Recollect] Total items: ${contents.length}`);
      return contents;
    } else {
      console.error('[Recollect] Failed to fetch content:', response?.error);
      return [];
    }
  } catch (error) {
    console.error('[Recollect] Error fetching content:', error);
    return [];
  }
}

// Fetch content summary (platform counts)
async function fetchContentSummary(): Promise<any> {
  try {
    const response = await new Promise<any>((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: 'fetchContentSummary' },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('[Recollect] Message error:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        }
      );
    });

    if (response?.success) {
      console.log('[Recollect] Fetched summary:', response.data);
      return response.data;
    } else {
      console.error('[Recollect] Failed to fetch summary:', response?.error);
      return null;
    }
  } catch (error) {
    console.error('[Recollect] Error fetching summary:', error);
    return null;
  }
}

// Categorize content by platform
function categorizeByPlatform(contents: any[]) {
  const platforms = {
    linkedin: [] as any[],
    instagram: [] as any[],
    youtube: [] as any[],
    tiktok: [] as any[]
  };

  contents.forEach(content => {
    // Use source_platform field from the API response
    const platform = (content.source_platform || '').toLowerCase();

    if (platform === 'linkedin') {
      platforms.linkedin.push(content);
    } else if (platform === 'instagram') {
      platforms.instagram.push(content);
    } else if (platform === 'youtube') {
      platforms.youtube.push(content);
    } else if (platform === 'tiktok') {
      platforms.tiktok.push(content);
    }
  });

  return platforms;
}

// Get date category for grouping (Today, Yesterday, 2 days ago, etc.)
function getDateCategory(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const contentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((today.getTime() - contentDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  } catch {
    return 'Unknown';
  }
}

// Group content by date within a platform
function groupContentByDate(contents: any[]): Map<string, any[]> {
  const grouped = new Map<string, any[]>();

  contents.forEach(content => {
    const category = getDateCategory(content.created_at);
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category)!.push(content);
  });

  return grouped;
}

// Format date for display (LinkedIn style)
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Less than 24 hours: show hours
    if (diffHours < 24) {
      if (diffHours === 0) return 'Just now';
      return `${diffHours}h`;
    }

    // Less than 7 days: show days
    if (diffDays < 7) {
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    }

    // More than 7 days: show month and date
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    return `${month} ${day}`;
  } catch {
    return '';
  }
}

// Render platform section with LinkedIn-style post cards and date sub-grouping
function renderPlatformSection(platform: string, contents: any[]): string {
  // Platform logos as SVG
  const platformLogos: Record<string, string> = {
    linkedin: `<svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>`,
    instagram: `<svg width="20" height="20" viewBox="0 0 24 24" fill="url(#instagram-gradient)" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#FD5949;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#D6249F;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#285AEB;stop-opacity:1" />
        </linearGradient>
      </defs>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>`,
    youtube: `<svg width="20" height="20" viewBox="0 0 24 24" fill="#FF0000" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>`,
    tiktok: `<svg width="20" height="20" viewBox="0 0 24 24" fill="#000000" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
    </svg>`
  };

  const platformNames: Record<string, string> = {
    linkedin: 'LINKEDIN',
    instagram: 'INSTAGRAM',
    youtube: 'YOUTUBE',
    tiktok: 'TIKTOK'
  };

  // Escape HTML to prevent XSS
  const escapeHtml = (str: string) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  // Render empty state if no content
  let allItemsHTML = '';

  if (contents.length === 0) {
    allItemsHTML = `
      <div class="recollect-empty-platform">
        <div style="color: rgba(255, 255, 255, 0.4); font-size: 13px;">
          No ${platformNames[platform].toLowerCase()} content saved yet
        </div>
      </div>
    `;
  } else {
    // Group contents by date
    const dateGroups = groupContentByDate(contents);

    // Render each date group
    dateGroups.forEach((groupContents, dateCategory) => {
      // Add date sub-heading
      allItemsHTML += `<div class="recollect-date-subheading">${dateCategory}</div>`;

      // Render items in this date group
      const itemsHTML = groupContents.map(content => {
    const url = content.original_url || content.url || '#';
    const author = content.author || 'Unknown Author';
    const authorAvatar = content.author_avatar_url || '';
    const isVerified = content.is_author_verified || false;
    const authorHeadline = content.metadata?.author_bio || '';
    const postedTime = formatDate(content.posted_at || content.created_at);
    const description = content.description || content.text || '';
    const title = content.title || '';
    const hashtags = content.hashtags || [];
    const thumbnail = content.metadata?.thumbnail_url || content.thumbnail_url || content.thumbnail_path || '';
    const likes = content.platform_likes || 0;
    const comments = content.platform_comments || 0;
    const shares = content.platform_shares || 0;
    const processingStatus = content.processing_status || 'unknown';

    // Combine title and description for post text
    let postText = '';
    if (title && title !== 'Untitled') {
      postText = title;
      if (description) postText += '\n\n' + description;
    } else {
      postText = description;
    }

    return `
      <div class="recollect-content-item" data-url="${escapeHtml(url)}">
        <!-- Header Section -->
        <div class="recollect-post-header">
          ${authorAvatar ? `<img src="${escapeHtml(authorAvatar)}" class="recollect-post-avatar" alt="${escapeHtml(author)}" onerror="this.style.display='none'" />` : '<div class="recollect-post-avatar"></div>'}
          <div class="recollect-post-author-info">
            <div class="recollect-post-author-name">
              ${escapeHtml(author)}
              ${isVerified ? '<span class="recollect-verified-badge">✓</span>' : ''}
            </div>
            ${authorHeadline ? `<div class="recollect-post-author-headline">${escapeHtml(authorHeadline)}</div>` : ''}
            <div class="recollect-post-time">
              <span>🌐</span>
              <span>${postedTime}</span>
            </div>
          </div>
        </div>

        <!-- Body Section -->
        <div class="recollect-post-body">
          ${postText ? `<div class="recollect-post-text">${escapeHtml(postText)}</div>` : ''}

          ${hashtags.length > 0 ? `
            <div class="recollect-post-hashtags">
              ${hashtags.map((tag: string) => `<span class="recollect-post-hashtag">#${escapeHtml(tag)}</span>`).join(' ')}
            </div>
          ` : ''}

          ${thumbnail ? `<img src="${escapeHtml(thumbnail)}" class="recollect-post-thumbnail" alt="Post media" onerror="this.style.display='none'" />` : ''}
        </div>

        <!-- Engagement Footer -->
        ${likes > 0 || comments > 0 || shares > 0 ? `
          <div class="recollect-post-engagement">
            ${likes > 0 ? `
              <div class="recollect-engagement-item">
                <span>${likes} like${likes !== 1 ? 's' : ''}</span>
              </div>
            ` : ''}
            ${comments > 0 ? `
              <div class="recollect-engagement-item">
                <span>${comments} comment${comments !== 1 ? 's' : ''}</span>
              </div>
            ` : ''}
            ${shares > 0 ? `
              <div class="recollect-engagement-item">
                <span>${shares} repost${shares !== 1 ? 's' : ''}</span>
              </div>
            ` : ''}
          </div>
        ` : ''}

        ${processingStatus === 'processing' ? `<div style="color: #fbbf24; font-size: 12px; margin-top: 8px;">⏳ Processing...</div>` : ''}
        ${processingStatus === 'failed' ? `<div style="color: #ef4444; font-size: 12px; margin-top: 8px;">❌ Failed to process</div>` : ''}
      </div>
    `;
    }).join('');

      allItemsHTML += itemsHTML;
    });
  }

  // Get total count from summary, fallback to filtered count
  let totalCount = contents.length;
  if (platformSummary?.by_platform?.[platform]?.count !== undefined) {
    totalCount = platformSummary.by_platform[platform].count;
  }

  return `
    <div class="recollect-platform-section">
      <div class="recollect-platform-header">
        <span>${platformLogos[platform]}</span>
        <span>${platformNames[platform]} (${totalCount})</span>
      </div>
      ${allItemsHTML}
    </div>
  `;
}

// Update platform tab counts in navbar
function updatePlatformTabCounts() {
  if (!sidebarElement) {
    console.log('[Recollect] Cannot update counts: sidebarElement not found');
    return;
  }

  if (!platformSummary) {
    console.log('[Recollect] Cannot update counts: platformSummary not available');
    return;
  }

  console.log('[Recollect] Updating platform tab counts:', platformSummary);

  const allTab = sidebarElement.querySelector('.recollect-platform-tab[data-platform="all"] .recollect-platform-tab-count');
  const linkedinTab = sidebarElement.querySelector('.recollect-platform-tab[data-platform="linkedin"] .recollect-platform-tab-count');
  const instagramTab = sidebarElement.querySelector('.recollect-platform-tab[data-platform="instagram"] .recollect-platform-tab-count');
  const youtubeTab = sidebarElement.querySelector('.recollect-platform-tab[data-platform="youtube"] .recollect-platform-tab-count');
  const tiktokTab = sidebarElement.querySelector('.recollect-platform-tab[data-platform="tiktok"] .recollect-platform-tab-count');

  console.log('[Recollect] Found counter elements:', { allTab, linkedinTab, instagramTab, youtubeTab, tiktokTab });

  if (allTab) {
    const newValue = String(platformSummary.total || 0);
    allTab.textContent = newValue;
    console.log('[Recollect] Set All count to:', newValue, '| Current textContent:', allTab.textContent);
  } else {
    console.error('[Recollect] All tab counter element NOT FOUND');
  }

  if (linkedinTab) {
    const newValue = String(platformSummary.by_platform?.linkedin?.count || 0);
    linkedinTab.textContent = newValue;
    console.log('[Recollect] Set LinkedIn count to:', newValue, '| Current textContent:', linkedinTab.textContent);
  } else {
    console.error('[Recollect] LinkedIn tab counter element NOT FOUND');
  }

  if (instagramTab) {
    const newValue = String(platformSummary.by_platform?.instagram?.count || 0);
    instagramTab.textContent = newValue;
    console.log('[Recollect] Set Instagram count to:', newValue, '| Current textContent:', instagramTab.textContent);
  } else {
    console.error('[Recollect] Instagram tab counter element NOT FOUND');
  }

  if (youtubeTab) {
    const newValue = String(platformSummary.by_platform?.youtube?.count || 0);
    youtubeTab.textContent = newValue;
    console.log('[Recollect] Set YouTube count to:', newValue, '| Current textContent:', youtubeTab.textContent);
  } else {
    console.error('[Recollect] YouTube tab counter element NOT FOUND');
  }

  if (tiktokTab) {
    const newValue = String(platformSummary.by_platform?.tiktok?.count || 0);
    tiktokTab.textContent = newValue;
    console.log('[Recollect] Set TikTok count to:', newValue, '| Current textContent:', tiktokTab.textContent);
  } else {
    console.error('[Recollect] TikTok tab counter element NOT FOUND');
  }
}

// Render the Save Link view in the sidebar
async function renderSaveLinkView() {
  const contentDiv = sidebarElement?.querySelector('.recollect-sidebar-content');
  if (!contentDiv) return;

  // Check if user is authenticated first
  const { token } = await chrome.storage.local.get('token');
  if (!token) {
    contentDiv.innerHTML = `
      <div class="recollect-empty">
        <div class="recollect-empty-icon">🔒</div>
        <div>Please sign in to save links</div>
        <div style="margin-top: 16px;">
          <button id="recollect-savelink-signin-button" style="
            background: linear-gradient(135deg, #9370db 0%, #7b68ee 100%);
            color: white;
            border: none;
            padding: 10px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
            transition: transform 0.2s, box-shadow 0.2s;
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(147, 112, 219, 0.4)'"
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
            Sign In
          </button>
        </div>
      </div>
    `;

    const signInButton = contentDiv.querySelector('#recollect-savelink-signin-button');
    if (signInButton) {
      signInButton.addEventListener('click', () => {
        console.log('[Recollect] Opening sign in page from Save Link...');
        chrome.runtime.sendMessage({ action: 'openSignIn' });
      });
    }

    return;
  }

  contentDiv.innerHTML = `
    <div class="recollect-save-link-view">
      <div class="recollect-save-link-title">Save a Link</div>
      <div class="recollect-save-link-subtitle">
        Paste any URL from LinkedIn, Instagram, YouTube, or TikTok
      </div>
      <div class="recollect-save-link-input-group">
        <input
          type="url"
          class="recollect-save-link-input"
          id="recollect-save-link-input"
          placeholder="https://www.youtube.com/watch?v=..."
          autocomplete="off"
          spellcheck="false"
        />
        <button class="recollect-save-link-submit" id="recollect-save-link-submit">
          Save Link
        </button>
      </div>
      <div id="recollect-save-link-feedback"></div>
    </div>
  `;

  const input = contentDiv.querySelector('#recollect-save-link-input') as HTMLInputElement;
  const submitBtn = contentDiv.querySelector('#recollect-save-link-submit') as HTMLButtonElement;
  const feedbackDiv = contentDiv.querySelector('#recollect-save-link-feedback') as HTMLDivElement;

  if (!input || !submitBtn || !feedbackDiv) return;

  // Submit on button click
  submitBtn.addEventListener('click', () => {
    handleSaveLinkSubmit(input, submitBtn, feedbackDiv);
  });

  // Submit on Enter key
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleSaveLinkSubmit(input, submitBtn, feedbackDiv);
    }
  });

  // Clear error state on input change
  input.addEventListener('input', () => {
    input.classList.remove('error');
    feedbackDiv.innerHTML = '';
  });

  // Auto-focus the input
  setTimeout(() => input.focus(), 100);
}

// Handle Save Link form submission
async function handleSaveLinkSubmit(
  input: HTMLInputElement,
  submitBtn: HTMLButtonElement,
  feedbackDiv: HTMLDivElement
) {
  const url = input.value.trim();

  // Validation
  if (!url) {
    input.classList.add('error');
    feedbackDiv.innerHTML = '<div class="recollect-save-link-feedback error">Please enter a URL</div>';
    input.focus();
    return;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    input.classList.add('error');
    feedbackDiv.innerHTML = '<div class="recollect-save-link-feedback error">Please enter a valid URL</div>';
    input.focus();
    return;
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    input.classList.add('error');
    feedbackDiv.innerHTML = '<div class="recollect-save-link-feedback error">URL must start with http:// or https://</div>';
    input.focus();
    return;
  }

  // Auth check
  const isAuthenticated = await isUserAuthenticated();
  if (!isAuthenticated) {
    feedbackDiv.innerHTML = '<div class="recollect-save-link-feedback error">Please sign in to save content</div>';
    chrome.runtime.sendMessage({ action: 'openSignIn' });
    return;
  }

  // Loading state
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';
  input.readOnly = true;
  feedbackDiv.innerHTML = `
    <div class="recollect-save-link-loading">
      <div class="recollect-spinner" style="width: 16px; height: 16px; border-width: 2px;"></div>
      <span>Saving link...</span>
    </div>
  `;

  // Send to background service worker
  chrome.runtime.sendMessage(
    { action: 'saveVideo', url: url },
    (response) => {
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Link';
      input.readOnly = false;

      if (chrome.runtime.lastError) {
        console.error('[Recollect] Save link error:', chrome.runtime.lastError);
        feedbackDiv.innerHTML = '<div class="recollect-save-link-feedback error">Failed to save. Please try again.</div>';
        return;
      }

      if (response?.success) {
        const data = response.data;
        const processingStatus = data?.processing_status || data?.status;

        if (processingStatus === 'failed') {
          feedbackDiv.innerHTML = '<div class="recollect-save-link-feedback error">This link could not be processed. Please check the URL and try again.</div>';
          return;
        }

        // Success
        feedbackDiv.innerHTML = '<div class="recollect-save-link-feedback success">Link saved successfully!</div>';
        input.value = '';

        // Auto-clear success message after 5 seconds
        setTimeout(() => {
          if (feedbackDiv.querySelector('.success')) {
            feedbackDiv.innerHTML = '';
          }
        }, 5000);
      } else {
        const errorMsg = response?.error || 'Failed to save';
        feedbackDiv.innerHTML = `<div class="recollect-save-link-feedback error">${errorMsg}</div>`;
      }
    }
  );
}

// Render sidebar content
async function renderSidebarContent() {
  // Don't render content list if Save Link tab is active
  if (currentMainTab === 'save-link') return;

  const contentDiv = sidebarElement?.querySelector('.recollect-sidebar-content');
  if (!contentDiv) return;

  // Check if user is authenticated first
  const { token } = await chrome.storage.local.get('token');
  if (!token) {
    contentDiv.innerHTML = `
      <div class="recollect-empty">
        <div class="recollect-empty-icon">🔒</div>
        <div>Please sign in to view your saved content</div>
        <div style="margin-top: 16px;">
          <button id="recollect-signin-button" style="
            background: linear-gradient(135deg, #9370db 0%, #7b68ee 100%);
            color: white;
            border: none;
            padding: 10px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
            transition: transform 0.2s, box-shadow 0.2s;
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(147, 112, 219, 0.4)'"
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
            Sign In
          </button>
        </div>
      </div>
    `;

    // Add click handler to sign in button
    const signInButton = contentDiv.querySelector('#recollect-signin-button');
    if (signInButton) {
      signInButton.addEventListener('click', () => {
        console.log('[Recollect] Opening sign in page...');
        chrome.runtime.sendMessage({ action: 'openSignIn' });
      });
    }

    return;
  }

  // Show loading state
  contentDiv.innerHTML = '<div class="recollect-loading"><div class="recollect-spinner"></div><div style="margin-top: 12px;">Loading your saved content...</div></div>';

  // Fetch summary first (for platform counts)
  platformSummary = await fetchContentSummary();

  // Update platform tab counts in navbar
  updatePlatformTabCounts();

  // Fetch content
  let contents = await fetchSavedContent();

  console.log('[Recollect Sidebar] Fetched', contents.length, 'total items');
  console.log('[Recollect Sidebar] Summary:', platformSummary);

  // Filter out failed or incomplete content
  contents = contents.filter(content => {
    // Exclude failed processing status
    if (content.processing_status === 'failed') {
      console.log('[Recollect] Filtering out failed content:', content.id);
      return false;
    }

    // Exclude incomplete content (no author or just "Field" as description)
    const hasValidAuthor = content.author && content.author.trim() !== '' && content.author !== 'Unknown Author';
    const hasValidDescription = content.description && content.description.trim() !== '' && content.description !== 'Field';
    const hasValidTitle = content.title && content.title.trim() !== '' && content.title !== 'Untitled';

    // Content must have either valid author or (valid title/description)
    if (!hasValidAuthor && !hasValidTitle && !hasValidDescription) {
      console.log('[Recollect] Filtering out incomplete content:', content.id);
      return false;
    }

    return true;
  });

  console.log('[Recollect Sidebar] After filtering failed/incomplete:', contents.length, 'items');

  // Categorize by platform
  const platforms = categorizeByPlatform(contents);

  console.log('[Recollect Sidebar] Categorized:', {
    linkedin: platforms.linkedin.length,
    instagram: platforms.instagram.length,
    youtube: platforms.youtube.length,
    tiktok: platforms.tiktok.length
  });

  // Update platform tab counts with categorized data
  const allTab = sidebarElement?.querySelector('.recollect-platform-tab[data-platform="all"] .recollect-platform-tab-count');
  const linkedinTab = sidebarElement?.querySelector('.recollect-platform-tab[data-platform="linkedin"] .recollect-platform-tab-count');
  const instagramTab = sidebarElement?.querySelector('.recollect-platform-tab[data-platform="instagram"] .recollect-platform-tab-count');
  const youtubeTab = sidebarElement?.querySelector('.recollect-platform-tab[data-platform="youtube"] .recollect-platform-tab-count');
  const tiktokTab = sidebarElement?.querySelector('.recollect-platform-tab[data-platform="tiktok"] .recollect-platform-tab-count');

  const totalCount = platforms.linkedin.length + platforms.instagram.length + platforms.youtube.length + platforms.tiktok.length;

  if (allTab) allTab.textContent = String(totalCount);
  if (linkedinTab) linkedinTab.textContent = String(platforms.linkedin.length);
  if (instagramTab) instagramTab.textContent = String(platforms.instagram.length);
  if (youtubeTab) youtubeTab.textContent = String(platforms.youtube.length);
  if (tiktokTab) tiktokTab.textContent = String(platforms.tiktok.length);

  console.log('[Recollect] Updated tab counts:', {
    all: totalCount,
    linkedin: platforms.linkedin.length,
    instagram: platforms.instagram.length,
    youtube: platforms.youtube.length,
    tiktok: platforms.tiktok.length
  });

  // Filter by selected platform
  let sectionsHTML = '';
  if (currentPlatformFilter === 'all') {
    // Show all platforms
    sectionsHTML = [
      renderPlatformSection('linkedin', platforms.linkedin),
      renderPlatformSection('instagram', platforms.instagram),
      renderPlatformSection('youtube', platforms.youtube),
      renderPlatformSection('tiktok', platforms.tiktok)
    ].join('');
  } else {
    // Show only selected platform
    sectionsHTML = renderPlatformSection(currentPlatformFilter, platforms[currentPlatformFilter]);
  }

  // Check if there's any content to show
  if (!sectionsHTML || contents.length === 0) {
    const platformName = currentPlatformFilter === 'all' ? 'any platform' : currentPlatformFilter;
    contentDiv.innerHTML = `
      <div class="recollect-empty">
        <div class="recollect-empty-icon">📭</div>
        <div>No ${platformName} content saved yet</div>
        <div style="margin-top: 8px; font-size: 12px;">Save some content to get started!</div>
      </div>
    `;
    return;
  }

  contentDiv.innerHTML = sectionsHTML;

  // Add click handlers to items
  const items = contentDiv.querySelectorAll('.recollect-content-item');
  items.forEach(item => {
    item.addEventListener('click', (e) => {
      // Don't open link if clicking on action buttons
      const target = e.target as HTMLElement;
      if (target.closest('.recollect-post-actions')) {
        return;
      }

      const url = item.getAttribute('data-url');
      if (url && url !== '#') {
        window.open(url, '_blank');
      }
    });
  });

  // Prevent action buttons from triggering card click
  const actionButtons = contentDiv.querySelectorAll('.recollect-action-btn');
  actionButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Action buttons are decorative only
    });
  });
}

// Create and inject sidebar
function createSidebar() {
  if (sidebarElement) return; // Already created

  const logoUrl = chrome.runtime.getURL('public/icon_with_dark_bg.png');

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'recollect-sidebar-overlay';
  overlay.addEventListener('click', closeSidebar);
  document.body.appendChild(overlay);
  overlayElement = overlay;

  // Create sidebar
  const sidebar = document.createElement('div');
  sidebar.className = 'recollect-sidebar';
  sidebar.innerHTML = `
    <div class="recollect-sidebar-header">
      <div class="recollect-header-top">
        <div class="recollect-sidebar-title">
          <img src="${logoUrl}" style="width: 38px; height: 30px; border-radius: 6px;" alt="Recollect" />
          <span>Recollect</span>
        </div>
        <button class="recollect-sidebar-close" aria-label="Close sidebar">×</button>
      </div>
      <div class="recollect-main-tabs">
        <button class="recollect-main-tab active" data-main-tab="saved-content">Saved Content</button>
        <button class="recollect-main-tab" data-main-tab="save-link">Save Link</button>
      </div>
      <div class="recollect-platform-nav-container">
      <div class="recollect-platform-nav">
        <button class="recollect-platform-tab recollect-platform-tab-all active" data-platform="all" title="All Platforms">
          <div class="recollect-platform-tab-text">All</div>
          <div class="recollect-platform-tab-count">0</div>
        </button>
        <button class="recollect-platform-tab" data-platform="linkedin" title="LinkedIn">
          <div class="recollect-platform-tab-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </div>
          <div class="recollect-platform-tab-count">0</div>
        </button>
        <button class="recollect-platform-tab" data-platform="instagram" title="Instagram">
          <div class="recollect-platform-tab-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </div>
          <div class="recollect-platform-tab-count">0</div>
        </button>
        <button class="recollect-platform-tab" data-platform="youtube" title="YouTube">
          <div class="recollect-platform-tab-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          <div class="recollect-platform-tab-count">0</div>
        </button>
        <button class="recollect-platform-tab" data-platform="tiktok" title="TikTok">
          <div class="recollect-platform-tab-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
            </svg>
          </div>
          <div class="recollect-platform-tab-count">0</div>
        </button>
      </div>
      </div>
    </div>
    <div class="recollect-sidebar-content"></div>
  `;

  document.body.appendChild(sidebar);
  sidebarElement = sidebar;

  // Add close handler
  const closeBtn = sidebar.querySelector('.recollect-sidebar-close');
  closeBtn?.addEventListener('click', closeSidebar);

  // Add main tab handlers (Saved Content / Save Link)
  const mainTabs = sidebar.querySelectorAll('.recollect-main-tab');
  const platformNavContainer = sidebar.querySelector('.recollect-platform-nav-container') as HTMLElement | null;

  mainTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-main-tab') as 'saved-content' | 'save-link';
      if (!tabName || tabName === currentMainTab) return;

      currentMainTab = tabName;

      // Update tab active state
      mainTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Show/hide platform tabs
      if (platformNavContainer) {
        platformNavContainer.style.display = tabName === 'saved-content' ? 'block' : 'none';
      }

      // Render the appropriate view
      if (tabName === 'saved-content') {
        renderSidebarContent();
      } else {
        renderSaveLinkView();
      }
    });
  });

  // Add platform tab handlers
  const platformTabs = sidebar.querySelectorAll('.recollect-platform-tab');
  platformTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const platform = tab.getAttribute('data-platform') as 'all' | 'linkedin' | 'instagram' | 'youtube' | 'tiktok';
      if (platform && platform !== currentPlatformFilter) {
        currentPlatformFilter = platform;

        // Update active state
        platformTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Re-render content with new platform filter
        renderSidebarContent();
      }
    });
  });
}

// Create toggle button
function createToggleButton() {
  if (toggleButton) return; // Already created

  const logoUrl = chrome.runtime.getURL('public/icon_with_dark_bg.png');

  const button = document.createElement('button');
  button.className = 'recollect-toggle-button';
  button.setAttribute('aria-label', 'Open Recollect saved content');
  button.setAttribute('title', 'View Saved Content');
  button.innerHTML = `
    <img src="${logoUrl}" class="recollect-toggle-icon" alt="Recollect" />
  `;

  document.body.appendChild(button);
  toggleButton = button;

  // Add click handler
  button.addEventListener('click', toggleSidebar);
}

// Open sidebar
async function openSidebar() {
  if (!sidebarElement) createSidebar();

  sidebarOpen = true;
  sidebarElement?.classList.add('open');
  overlayElement?.classList.add('visible');
  toggleButton?.classList.add('hidden');

  // Load the appropriate view based on current tab
  if (currentMainTab === 'saved-content') {
    // Fetch summary immediately and update counts
    platformSummary = await fetchContentSummary();
    console.log('[Recollect] Fetched summary in openSidebar:', platformSummary);

    // Update counts with delay to ensure DOM is ready
    setTimeout(() => {
      updatePlatformTabCounts();
      console.log('[Recollect] Updated counts after delay');
    }, 100);

    renderSidebarContent();
  } else {
    renderSaveLinkView();
  }
}

// Close sidebar
function closeSidebar() {
  sidebarOpen = false;
  sidebarElement?.classList.remove('open');
  overlayElement?.classList.remove('visible');
  toggleButton?.classList.remove('hidden');
}

// Toggle sidebar
function toggleSidebar() {
  if (sidebarOpen) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

// Initialize
function init() {
  console.log('[Recollect] Initializing LinkedIn integration...');
  console.log('[Recollect] Current URL:', window.location.href);

  // Skip login/signup pages — no posts there
  const path = window.location.pathname;
  if (path.startsWith('/login') || path.startsWith('/signup') || path.startsWith('/checkpoint')) {
    console.log('[Recollect] Login/signup page, skipping');
    return;
  }

  injectStyles();

  // Create sidebar components
  createToggleButton();
  createSidebar();

  console.log('[Recollect] LinkedIn integration initialized');
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  console.log('[Recollect] Waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', init);
} else {
  console.log('[Recollect] DOM already loaded, initializing immediately');
  init();
}

// Listen for keyboard shortcuts
document.addEventListener('keydown', async (e) => {
  // Keyboard shortcut to toggle sidebar (Ctrl+Shift+R or Cmd+Shift+R)
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
    e.preventDefault();
    console.log('[Recollect] Keyboard shortcut triggered, toggling sidebar');
    toggleSidebar();
  }

  // Escape key to close sidebar
  if (e.key === 'Escape' && sidebarOpen) {
    e.preventDefault();
    closeSidebar();
  }
});

// Listen for storage changes (when token is added/removed)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.token) {
    console.log('[Recollect] Token changed in storage:', {
      oldValue: changes.token.oldValue ? 'exists' : 'none',
      newValue: changes.token.newValue ? 'exists' : 'none'
    });

    if (!changes.token.newValue) {
      console.log('[Recollect] ⚠️ User signed out - token removed from storage');
      showNotification('Signed out from Recollect', 'error');

      // Close sidebar and clear content
      if (sidebarOpen) {
        closeSidebar();
      }
    } else {
      console.log('[Recollect] ✅ User signed in - token added to storage');

      // Refresh sidebar if open
      if (sidebarOpen) {
        renderSidebarContent();
      }
    }
  }
});

export {};
