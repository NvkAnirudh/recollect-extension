# IMMEDIATE FIX - Token Sync Issue

## Problem
1. webapp-sync.js not loading on localhost:3000 (Chrome localhost bug)
2. Need to verify authentication is actually blocking saves

## Quick Test - Verify Auth is Working

### Step 1: Clear the Token
1. Open extension popup (click Recollect icon)
2. Right-click → Inspect
3. In Console, run:
```javascript
chrome.storage.local.clear(() => console.log('Token cleared'));
```

### Step 2: Try to Save (Should FAIL)
1. Go to LinkedIn
2. Click a Recollect icon on any post
3. **Expected:** Toast message "Click to sign in" + opens sign-in page
4. **If it saves:** Authentication is broken

### Step 3: Manually Add Token to Extension
1. Go to http://localhost:3000 in a new tab
2. Sign in if not already signed in
3. Open DevTools Console (F12)
4. Run this to get your token:
```javascript
const token = localStorage.getItem('token') || localStorage.getItem('access_token');
console.log('Your token:', token);
// Copy this token
```

5. Click Recollect extension icon
6. Right-click on popup → Inspect
7. In Console, run (paste your token):
```javascript
chrome.storage.local.set({ token: 'PASTE_YOUR_TOKEN_HERE' }, () => {
  console.log('Token manually set!');
});
```

### Step 4: Try to Save Again (Should WORK)
1. Go to LinkedIn
2. Click a Recollect icon on any post
3. **Expected:** Should save successfully

## If Authentication is Broken
If you can save without a token in Step 2, there's a bug in the code that needs immediate fixing.

## If webapp-sync Still Doesn't Load
Chrome has issues with content scripts on localhost. We'll implement a different solution:
- Add a "Login with Recollect Web" button in the popup
- Or use Extension messaging API instead of content scripts
