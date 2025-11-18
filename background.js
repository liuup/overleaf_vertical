// Background service worker for managing dynamic content scripts

const DEFAULT_DOMAIN = "*://www.overleaf.com/*";

// Initialize on installation
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install' || details.reason === 'update') {
    // Initialize storage with empty custom domains if not exists
    const result = await chrome.storage.sync.get({ customDomains: [] });
    
    // Register content scripts with all domains
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

// Update content scripts with current domains
async function updateContentScripts(customDomains) {
  try {
    const allDomains = [DEFAULT_DOMAIN, ...customDomains];
    
    // Unregister all existing dynamic content scripts
    try {
      const existingScripts = await chrome.scripting.getRegisteredContentScripts();
      if (existingScripts.length > 0) {
        const ids = existingScripts.map(script => script.id);
        await chrome.scripting.unregisterContentScripts({ ids });
      }
    } catch (error) {
      // Ignore errors if no scripts are registered
      console.log('No existing scripts to unregister');
    }
    
    // Register new content script with all domains
    await chrome.scripting.registerContentScripts([{
      id: "overleaf-vertical-dynamic",
      matches: allDomains,
      js: ["content.js"],
      runAt: "document_idle"
    }]);
    
    console.log('Content scripts updated for domains:', allDomains);
  } catch (error) {
    console.error('Error updating content scripts:', error);
  }
}

