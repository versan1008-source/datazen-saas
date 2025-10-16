# DataZen Browser Extension

A powerful Chrome extension for extracting data from websites with AI-powered analysis.

## Features

- **Extract Text**: Get all text content from a webpage
- **Extract Links**: Collect all URLs from a page
- **Extract Images**: Download image URLs
- **Extract Emails**: Find all email addresses
- **AI Enhancement**: Use AI to structure and analyze extracted data
- **Quick Actions**: Copy, download, or send data to DataZen dashboard

## Installation

### For Development

1. Clone the repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the `extension` folder
6. The extension will appear in your Chrome toolbar

### For Users

The extension will be available on the Chrome Web Store (coming soon).

## Usage

1. Click the DataZen icon in your Chrome toolbar
2. Enter a website URL or use the current page
3. Select what data you want to extract:
   - Text
   - Links
   - Images
   - Emails
4. Optionally enable "Use AI Enhancement" for smarter analysis
5. Click "Scrape Current Page" or "Scrape URL"
6. View results and choose to:
   - Copy to clipboard
   - Download as text file
   - Send to DataZen dashboard

## How It Works

### Current Page Scraping
- Uses content scripts to extract data directly from the page
- No server request needed
- Instant results
- Works offline

### URL Scraping
- Sends request to DataZen backend API
- Backend fetches and analyzes the page
- Returns structured data
- Supports AI enhancement

## File Structure

```
extension/
├── manifest.json       # Extension configuration
├── popup.html         # Popup UI
├── popup.css          # Popup styles
├── popup.js           # Popup logic
├── content.js         # Content script for page extraction
├── background.js      # Background service worker
├── images/            # Extension icons
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── README.md          # This file
```

## Configuration

Update the API URL in `popup.js`:

```javascript
const API_URL = 'https://api.versan.in'; // Change this to your backend URL
```

## Permissions

The extension requests the following permissions:

- `activeTab`: Access current tab information
- `scripting`: Run content scripts on pages
- `storage`: Store user settings
- `webRequest`: Monitor web requests
- `<all_urls>`: Access all websites

## Privacy

- Data is extracted locally when using "Scrape Current Page"
- Only sent to DataZen servers when using "Scrape URL" or "Send to DataZen"
- No tracking or analytics
- Respects website robots.txt

## Support

For issues or feature requests, visit: https://versan.in/contact

## License

MIT License - See LICENSE file for details

