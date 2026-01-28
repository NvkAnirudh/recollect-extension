// TikTok Content Script - Detect video URLs

console.log('[Recollect] TikTok content script loaded');

function detectTikTokVideo(): string | null {
  const url = window.location.href;

  // Check if it's a video page
  if (url.includes('/video/') || url.includes('/@')) {
    return url;
  }

  return null;
}

// Store detected URL in chrome.storage so popup can access it
function storeVideoUrl() {
  const videoUrl = detectTikTokVideo();
  if (videoUrl) {
    chrome.storage.local.set({ currentVideoUrl: videoUrl });
    console.log('[Recollect] TikTok video detected:', videoUrl);
  }
}

// Run on load and URL changes (TikTok is a SPA)
storeVideoUrl();

// Watch for navigation changes
let lastUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    storeVideoUrl();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

export {};
