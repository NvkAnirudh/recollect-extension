# Recollect Extension - Chrome Web Store Pre-Publication Checklist

## ✅ Phase 1: Core Functionality Testing

### Authentication
- [ ] Sign in via extension popup works
- [ ] Sign in via http://localhost:3000/extension-sync.html works
- [ ] Extension detects when user signs out
- [ ] "✓ Signed in" appears when authenticated
- [ ] "Not logged in? Sign in" appears when not authenticated
- [ ] Sign-in link redirects to correct page
- [ ] Token persists after browser restart
- [ ] Invalid/expired tokens are cleared properly

### Content Saving - LinkedIn
- [ ] Recollect icon appears on LinkedIn posts
- [ ] Icon doesn't appear multiple times (no duplicates)
- [ ] Clicking icon when not signed in opens sign-in page
- [ ] Clicking icon when signed in saves the post
- [ ] Success toast notification appears
- [ ] Error toast notification appears on failure
- [ ] Post URL is correctly extracted
- [ ] Keyboard shortcut (Ctrl/Cmd+Shift+S) works

### Content Saving - Instagram
- [ ] Extension detects Instagram reels
- [ ] Content script loads properly
- [ ] Save functionality works

### Content Saving - YouTube
- [ ] Extension detects YouTube videos
- [ ] Content script loads properly
- [ ] Save functionality works

### Content Saving - TikTok
- [ ] Extension detects TikTok videos
- [ ] Content script loads properly
- [ ] Save functionality works

### Extension Popup
- [ ] Popup opens correctly
- [ ] Current tab URL is detected
- [ ] Platform is correctly identified (Instagram/YouTube/LinkedIn/TikTok)
- [ ] "Save to Library" button works
- [ ] Loading state shows spinner
- [ ] Success state shows checkmark
- [ ] Error state shows error message with retry
- [ ] Authentication error shows "Sign In" button
- [ ] Popup closes after successful save

### Context Menu
- [ ] Right-click menu appears on supported platforms
- [ ] "Save to Recollect" option is visible
- [ ] Clicking menu item saves content
- [ ] Works when right-clicking on links
- [ ] Works when right-clicking on page

---

## ✅ Phase 2: Error Handling & Edge Cases

### Network Issues
- [ ] Handles offline mode gracefully
- [ ] Shows appropriate error when API is down
- [ ] Timeout errors are handled
- [ ] Network errors show retry option

### Authentication Errors
- [ ] 401 errors clear invalid token
- [ ] User is prompted to sign in again
- [ ] Extension doesn't crash on auth failure

### Invalid URLs
- [ ] Handles unsupported URLs gracefully
- [ ] Shows appropriate error messages
- [ ] Doesn't break on special characters in URLs

### Edge Cases
- [ ] Works on very long posts/captions
- [ ] Handles posts without URLs
- [ ] Works with LinkedIn carousel posts
- [ ] Works with LinkedIn video posts
- [ ] Handles rate limiting from API
- [ ] Multiple rapid clicks don't cause duplicates

---

## ✅ Phase 3: Security & Privacy

### Data Handling
- [ ] Tokens are stored securely in chrome.storage.local
- [ ] No sensitive data in console logs (production build)
- [ ] No API keys exposed in code
- [ ] HTTPS is used for all API calls
- [ ] User data is not shared with third parties

### Permissions
- [ ] Only necessary permissions are requested
- [ ] Host permissions are minimal and justified
- [ ] Storage permission is necessary
- [ ] activeTab permission is necessary

### Content Security
- [ ] No eval() or unsafe-eval
- [ ] No inline scripts in HTML
- [ ] CSP compliant
- [ ] No external scripts loaded

---

## ✅ Phase 4: Chrome Web Store Compliance

### Manifest.json Requirements
- [ ] manifest_version: 3 ✅
- [ ] Name is descriptive and follows guidelines
- [ ] Description clearly explains functionality
- [ ] Version follows semantic versioning
- [ ] Icons are provided in all sizes (16, 32, 48, 128)
- [ ] Permissions are justified
- [ ] Host permissions are specific
- [ ] No broad host permissions (<all_urls>)
- [ ] action (popup) is configured
- [ ] background service worker is registered

### Store Listing Assets Needed
- [ ] Extension icon (128x128 PNG) - transparent background
- [ ] Small promo tile (440x280 PNG) - for store listing
- [ ] Screenshots (1280x800 or 640x400 PNG) - at least 1, max 5
  - [ ] Screenshot 1: LinkedIn post with Recollect icon
  - [ ] Screenshot 2: Extension popup
  - [ ] Screenshot 3: Success state
  - [ ] Screenshot 4: Authentication screen
  - [ ] Screenshot 5: Multiple platforms view
- [ ] Detailed description (max 16,000 characters)
- [ ] Short description (max 132 characters)
- [ ] Category: Productivity
- [ ] Language: English

### Privacy Policy Requirements
- [ ] Privacy policy URL is provided
- [ ] Policy explains data collection
- [ ] Policy explains data usage
- [ ] Policy explains data storage
- [ ] Policy mentions third-party services (if any)
- [ ] Policy is accessible and readable

