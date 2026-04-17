# Quick Start Guide - Phase 2 Extension

## 📱 Installation (5 minutes)

### Step 1: Load Extension
1. Open `chrome://extensions/`
2. Toggle "Developer mode" (top right)
3. Click "Load unpacked"
4. Select `/job-tracker-extension` folder
5. ✅ Extension loaded!

### Step 2: Verify Installation
- Look for extension icon in Chrome toolbar
- Should show "Job Tracker Pro" on hover
- No errors in `chrome://extensions/` page

### Step 3: Login
1. Click extension icon
2. Enter your Job Tracker credentials
3. Click "Sign In"
4. ✅ Ready to save jobs!

---

## 🎯 How It Works

### A. Detect Job Page
- You visit LinkedIn, Indeed, or any job site
- Extension detects job keywords/sites
- Floating button appears on right side

### B. Click to Open
- Click floating "Save Job" button
- Right sidebar slider opens
- Shows login or job save form

### C. Fill & Save
- Form auto-fills job details from page
- Edit any fields if needed
- Click "Save to Tracker"
- ✅ Job saved instantly!

---

## ⚙️ Configuration

### Change API Endpoints
**File**: `content.js` & `popup.js`

Find and update:
```javascript
// For production
'https://smart-job-tracker-api-w44d.onrender.com/api'     → 'https://yourdomain.com/api'
'http://localhost:4200/dashboard' → 'https://yourdomain.com/dashboard'
```

### Add More Job Keywords
**File**: `content.js`

```javascript
const JOB_KEYWORDS = [
    'job', 'position', 'career', // existing
    'internship', 'apprentice'   // add more
];
```

### Add More Job Sites
**File**: `content.js`

```javascript
const JOB_SITES = [
    'linkedin.com', 'indeed.com', // existing
    'totaljobs.com', 'reed.co.uk'  // add more
];
```

### Change Colors
**File**: `content.js`

Look for hex colors and update:
- `#2563eb` → Blue (primary)
- `#10b981` → Green (save button)
- `#ef4444` → Red (logout)

---

## 🧪 Testing Checklist

### Basic Functionality
- [ ] Extension loads without errors
- [ ] Click icon opens popup
- [ ] Login page appears
- [ ] Can log in with valid credentials
- [ ] Dashboard button works

### Job Page Detection
- [ ] Visit LinkedIn Jobs → button appears
- [ ] Visit Indeed → button appears
- [ ] Visit Lever → button appears
- [ ] Visit Greenhouse → button appears
- [ ] Any job page with keywords → button appears

### Form Testing
- [ ] Click floating button → slider opens
- [ ] Job title auto-filled correctly
- [ ] Company name auto-filled correctly
- [ ] Location field editable
- [ ] URL field shows current page
- [ ] Description field accepts text

### Save Job Testing
- [ ] Click "Save to Tracker" → success message
- [ ] Job appears in dashboard
- [ ] Opening slider again shows cleared form
- [ ] Can save multiple jobs in sequence

### Error Handling
- [ ] Try save without company name → error message
- [ ] Try save without logged in → error message
- [ ] Network error shows user-friendly message

### Logout Testing
- [ ] Click logout in slider → logged out
- [ ] Popup shows login form again
- [ ] Credentials cleared
- [ ] Can log back in

---

## 🐛 Troubleshooting

### Issue: Extension not appearing on job pages

**Solution**:
1. Make sure you're on a job site or page with job keywords
2. Reload the page (Ctrl+R)
3. Check if `JOB_SITES` includes the domain
4. Reload extension from `chrome://extensions/`

### Issue: Login fails

**Solution**:
1. Verify email/password are correct
2. Check backend API is running (`https://smart-job-tracker-api-w44d.onrender.com/api`)
3. Open browser console (F12) → Console tab → check errors
4. Verify manifest.json has correct host permissions

### Issue: Form fields won't save

**Solution**:
1. Ensure Company Name and Job Title are filled
2. Check if logged in (should show form, not login)
3. Verify backend API token is valid
4. Open Network tab (F12) → check API response

### Issue: Slider looks broken/overlapped

**Solution**:
1. Hard reload page (Ctrl+Shift+R)
2. Clear browser cache
3. Reload extension from chrome://extensions/
4. Try on different page (CSS might conflict)

### Issue: Can't see text in slider

**Solution**:
1. Text color is sky blue (#0ea5e9) - should be visible
2. Check if website's CSS is affecting it
3. Try on different website
4. Check browser console for CSS warnings

---

## 📊 Testing on Popular Sites

### LinkedIn
```
✅ Works well
✅ Auto-fills job title
✅ Auto-fills company name
⚠️  May need to scroll past mobile prompt
```

### Indeed
```
✅ Works well
✅ Auto-fills most fields
⚠️  Job description might be long
```

### Lever
```
✅ Best experience
✅ Clean job pages
✅ Auto-fills accurately
```

### Greenhouse
```
✅ Works well
✅ Consistent formatting
✅ Auto-fills all fields
```

---

## 🔐 Security Notes

⚠️ **Important**:
- Token stored in `chrome.storage.local` (browser storage)
- Don't share device while logged in
- Logout when done using extension
- Clear data from chrome://extensions/ if needed

---

## 📝 File Overview

```
manifest.json          ← Extension configuration
├─ Permissions & API routes

content.js            ← Main logic (Floating button, form, save)
├─ Job detection
├─ Slider UI
├─ Form handling

popup.html/popup.js   ← Login interface
├─ User authentication
├─ Session management

background.js         ← Service worker
├─ API communication
└─ Token management

icons/main-logo.png   ← Logo image
README.md             ← Full documentation
PHASE2_IMPLEMENTATION.md ← Implementation details
```

---

## 🚀 Deployment Checklist

Before going live:

### Backend Requirements
- [ ] API running on correct endpoint
- [ ] CORS enabled for extension origin
- [ ] `/api/auth/signin` endpoint works
- [ ] `/api/jobs/create` endpoint works
- [ ] Auth token validation works

### Extension Requirements
- [ ] Update API endpoint if not localhost
- [ ] Update app dashboard URL if needed
- [ ] Test on required job sites
- [ ] Add proper extension icon
- [ ] Remove console.log statements
- [ ] Test error scenarios

### Chrome Web Store (if publishing)
- [ ] Create privacy policy
- [ ] Add screenshots
- [ ] Write description
- [ ] Test on multiple Chrome versions
- [ ] Get proper permissions approval

---

## 💡 Tips

1. **Keyboard Shortcut**: Assign hotkey in chrome://extensions/ for quick access
2. **Multiple Accounts**: Use different Chrome profiles for different accounts
3. **Debugging**: Press F12 on extension popup to see developer tools
4. **Testing**: Use mock job pages with job keywords to test
5. **Updates**: Just reload from chrome://extensions/ after code changes

---

## 📞 Support

### Common Questions

**Q: Can I use this on multiple browsers?**
A: Currently Chrome only. Firefox version coming soon.

**Q: Does it work offline?**
A: No, requires internet connection to save to backend.

**Q: Can I customize the form?**
A: Yes! Edit `content.js` to add/remove form fields.

**Q: How many jobs can I save?**
A: Limited by your backend storage capacity.

**Q: Is the token secure?**
A: It's in browser storage - only on your device. Use HTTPS for all communications.

---

## Version Info
**Extension Version**: 1.0  
**Last Updated**: April 2026  
**Tested on**: Chrome 90+

---

Ready to test? Follow the Quick Start steps above! 🎉
