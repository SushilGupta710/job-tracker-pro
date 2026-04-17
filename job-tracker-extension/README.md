# Job Tracker Pro Chrome Extension

A seamless Chrome extension for saving and tracking job opportunities from any job listing website.

## Features

✨ **Floating Button** - Click the floating icon on any job listing page to quickly save jobs
📋 **Auto-Fill Form** - Automatically extracts job details from the page
🔐 **Secure Login** - Sign in with your Job Tracker Pro account
💾 **Instant Save** - Save jobs with a single click to your dashboard
🔄 **Real-time Sync** - Data syncs instantly with your main dashboard
🎨 **Lightweight Design** - Minimal CSS conflicts with existing websites
🌙 **Dark Mode Ready** - Works seamlessly on any website theme

## Installation

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `job-tracker-extension` folder
5. The extension icon appears in your Chrome toolbar

## Supported Job Sites

The extension automatically detects job listing pages on:
- LinkedIn Jobs
- Indeed
- Lever
- Greenhouse
- Glassdoor
- AngelList
- Monster
- Dice
- And any page with job-related keywords

## How to Use

### 1. Login
- Click the extension icon in your Chrome toolbar
- Enter your Job Tracker Pro credentials
- Click "Sign In"

### 2. Save Jobs
- Visit any job listing page
- A floating "Save Job" button appears on the right side
- Click it to open the slider
- Fill in the job details (auto-populated when possible)
- Click "Save to Tracker"

### 3. Manage Saved Jobs
- Click "Dashboard" button to see all saved jobs
- Or access your dashboard through the main app
- All jobs saved from the extension appear with Source: Extension

## File Structure

```
job-tracker-extension/
├── manifest.json          # Extension configuration
├── content.js            # Floating button & slider logic
├── popup.html            # Popup login interface
├── popup.js              # Login functionality
├── background.js         # Service worker for API calls
├── styles.css            # Scoped CSS (CSS wrapper classes)
├── icons/
│   └── main-logo.png     # Extension logo
└── README.md             # This file
```

## Key Technical Details

### CSS Isolation
All extension UI elements are wrapped with the `.jt-wrapper` class to prevent CSS conflicts with existing website styles. Inline styles are used extensively to avoid Tailwind CSS or other CSS framework conflicts.

### Shadow DOM
The extension uses Chrome's Shadow DOM to fully isolate its UI from the page's DOM, preventing:
- CSS cascading conflicts
- JavaScript DOM conflicts
- Style overrides from existing websites

### Data Storage
- **Authentication Token**: Stored in `chrome.storage.local`
- **User Info**: Stored in `chrome.storage.local`
- **Source ID**: All jobs saved with `source_id: 2` (for extension tracking)

### API Integration
- **Login**: `POST /api/auth/signin`
- **Save Job**: `POST /api/jobs/create` with `source_id: 2`
- Backend URL: `https://smart-job-tracker-api-w44d.onrender.com/api`
- Main App URL: `http://localhost:4200`

## Customization

### Add More Job Keywords
Edit `content.js` and add keywords to the `JOB_KEYWORDS` array:
```javascript
const JOB_KEYWORDS = [
    'job', 'position', 'career', 'hiring', 'vacancy',
    // Add more keywords here
];
```

### Add More Job Sites
Edit `content.js` and add domains to the `JOB_SITES` array:
```javascript
const JOB_SITES = [
    'linkedin.com',
    'indeed.com',
    // Add more sites here
];
```

### Change Branding Colors
Update hex colors in:
- `popup.html` - Change `#2563eb` (blue) and other colors
- `content.js` - Update colors in inline styles

## Troubleshooting

### Extension not showing on job pages?
- Check if the page has job-related keywords
- Try adding the site to `JOB_SITES` array in `content.js`
- Reload the extension from `chrome://extensions/`

### Login fails?
- Verify your credentials are correct
- Check if the backend API is running (`http://localhost:3000`)
- Check browser console for error details

### Jobs not saving?
- Ensure Company Name and Job Title are filled
- Check network tab for API response errors
- Verify authentication token is stored (`chrome://extensions/` → Details → Storage)

## Security Considerations

⚠️ **Important**: This extension stores authentication tokens locally. 
- Tokens are stored in `chrome.storage.local` (browser storage)
- Only use trusted machines
- Tokens expire based on your backend configuration
- Clear data when sharing devices

## Future Enhancements

- 📧 Email notifications for saved jobs
- 🔔 Keyword alerts for specific job types
- 📊 Stats dashboard in extension popup
- 🏷️ Job tagging system
- 💬 Notes & comments on saved jobs
- 🔗 LinkedIn/Indeed integration for auto-fulfillment

## Support

For issues or feature requests, contact the development team or open an issue in the repository.

---

**Version**: 1.0  
**Last Updated**: April 2026  
Made with ❤️ for job seekers