### Content Policy Compliance
- [ ] No spam or deceptive behavior
- [ ] No copyright violations
- [ ] No keyword stuffing in description
- [ ] No misleading claims
- [ ] Proper attribution for open source code
- [ ] No hate speech or offensive content
- [ ] No malware or harmful code

---

## ✅ Phase 5: User Experience

### Visual Design
- [ ] Icons are clear and recognizable
- [ ] Colors are consistent with brand
- [ ] Text is readable
- [ ] Buttons are clearly labeled
- [ ] Spacing and padding are appropriate
- [ ] Dark mode compatibility (if applicable)

### Performance
- [ ] Extension loads quickly
- [ ] No noticeable lag when clicking icons
- [ ] Doesn't slow down web pages
- [ ] Memory usage is reasonable
- [ ] No memory leaks on long sessions

### Accessibility
- [ ] All buttons have aria-labels
- [ ] Images have alt text
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG standards

### Internationalization (Future)
- [ ] English strings are clear and grammatical
- [ ] Placeholder for i18n support
- [ ] UI supports different text lengths

---

## ✅ Phase 6: Documentation & Support

### README.md
- [ ] Installation instructions
- [ ] Usage guide
- [ ] Feature list
- [ ] Screenshots
- [ ] Troubleshooting section
- [ ] Support contact information

### Support Resources
- [ ] Support email or form
- [ ] FAQ section
- [ ] Known issues documented
- [ ] Roadmap for future features

---

## ✅ Phase 7: Production Readiness

### Code Quality
- [ ] No console.log in production (or minimal)
- [ ] All TypeScript errors resolved
- [ ] Webpack build completes without warnings
- [ ] Code is minified
- [ ] Source maps are excluded from build

### Testing Environments
- [ ] Works on Chrome (latest version)
- [ ] Works on Edge (Chromium-based)
- [ ] Works on different OS (Windows, Mac, Linux)
- [ ] Works with different screen sizes

### Version Management
- [ ] Version number updated in manifest.json
- [ ] CHANGELOG.md created
- [ ] Git tags for version

### Distribution Package
- [ ] dist/ folder is clean
- [ ] No unnecessary files in package
- [ ] manifest.json in root of dist/
- [ ] Total size is reasonable (<5MB recommended)
- [ ] ZIP file created for upload

---

## ✅ Phase 8: Pre-Submission Final Checks

### Chrome Web Store Developer Dashboard
- [ ] Developer account is verified ($5 fee paid)
- [ ] Payment information added (if monetizing)
- [ ] Account in good standing

### Legal & Compliance
- [ ] Terms of Service reviewed
- [ ] Privacy Policy completed
- [ ] Developer Program Policies reviewed
- [ ] No prohibited content

### Final Testing
- [ ] Fresh install test on clean Chrome profile
- [ ] Test all major flows one more time
- [ ] Verify no errors in console
- [ ] Check extension size
- [ ] Test update mechanism (for future updates)

---

## 🚀 Submission Checklist

- [ ] ZIP the dist/ folder
- [ ] Upload to Chrome Web Store Developer Dashboard
- [ ] Fill in store listing details
- [ ] Upload screenshots and promotional images
- [ ] Add privacy policy URL
- [ ] Select category and language
- [ ] Set pricing (free or paid)
- [ ] Submit for review
- [ ] Monitor submission status
- [ ] Respond to any review feedback

---

## 📝 Post-Publication

- [ ] Monitor user reviews
- [ ] Track error reports
- [ ] Set up analytics (optional)
- [ ] Plan for updates
- [ ] Create support documentation
- [ ] Market the extension

---

## ⚠️ Common Rejection Reasons to Avoid

1. **Broad host permissions** - We use specific domains ✅
2. **Missing privacy policy** - Need to create
3. **Unclear description** - Need to write clear copy
4. **Low-quality screenshots** - Need high-res images
5. **Keyword stuffing** - Keep description natural
6. **Deceptive functionality** - Be honest about features
7. **Violating third-party APIs** - We only scrape public content
8. **Missing icons** - We have all sizes ✅

---

## 🎯 Priority Issues to Fix Before Submission

### CRITICAL (Must Fix)
1. ⚠️ Update localhost URLs to production URLs (localhost:3000, localhost:8080)
2. ⚠️ Create Privacy Policy
3. ⚠️ Add production API endpoint configuration
4. ⚠️ Remove/minimize console.log statements
5. ⚠️ Test with production backend

### HIGH (Should Fix)
1. Add error tracking (Sentry, etc.)
2. Add analytics (optional, with user consent)
3. Optimize icon sizes
4. Add rate limiting protection
5. Better error messages

### MEDIUM (Nice to Have)
1. Add more platforms (Twitter, Reddit)
2. Add keyboard shortcuts customization
3. Add bulk save feature
4. Add export functionality
5. Add search within extension

---

**Current Status**: Development Build
**Target**: Production Ready for Chrome Web Store
**Estimated Time to Production**: 2-4 hours (after fixing critical items)
