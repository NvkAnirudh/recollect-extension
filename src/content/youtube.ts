// YouTube Content Script - Detect video URLs

console.log('[Recollect] YouTube content script loaded');

function detectYouTubeVideo(): string | null {
  const url = window.location.href;

  // Check if it's a video page or Short
  if (url.includes('/watch?v=') || url.includes('/shorts/')) {
    return url;
  }

  return null;
}

// Store detected URL in chrome.storage so popup can access it
function storeVideoUrl() {
  const videoUrl = detectYouTubeVideo();
  if (videoUrl) {
    chrome.storage.local.set({ currentVideoUrl: videoUrl });
    console.log('[Recollect] YouTube video detected:', videoUrl);
  }
}

// Run on load and URL changes (YouTube is a SPA)
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
