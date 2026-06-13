# YouTube Learning Notes Saver - Chrome Extension

A powerful Chrome extension designed to enhance the online learning experience by allowing users to take timestamped notes while watching YouTube videos.

## Features

- 📝 **Timestamped Notes**: Automatically captures video time when taking notes
- 🎯 **Quick Navigation**: Click timestamps to jump to specific video segments
- 💾 **Local Storage**: Notes saved locally in your browser
- 🔍 **Search Functionality**: Find specific notes quickly
- 📤 **Export Notes**: Download notes in text format
- 🎨 **User-Friendly Interface**: Clean and intuitive design
- ⌨️ **Keyboard Shortcuts**: Ctrl+S to save, Ctrl+E to export

## Installation

### Prerequisites
- Google Chrome browser (version 88 or later)
- Internet connection for YouTube access

### Step-by-Step Installation

1. **Download the Extension Files**
   - Download all extension files to a folder on your computer
   - Ensure you have all files: `manifest.json`, `popup.html`, `popup.css`, `popup.js`, `content.js`, and icon files

2. **Enable Developer Mode in Chrome**
   - Open Google Chrome
   - Navigate to `chrome://extensions`
   - Enable "Developer mode" using the toggle in the top-right corner

3. **Load the Extension**
   - Click the "Load unpacked" button
   - Select the folder containing your extension files
   - The extension will now appear in your extensions list

4. **Pin the Extension** (Optional)
   - Click the puzzle icon in the Chrome toolbar
   - Find "YouTube Learning Notes Saver" and click the pin icon
   - The extension icon will now appear in your toolbar

## Usage Guide

### Taking Notes

1. **Open a YouTube Video**
   - Navigate to any YouTube video you want to study

2. **Open the Extension**
   - Click the extension icon in your Chrome toolbar
   - The notes popup will appear

3. **Take a Note**
   - Type your note in the text area
   - Click "💾 Save Note" or press Ctrl+S
   - The current video timestamp is automatically captured

4. **Navigate to Timestamps**
   - Click on any timestamp in your notes list
   - The video will automatically jump to that time

### Managing Notes

- **Search Notes**: Use the search bar to find specific content
- **Delete Notes**: Click the 🗑️ icon next to any note
- **Export Notes**: Click "📤 Export" to download all notes as a text file
- **Clear All**: Click "🗑️ Clear All" to remove all notes for current video

### Keyboard Shortcuts

- `Ctrl + S`: Save current note
- `Ctrl + E`: Export all notes
- `Escape`: Clear note input
- `Alt + T` (on YouTube page): Copy current timestamp to clipboard

## File Structure

```
YouTube Learning Notes Saver/
├── manifest.json          # Extension configuration
├── popup.html            # Main popup interface
├── popup.css             # Popup styling
├── popup.js              # Popup functionality
├── content.js            # YouTube integration
├── icon16.png            # 16x16 icon
├── icon48.png            # 48x48 icon
├── icon128.png           # 128x128 icon
├── README.md             # This file
└── PROJECT_DOCUMENTATION.md  # Academic documentation
```

## Technical Details

### Chrome Extension Architecture

The extension follows Chrome Extension Manifest V3 standards:

- **Manifest Version 3**: Latest Chrome extension format
- **Content Scripts**: Injected into YouTube pages for video integration
- **Popup Interface**: User-friendly interface for note management
- **Local Storage**: Secure storage for user notes

### Data Storage

- Notes are stored using Chrome's `storage.local` API
- Each video's notes are stored with key: `youtube_notes_{videoId}`
- Storage format: JSON array of note objects

### Note Object Structure

```javascript
{
  id: "unique_timestamp_id",
  timestamp: 123.45,           // Video time in seconds
  content: "Note text here",    // User's note content
  videoId: "youtube_video_id",
  videoTitle: "Video Title",
  videoUrl: "https://youtube.com/watch?v=...",
  createdAt: "2024-01-15T10:30:00.000Z"
}
```

### Security Considerations

- No external API calls or data transmission
- All data stored locally in user's browser
- Content script only runs on YouTube pages
- Minimal permissions requested (storage and activeTab)

## Troubleshooting

### Common Issues

1. **Extension Not Loading**
   - Ensure Developer Mode is enabled in Chrome
   - Check that all files are in the same folder
   - Verify `manifest.json` syntax is correct

2. **No Video Detected**
   - Make sure you're on a YouTube video page (URL should contain `/watch`)
   - Try refreshing the YouTube page
   - Check browser console for error messages

3. **Notes Not Saving**
   - Ensure you have sufficient browser storage space
   - Try clearing browser cache and reloading
   - Check if content script is properly injected

4. **Timestamp Navigation Not Working**
   - Ensure video is not in private/incognito mode
   - Try refreshing the YouTube page
   - Check if video element is properly detected

### Debug Mode

To enable debug mode:
1. Open `chrome://extensions`
2. Find "YouTube Learning Notes Saver"
3. Click "Inspect views: popup" to debug popup
4. Open YouTube page and press F12 to debug content script

## Browser Compatibility

- ✅ Chrome 88+
- ✅ Edge (Chromium-based)
- ❌ Firefox (different extension API)
- ❌ Safari (different extension API)

## Privacy Policy

This extension:
- Does not collect or transmit any personal data
- Stores all notes locally in your browser
- Does not use third-party services
- Does not track your browsing activity

## Educational Use

This extension is designed specifically for educational purposes:
- Students taking online courses
- Professionals watching training videos
- Researchers documenting video sources
- Anyone learning from YouTube content

## Contributing

This is an open-source educational project. To contribute:

1. Fork the project
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is provided as-is for educational and personal use. Feel free to modify and improve it for your own needs!

## Support

For issues, questions, or suggestions:
1. Check the troubleshooting section above
2. Verify all files are present and correctly named
3. Ensure Chrome is updated to the latest version
4. Consult the academic documentation in `PROJECT_DOCUMENTATION.md`

---

**Enhance your YouTube learning experience with structured note-taking! 📚✨**
