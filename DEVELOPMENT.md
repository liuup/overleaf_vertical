# Development Guide

## Quick Start

### Prerequisites
- Chromium-based browser (Chrome, Edge, Brave, etc.)
- Git

### Setup for Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/liuup/overleaf_vertical.git
   cd overleaf_vertical
   ```

2. **Load the extension in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the repository directory

3. **Make changes:**
   - Edit the source files directly
   - Click the refresh icon on the extension card to reload changes
   - For content script changes, you may need to reload the Overleaf page

### Project Structure

```
overleaf_vertical/
├── manifest.json          # Extension configuration
├── content.js            # Main content script (runs on Overleaf pages)
├── background.js         # Background service worker
├── options.html          # Options page UI
├── options.js            # Options page logic
├── icon.png             # Extension icon
├── .github/
│   └── workflows/
│       └── build.yml    # GitHub Actions CI/CD
├── images/              # Documentation images
├── README.md            # English documentation
├── README_zh.md         # Chinese documentation
├── Installation.md      # English installation guide
├── Installation_zh.md   # Chinese installation guide
├── CHANGELOG.md         # Version history
└── DEVELOPMENT.md       # This file
```

### Key Files Explained

#### manifest.json
- Extension metadata and configuration
- Defines permissions, content scripts, and background worker
- Update version number here for releases

#### content.js
- Injected into Overleaf pages
- Handles:
  - Toggle button injection
  - Layout switching (vertical/horizontal)
  - Resizable divider functionality
  - PDF viewer refresh

#### background.js
- Service worker running in background
- Handles:
  - Dynamic content script registration
  - Custom domain management
  - Storage synchronization

#### options.html & options.js
- Configuration UI for the extension
- Allows users to add/remove custom domains
- Accessible via right-click menu on extension icon

### Building for Distribution

#### Automated Build (GitHub Actions)

The extension automatically builds when:
- Code is pushed to `main` or `master` branch
- A tag starting with `v` is pushed (e.g., `v1.1.0`)
- Manually triggered via GitHub Actions UI

**To create a release:**
```bash
# Update version in manifest.json first
git add manifest.json
git commit -m "Bump version to 1.2.0"
git tag v1.2.0
git push origin main --tags
```

### Testing

#### Manual Testing Checklist

**Basic Functionality:**
- [ ] Extension loads without errors
- [ ] Toggle button appears in Overleaf toolbar
- [ ] Clicking toggle switches between vertical/horizontal layouts
- [ ] PDF viewer displays correctly in both modes

**Resizable Divider:**
- [ ] Divider is visible in vertical mode
- [ ] Divider changes color on hover
- [ ] Dragging divider adjusts split ratio
- [ ] Split ratio respects min/max constraints (10%-90%)
- [ ] PDF viewer refreshes after resize

**Multi-Domain Support:**
- [ ] Options page opens from extension menu
- [ ] Can add custom domain patterns
- [ ] Invalid patterns are rejected with error message
- [ ] Can remove custom domains
- [ ] Default domain cannot be removed
- [ ] Extension works on custom domains after reload

**Build System:**
- [ ] GitHub Actions workflow runs successfully
- [ ] Release ZIP contains only necessary files
- [ ] Extension loads from extracted release ZIP

### Debugging

#### Console Logs
- **Content Script:** Open DevTools on Overleaf page → Console tab
- **Background Worker:** Go to `chrome://extensions/` → Click "service worker" link
- **Options Page:** Right-click on options page → Inspect

#### Common Issues

**Extension not loading:**
- Check for syntax errors in manifest.json
- Verify all referenced files exist
- Check browser console for errors

**Content script not running:**
- Verify domain matches in manifest.json
- Check if background worker registered the script
- Reload the Overleaf page

**Options not saving:**
- Check chrome.storage permissions in manifest
- Verify background worker is running
- Check for errors in background worker console

### Code Style

- Use 2 spaces for indentation
- Use semicolons
- Use descriptive variable names
- Add comments for complex logic
- Keep functions focused and small

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [Chrome Scripting API](https://developer.chrome.com/docs/extensions/reference/scripting/)

### License

MIT License - See LICENSE file for details

