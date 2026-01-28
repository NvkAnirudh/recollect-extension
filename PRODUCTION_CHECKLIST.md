# 🚀 Recollect Extension - Production Launch Checklist

## ⚠️ CRITICAL - Must Fix Before Submission

### 1. Update Production URLs
**Current Issue**: Extension uses localhost URLs
**Required Changes**:

```javascript
// In all files, replace:
http://localhost:3000 → https://app.recollect.com (or your domain)
http://localhost:8080 → https://api.recollect.com (or your API domain)
```

**Files to Update**:
- [ ] `src/popup/Popup.tsx` (line 45, 78)
- [ ] `src/background/service-worker.ts` (line 5)
- [ ] `src/content/linkedin.ts` (any localhost references)
- [ ] `public/extension-sync.html`
- [ ] Rebuild after changes

### 2. Environment Configuration
Create a config file for easy environment switching:

```typescript
// src/config.ts
export const config = {
  API_URL: process.env.NODE_ENV === 'production'
    ? 'https://api.recollect.com'
    : 'http://localhost:8080',
  WEB_APP_URL: process.env.NODE_ENV === 'production'
    ? 'https://app.recollect.com'
    : 'http://localhost:3000',
};
```

### 3. Privacy Policy URL
- [ ] Host PRIVACY_POLICY.md on your website
- [ ] Add URL to manifest.json (optional but recommended)
- [ ] Add URL to Chrome Web Store listing

### 4. Clean Up Console Logs
**Priority**: High
**Action**: Remove or wrap in development checks

```typescript
// Replace all console.log with:
if (process.env.NODE_ENV === 'development') {
  console.log('[Recollect]', ...);
}
```

### 5. Update manifest.json
```json
{
  "name": "Recollect - Save Social Media Content",
  "version": "1.0.0",
  "description": "Save and organize content from LinkedIn, Instagram, YouTube, and TikTok with AI-powered search."
}
```

---

## 📋 Chrome Web Store Requirements

### Developer Account Setup
- [ ] Create Chrome Web Store Developer account ($5 one-time fee)
- [ ] Verify email address
- [ ] Add payment method (if monetizing)

### Required Assets

#### 1. Icons ✅ (Already Done)
- [x] icon16.png
- [x] icon32.png
- [x] icon48.png
- [x] icon128.png

#### 2. Screenshots (Need to Create)
Create 5 screenshots (1280x800 recommended):

**Screenshot 1: LinkedIn Integration**
- Show LinkedIn feed with Recollect icon on a post
- Highlight the icon with an arrow or circle
- Caption: "Save LinkedIn posts with one click"

**Screenshot 2: Extension Popup**
- Show the popup interface
- Display the "Save to Library" button
- Caption: "Simple and intuitive save interface"

**Screenshot 3: Multi-Platform Support**
- Show icons on different platforms (montage)
- Caption: "Works on LinkedIn, Instagram, YouTube, and TikTok"

**Screenshot 4: Authentication**
- Show the "✓ Signed in" status
- Caption: "Secure authentication keeps your content private"

**Screenshot 5: Success State**
- Show the success notification
- Caption: "Get instant confirmation when content is saved"

#### 3. Promotional Images (Optional but Recommended)

**Small Promo Tile** (440x280):
```
Recollect Logo (center)
"Never lose great content again"
"Save • Organize • Search"
```

**Large Promo Tile** (920x680):
```
Recollect Logo
"Your Personal Social Media Library"
Features list
Call to action
```

---

## 🔧 Technical Pre-Submission Tasks

### Code Quality
- [ ] Run TypeScript type checking: `npm run type-check`
- [ ] Build without errors: `npm run build`
- [ ] Check bundle size (should be < 5MB)
- [ ] Minify and optimize images
- [ ] Remove source maps from production build

### Testing
- [ ] Test on fresh Chrome profile
- [ ] Test on Windows (if possible)
- [ ] Test on Mac (if possible)
- [ ] Test on Linux (if possible)
- [ ] Test all major user flows
- [ ] Verify no console errors
- [ ] Check memory usage

