# Recollect Chrome Extension

Save videos from Instagram, YouTube, TikTok, and LinkedIn with one click.

## Features

### LinkedIn Integration
- **Native Menu Option**: Click the three-dot menu on any LinkedIn post and select "Save to Recollect"
- Seamlessly integrated into LinkedIn's UI

### Instagram/YouTube/TikTok
- **Auto-Detection**: Extension automatically detects video URLs
- **Quick Save**: Click the extension icon to save with pre-filled URL
- **Context Menu**: Right-click anywhere to save current page

## Development

### Setup
```bash
npm install
```

### Build
```bash
# Development build with watch mode
npm run dev

# Production build
npm run build
```

### Testing Locally

1. Build the extension:
   ```bash
   npm run build
   ```

2. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist` folder

3. Test on supported platforms:
   - LinkedIn: Go to any post, click three dots → "Save to Recollect"
   - Instagram/YouTube/TikTok: Click extension icon on video page

### Project Structure

```
recollect-extension/
├── manifest.json           # Extension manifest (Manifest V3)
├── src/
│   ├── popup/             # Extension popup UI
│   │   ├── Popup.tsx      # React component
│   │   ├── popup.html     # HTML template
│   │   └── popup.css      # Styles
│   ├── content/           # Content scripts
│   │   ├── linkedin.ts    # LinkedIn menu injection
│   │   ├── instagram.ts   # Instagram URL detection
│   │   ├── youtube.ts     # YouTube URL detection
│   │   └── tiktok.ts      # TikTok URL detection
│   └── background/        # Service worker
│       └── service-worker.ts
├── public/
│   └── icons/             # Extension icons
└── webpack.config.js      # Build configuration
```

## How It Works

### LinkedIn
The content script uses a MutationObserver to watch for dropdown menus opening, then injects our "Save to Recollect" option into the native LinkedIn menu.

### Instagram/YouTube/TikTok
Content scripts detect video URLs and store them in `chrome.storage`. When the user clicks the extension icon, the popup auto-fills the URL.

### Context Menu
The background service worker creates a right-click menu option available on all supported platforms.

## Browser Compatibility

✅ Chrome, Edge, Brave, Arc, Opera, Vivaldi (all Chromium browsers)

## Publishing

Before publishing to Chrome Web Store:

1. Update version in `manifest.json` and `package.json`
2. Build production version: `npm run build`
3. Test thoroughly on all platforms
4. Create screenshots and promotional materials
5. Submit to Chrome Web Store ($5 one-time fee)

## License

See main project LICENSE
