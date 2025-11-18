# Changelog

All notable changes to the Overleaf Vertical extension will be documented in this file.

## [1.1.0] - 2025-11-18

### Features
- **Resizable Divider**: The vertical divider between editor and PDF preview is draggable. Users can click and drag to adjust the split ratio to their preference.
- **Multi-Domain Support**: Extension supports custom domain patterns including:
  - cn.overleaf.com (Chinese version)
  - Self-hosted Overleaf instances
  - Configurable via the Options page
- **Options Page**: Configuration interface accessible via right-click menu to manage custom domains
- **Automated Build System**:
  - GitHub Actions workflow for automatic builds on push and releases
  - Automated ZIP packaging for distribution

### Technical Details
- Manifest version 1.1.0
- Background service worker for dynamic content script management
- Divider visual feedback with hover effects
- Separator height of 8px for better usability
- `storage` and `scripting` permissions in manifest
- Dynamic content script registration via chrome.scripting API
- Proper cleanup for resize event listeners
- Optimized PDF viewer refresh logic after resize

## [1.0.0] - Initial Release

### Features
- Basic vertical split functionality
- Toggle button in Overleaf toolbar
- Support for www.overleaf.com
- Fixed 50/50 split ratio
