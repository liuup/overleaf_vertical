// Background service worker for managing dynamic content scripts
// Note: Default domains (www.overleaf.com, cn.overleaf.com) are handled by static content_scripts in manifest.json
// This only manages additional custom domains added by users

// Initialize on installation
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install' || details.reason === 'update') {
    // Initialize storage with empty custom domains if not exists
    const result = await chrome.storage.sync.get({ customDomains: [] });

    // Register content scripts for custom domains only
    await updateContentScripts(result.customDomains);
  }
});

// Listen for storage changes to update content scripts
chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName === 'sync' && changes.customDomains) {
    const customDomains = changes.customDomains.newValue || [];
    await updateContentScripts(customDomains);
  }
});

// Update content scripts with custom domains only
// Default domains are already handled by manifest.json
async function updateContentScripts(customDomains) {
  try {
    // Unregister all existing dynamic content scripts
    try {
      const existingScripts = await chrome.scripting.getRegisteredContentScripts();
      if (existingScripts.length > 0) {
        const ids = existingScripts.map(script => script.id);
        await chrome.scripting.unregisterContentScripts({ ids });
      }
    } catch (error) {
      // Ignore errors if no scripts are registered
    }

    // Only register if there are custom domains
    if (customDomains && customDomains.length > 0) {
      await chrome.scripting.registerContentScripts([{
        id: "overleaf-vertical-custom",
        matches: customDomains,
        js: ["content.js"],
        runAt: "document_idle"
      }]);
    }
  } catch (error) {
    console.error('Error updating content scripts:', error);
  }
}
