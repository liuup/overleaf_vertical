// Default domains that cannot be removed
const DEFAULT_DOMAINS = ["*://www.overleaf.com/*", "*://cn.overleaf.com/*"];

// Load and display domains
async function loadDomains() {
  const result = await chrome.storage.sync.get({ customDomains: [] });
  const domains = [...DEFAULT_DOMAINS, ...result.customDomains];

  const domainList = document.getElementById('domainList');
  domainList.innerHTML = '';

  domains.forEach((domain, index) => {
    const isDefault = DEFAULT_DOMAINS.includes(domain);
    const item = document.createElement('div');
    item.className = `domain-item ${isDefault ? 'default' : ''}`;

    // Calculate the correct index in customDomains array
    const customIndex = index - DEFAULT_DOMAINS.length;

    item.innerHTML = `
      ${isDefault ? '<span class="domain-badge">Default</span>' : ''}
      <span class="domain-text">${escapeHtml(domain)}</span>
      ${!isDefault ? `<button class="remove-btn" data-index="${customIndex}">Remove</button>` : ''}
    `;

    domainList.appendChild(item);
  });
  
  // Add event listeners to remove buttons
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      removeDomain(index);
    });
  });
}

// Add a new domain
async function addDomain() {
  const input = document.getElementById('newDomain');
  const domain = input.value.trim();
  
  if (!domain) {
    showMessage('Please enter a domain pattern', 'error');
    return;
  }
  
  // Basic validation
  if (!domain.includes('://') || !domain.includes('/*')) {
    showMessage('Invalid pattern. Must include protocol (e.g., *://) and path (e.g., /*)', 'error');
    return;
  }
  
  const result = await chrome.storage.sync.get({ customDomains: [] });
  const customDomains = result.customDomains;
  
  // Check if domain already exists
  if (customDomains.includes(domain) || DEFAULT_DOMAINS.includes(domain)) {
    showMessage('This domain pattern already exists', 'error');
    return;
  }
  
  // Add the new domain
  customDomains.push(domain);
  await chrome.storage.sync.set({ customDomains });
  
  // Update content script matches
  await updateContentScripts(customDomains);
  
  input.value = '';
  showMessage('Domain added successfully! Please reload Overleaf pages for changes to take effect.', 'success');
  loadDomains();
}

// Remove a domain
async function removeDomain(index) {
  const result = await chrome.storage.sync.get({ customDomains: [] });
  const customDomains = result.customDomains;
  
  customDomains.splice(index, 1);
  await chrome.storage.sync.set({ customDomains });
  
  // Update content script matches
  await updateContentScripts(customDomains);
  
  showMessage('Domain removed successfully! Please reload Overleaf pages for changes to take effect.', 'success');
  loadDomains();
}

// Update content scripts dynamically
// Note: Default domains are handled by static content_scripts in manifest.json
// This only updates custom domains
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

// Show status message
function showMessage(message, type) {
  const statusDiv = document.getElementById('statusMessage');
  statusDiv.textContent = message;
  statusDiv.className = `status-message ${type}`;
  statusDiv.style.display = 'block';
  
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 5000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Event listeners
document.getElementById('addBtn').addEventListener('click', addDomain);
document.getElementById('newDomain').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addDomain();
  }
});

// Load domains on page load
loadDomains();
