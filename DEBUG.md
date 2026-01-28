# Debugging Recollect Extension

## Quick Fixes to Try First

### 1. **Refresh the Page**
After installing the extension, you MUST refresh any open LinkedIn/YouTube/Instagram/TikTok tabs.
- Press `Cmd+R` (Mac) or `Ctrl+R` (Windows)
- Or close and reopen the tabs

### 2. **Pin the Extension Icon**
The extension icon should be in your browser toolbar (top right).

**To pin it:**
1. Click the puzzle piece icon (🧩) in Chrome toolbar
2. Find "Recollect - Save & Search Videos"
3. Click the pin icon 📌 to keep it visible

The extension icon will NOT appear "on the side" of pages - it's in the toolbar!

### 3. **Check Console for Errors**

**On LinkedIn:**
1. Go to LinkedIn feed: https://www.linkedin.com/feed/
2. Press `F12` (or `Cmd+Option+I` on Mac)
3. Go to **Console** tab
4. Look for messages starting with `[Recollect]`

**You should see:**
```
[Recollect] LinkedIn content script loaded
[Recollect] Mutation observer started
[Recollect] LinkedIn integration initialized
```

**If you DON'T see these messages**, the content script isn't loading.

## Step-by-Step Debugging

### Test 1: Extension Popup

1. **Click the Recollect icon** in your toolbar (top right)
2. A popup should appear with:
   - Recollect logo
   - URL input field
   - "Save to Library" button

**If popup doesn't open:**
- Right-click extension icon → "Inspect popup"
- Check console for errors

### Test 2: LinkedIn Recollect Logo on Posts

The extension injects a **Recollect logo button** next to the three-dot (⋯) menu on each post in the feed. Click it to save the post to Recollect.

1. **Go to LinkedIn feed**: https://www.linkedin.com/feed/
2. **Refresh the page** (Cmd+R or Ctrl+R) — important after installing/updating
3. **Open Console** (F12)
4. Look for `[Recollect] LinkedIn content script loaded` and `[Recollect] Found N menu buttons on page`
5. **Find any post** in the feed — the purple Recollect logo should appear **to the left of** the three-dot menu on each post
6. **Click the Recollect logo** to save that post

**In console, you should see:**
```
[Recollect] LinkedIn content script loaded
[Recollect] Starting scan for posts (bottom-up approach)...
[Recollect] Found N menu buttons on page
[Recollect] Button injected for: https://...
```

### Test 3: YouTube Shorts

1. **Go to any YouTube Short**: https://www.youtube.com/shorts/
2. **Refresh the page**
3. **Open Console** (F12)
4. Look for: `[Recollect] YouTube content script loaded`
5. **Click the Recollect extension icon** in toolbar
6. The popup should show the Short URL pre-filled

### Test 4: Service Worker

1. Go to `chrome://extensions/`
2. Find Recollect extension
3. Click **"service worker (Inactive)"** or **"Inspect views: background page"**
4. Console should show: `[Recollect] Background service worker started`

## Common Issues & Fixes

### Issue: Recollect logo not visible on LinkedIn posts

**Possible causes and fixes:**

1. **Wrong folder loaded**
   - You must load the **dist** folder in Chrome, not the project root.
   - Build first: `npm run build` then in chrome://extensions choose "Load unpacked" → select the **dist** folder.

2. **Page not refreshed**
   - After installing or updating the extension, refresh LinkedIn (Cmd+R or Ctrl+R). Existing tabs use the old script until refreshed.

3. **Content script not loading**
   - Open LinkedIn feed → F12 → Console. Look for `[Recollect] LinkedIn content script loaded`.
   - If missing: check chrome://extensions that the extension is enabled and has no errors; reload the extension (↻) then refresh LinkedIn.

