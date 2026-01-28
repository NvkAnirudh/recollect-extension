# Testing the Recollect Chrome Extension

## Installation

1. **Build the extension:**
   ```bash
   npm install
   npm run build
   ```

2. **Load in Chrome/Arc/Comet/Brave:**
   - Open `chrome://extensions/` (or equivalent)
   - Enable **"Developer mode"** (toggle in top right)
   - Click **"Load unpacked"**
   - Select the `dist` folder from this directory

3. **Pin the extension:**
   - Click the puzzle piece icon (Extensions) in Chrome toolbar
   - Find "Recollect - Save & Search Videos"
   - Click the pin icon to keep it visible

## Testing Scenarios

### 1. LinkedIn Integration (Most Important!)

**Test on a LinkedIn post:**
1. Go to LinkedIn feed: https://www.linkedin.com/feed/
2. Find any post
3. Click the **three-dot menu** (⋯) on the post
4. Look for **"Save to Recollect"** option
5. Click it → Should save the post and show success notification

**Expected behavior:**
- Menu option appears in native LinkedIn dropdown
- Clicking it saves the post
- Green notification toast appears: "Saved to Recollect!"
- Extension badge shows ✓ briefly

### 2. Instagram Reels

**Test on Instagram:**
1. Go to any Instagram Reel: https://www.instagram.com/reels/
2. Click the Recollect extension icon
3. Popup should auto-fill with the Reel URL
4. Click "Save to Library"

**Expected behavior:**
- Platform badge shows "Instagram"
- URL is pre-filled
- Save succeeds with success message

### 3. YouTube Videos/Shorts

**Test on YouTube:**
1. Go to any YouTube video or Short
2. Click extension icon
3. Should auto-fill URL
4. Click save

**Test both:**
- Regular video: https://www.youtube.com/watch?v=[video-id]
- YouTube Short: https://www.youtube.com/shorts/[short-id]

### 4. TikTok

**Test on TikTok:**
1. Go to any TikTok video
2. Click extension icon
3. Should auto-fill URL
4. Click save

### 5. Context Menu (Right-click)

**Test right-click menu:**
1. Go to Instagram/YouTube/TikTok/LinkedIn
2. **Right-click anywhere** on the page
3. Look for "Save to Recollect" in context menu
4. Click it → Should save current page

**Expected behavior:**
- Context menu option appears
- Clicking it saves the page
- Extension badge shows ✓

### 6. Manual URL Entry

**Test manual save:**
1. Go to any website
2. Click extension icon
3. Manually paste a video URL
4. Click "Save to Library"

## Troubleshooting

### Extension not appearing
- Make sure you loaded the `dist` folder, not the root folder
- Check console for errors: Right-click extension → "Inspect popup"

### LinkedIn menu option not showing
- Check console on LinkedIn page (F12 → Console tab)
- Look for `[Recollect]` messages
- Make sure you're on https://www.linkedin.com/*
- Try refreshing the page

### URLs not auto-filling
- Check if content script is loaded: F12 → Console → Look for `[Recollect]` messages
- Verify you're on a video page (not homepage)
- Try refreshing the page

### API errors
- Make sure backend is running on `http://localhost:8080`
- Check backend logs for errors
- Verify API endpoint exists

## Development Workflow

**Make changes:**
1. Edit source files in `src/`
2. Run `npm run dev` (watch mode) OR `npm run build`
3. Go to `chrome://extensions/`
4. Click refresh icon ↻ on the Recollect extension
5. Test changes

**Hot reload tip:**
- Use `npm run dev` to auto-rebuild on file changes
- You still need to click refresh in chrome://extensions/

## Console Debugging

**Check extension logs:**
- **Popup**: Right-click extension icon → Inspect popup
- **Background**: chrome://extensions/ → Click "background page" (under extension details)
- **Content scripts**: F12 on the webpage → Console tab

**Look for these messages:**
- `[Recollect] LinkedIn content script loaded`
- `[Recollect] Instagram video detected: [url]`
- `[Recollect] Saving post: [url]`
- `[Recollect] Save successful`

## Browser Compatibility

✅ **Tested on:**
- Chrome
- Arc
- Brave
- Edge
- Opera
- Vivaldi
- Comet

All Chromium browsers should work identically.

## Next Steps

Once local testing is complete:
1. Test on all 4 platforms (LinkedIn, Instagram, YouTube, TikTok)
2. Verify with/without authentication
3. Test error cases (network errors, invalid URLs)
4. Prepare for Chrome Web Store submission