### Security Review
- [ ] No hardcoded API keys or secrets
- [ ] All API calls use HTTPS
- [ ] Tokens stored securely
- [ ] No unsafe-eval or inline scripts
- [ ] Content Security Policy compliant

---

## 📝 Documentation Tasks

### README.md
Create comprehensive README with:
- [ ] Installation instructions
- [ ] Features list
- [ ] Screenshots
- [ ] Usage guide
- [ ] Troubleshooting
- [ ] Support information
- [ ] Contribution guidelines (if open source)

### CHANGELOG.md
- [ ] Document version 1.0.0 features
- [ ] List all included functionality
- [ ] Note known limitations

---

## 🌐 Backend Preparation

### API Server
- [ ] Deploy backend to production
- [ ] Configure CORS for production domains
- [ ] Set up SSL certificates
- [ ] Test API endpoints
- [ ] Set up error logging
- [ ] Configure rate limiting

### Database
- [ ] Production database setup
- [ ] Backup strategy in place
- [ ] Migration scripts tested

### Web Application
- [ ] Deploy web app to production
- [ ] Test sign-in flow
- [ ] Test extension sync page
- [ ] Verify all URLs

---

## 📤 Submission Process

### 1. Prepare Package
```bash
cd recollect-extension
npm run build
cd dist
zip -r ../recollect-extension-v1.0.0.zip .
```

### 2. Chrome Web Store Dashboard
1. Go to Chrome Web Store Developer Dashboard
2. Click "Add New Item"
3. Upload ZIP file
4. Fill in store listing:
   - Name
   - Summary (short description)
   - Detailed description
   - Category: Productivity
   - Language: English
5. Upload screenshots
6. Upload promotional images
7. Add privacy policy URL
8. Select regions (Worldwide recommended)
9. Set pricing (Free)
10. Submit for review

### 3. Review Timeline
- **Initial Review**: 1-3 days typically
- **Follow-up**: Respond within 24 hours if rejected
- **Publication**: Immediate after approval

---

## 🎯 Day-of-Launch Checklist

### Morning of Launch
- [ ] Verify production backend is running
- [ ] Check database connections
- [ ] Test end-to-end flow
- [ ] Prepare support email
- [ ] Have monitoring dashboards ready

### After Submission
- [ ] Monitor submission status
- [ ] Check email for Chrome team feedback
- [ ] Be ready to make quick fixes
- [ ] Prepare announcement posts

### After Approval
- [ ] Test published extension
- [ ] Announce on social media
- [ ] Update website with extension link
- [ ] Monitor user feedback
- [ ] Watch for crash reports

---

## 📊 Post-Launch Monitoring

### Week 1
- [ ] Daily check of reviews
- [ ] Monitor error rates
- [ ] Track installation numbers
- [ ] Collect user feedback
- [ ] Fix critical bugs immediately

### Week 2-4
- [ ] Analyze usage patterns
- [ ] Plan first update
- [ ] Respond to all reviews
- [ ] Update documentation based on feedback

---

## 🚨 Emergency Rollback Plan

If critical issues are found:
1. Unpublish extension immediately
2. Fix the issue
3. Submit update
4. Notify affected users

---

## ✅ Quick Start Production Build

```bash
# 1. Update all localhost URLs to production
# 2. Clean build
npm run build

# 3. Test locally one more time
# Load dist/ folder in chrome://extensions

# 4. Create package
cd dist
zip -r ../recollect-v1.0.0.zip .
cd ..

# 5. Upload to Chrome Web Store
```

---

## 📞 Support Setup

**Before Launch**:
- [ ] Set up support email: support@recollect.com
- [ ] Create FAQ page
- [ ] Prepare canned responses for common questions
- [ ] Set up issue tracking system

---

**Estimated Time to Production**: 4-6 hours
**Dependencies**: Production backend deployment

**Next Steps**:
1. Deploy backend to production
2. Update URLs in extension
3. Create screenshots
4. Submit to Chrome Web Store