4. **"Found 0 menu buttons"**
   - Console shows `[Recollect] Found 0 menu buttons on page` when the script can’t find post menus (e.g. LinkedIn changed DOM).
   - Ensure you’re on the main feed (https://www.linkedin.com/feed/) or a post page, not notifications/messaging.
   - Try scrolling to load a few posts, then refresh; the script also rescans at 2s and 5s and on new content.

5. **CSP (Content Security Policy) blocking**
   - Check console for CSP or "Refused to load" errors; LinkedIn’s policies can block some resources.

**Quick console check (on LinkedIn, F12 → Console):**
```javascript
// Is the content script running?
console.log("Recollect styles:", !!Array.from(document.styleSheets).find(s => s.ownerNode?.textContent?.includes?.("recollect-save-button")));
// How many overflow/menu buttons did we find?
console.log("Menu-like buttons:", document.querySelectorAll('button[aria-label*="ore"], button[aria-label*="ontrol"], button[aria-label*="verflow"]').length);
```

### Issue: Extension icon not visible

**Solution:**
- Click puzzle piece 🧩 in toolbar
- Pin the Recollect extension

### Issue: Popup shows wrong URL or no URL

**For Instagram/YouTube/TikTok:**
- The content scripts detect URLs and store them
- If URL isn't pre-filled, the content script might not be running
- Check console for `[Recollect] [Platform] video detected: [url]`

### Issue: "Network error" when saving

**Check:**
1. Backend is running on `http://localhost:8080`
2. Run: `curl http://localhost:8080/health` (should return OK)
3. Check CORS is enabled on backend

## Advanced Debugging

### Check if content script is injected

**On LinkedIn, paste this in console:**
```javascript
// Check if our notification styles are injected
const recollectStyles = Array.from(document.styleSheets)
  .find(sheet => sheet.ownerNode?.textContent?.includes('recollect-notification'));

console.log('Recollect styles injected:', !!recollectStyles);
```

Should return `true`.

### Manually trigger menu injection

**On LinkedIn, paste this in console:**
```javascript
// Simulate opening a menu to trigger our observer
const button = document.querySelector('button[aria-label*="menu"]');
if (button) {
  button.click();
  console.log('Clicked menu button - check dropdown for "Save to Recollect"');
} else {
  console.log('No menu button found');
}
```

### Check Chrome storage

**In console:**
```javascript
chrome.storage.local.get(null, (items) => {
  console.log('Chrome storage:', items);
});
```

Should show stored data like `currentVideoUrl` when on a video page.

## Logs to Share for Support

If nothing works, collect these logs:

1. **Extension manifest:**
   ```bash
   cat dist/manifest.json
   ```

2. **Console logs from LinkedIn:**
   - Screenshot of console after refreshing LinkedIn

3. **Service worker console:**
   - Open service worker inspector
   - Screenshot of console

4. **Extension errors:**
   - Go to `chrome://extensions/`
   - Click "Errors" button if visible
   - Screenshot any errors

## Testing Checklist

- [ ] Extension installed in `chrome://extensions/`
- [ ] Extension toggle is ON
- [ ] Extension icon pinned in toolbar
- [ ] LinkedIn page refreshed after installing
- [ ] Console shows `[Recollect] LinkedIn content script loaded`
- [ ] Three-dot menu clicked on a LinkedIn post
- [ ] "Save to Recollect" option visible in menu
- [ ] Clicking option saves the post
- [ ] Green notification appears
- [ ] Extension popup opens when clicking icon
- [ ] YouTube/Instagram URLs auto-fill in popup

## Still Not Working?

If content scripts aren't loading at all:

1. **Rebuild the extension:**
   ```bash
   cd recollect-extension
   npm run build
   ```

2. **Reload extension in Chrome:**
   - Go to `chrome://extensions/`
   - Click refresh icon ↻ on Recollect extension

3. **Hard refresh pages:**
   - Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

4. **Check permissions:**
   - Click extension details
   - Scroll to "Site access"
   - Should show "On specific sites" with LinkedIn, YouTube, etc.
   - Try changing to "On all sites" (for testing only)

5. **Try incognito mode:**
   - Right-click extension icon
   - Click "Manage extension"
   - Enable "Allow in incognito"
   - Test in incognito window
