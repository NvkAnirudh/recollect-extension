// Instagram Content Script - Detect video URLs

console.log('[Recollect] Instagram content script loaded');

function detectInstagramVideo(): string | null {
  const url = window.location.href;

  // Check if it's a Reel or video post
  if (url.includes('/reel/') || url.includes('/p/') || url.includes('/tv/')) {
    return url;
  }

  return null;
}

// Store detected URL in chrome.storage so popup can access it
function storeVideoUrl() {
  const videoUrl = detectInstagramVideo();
  if (videoUrl) {
    chrome.storage.local.set({ currentVideoUrl: videoUrl });
    console.log('[Recollect] Instagram video detected:', videoUrl);
  }
}

// Run on load and URL changes (Instagram is a SPA)
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
