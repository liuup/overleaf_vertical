// State management for resizing
let isResizing = false;
let currentSeparator = null;
let currentContainer = null;
let isVerticalMode = false;

function setVerticalLayout() {
  let container = document.querySelector('#panel-main > div[data-panel-group-id]');
  if (!container) return;

  isVerticalMode = true;

  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.height = "100%";
  container.style.width = "100%";
  container.style.overflow = "hidden";

  const panels = container.querySelectorAll('#panel-ide, #panel-pdf');
  panels.forEach(panel => {
    panel.style.height = "50%";
    panel.style.flex = "none";
  });

  const separator = container.querySelector('[role="separator"]');
  if (separator) {
    const newSeparator = separator.cloneNode(true);
    separator.parentNode.replaceChild(newSeparator, separator);

    newSeparator.setAttribute('data-resize-handle-state', 'disabled');
    newSeparator.setAttribute('data-panel-resize-handle-enabled', 'false');

    newSeparator.style.cssText = `
      width: 100% !important;
      height: 8px !important;
      cursor: row-resize !important;
      background: #e0e0e0 !important;
      position: relative !important;
      z-index: 10 !important;
      flex-shrink: 0 !important;
      transition: background 0.2s !important;
      pointer-events: auto !important;
      touch-action: auto !important;
      user-select: none !important;
    `;

    newSeparator._mouseenterHandler = () => {
      newSeparator.style.background = "#bdbdbd";
    };
    newSeparator._mouseleaveHandler = () => {
      if (!isResizing) newSeparator.style.background = "#e0e0e0";
    };

    newSeparator.addEventListener('mouseenter', newSeparator._mouseenterHandler);
    newSeparator.addEventListener('mouseleave', newSeparator._mouseleaveHandler);

    Array.from(newSeparator.children).forEach(child => {
      child.style.pointerEvents = 'none';
    });

    setupResizer(newSeparator, container);
  }

  const pdfPanel = document.querySelector('#panel-pdf');
  if (pdfPanel) {
    window.dispatchEvent(new Event('resize'));
    setTimeout(() => {
      pdfPanel.style.display = 'none';
      void pdfPanel.offsetHeight;
      pdfPanel.style.display = '';
    }, 150);
  }
}

function restoreHorizontalLayout() {
  let container = document.querySelector('#panel-main > div[data-panel-group-id]');
  if (!container) return;

  isVerticalMode = false;

  container.style.flexDirection = "row";

  const panels = container.querySelectorAll('#panel-ide, #panel-pdf');
  panels.forEach(panel => {
    panel.style.height = "";
    panel.style.flex = "";
  });

  const separator = container.querySelector('[role="separator"]');
  if (separator) {
    separator.style.cssText = "";
    if (separator._mouseenterHandler) {
      separator.removeEventListener('mouseenter', separator._mouseenterHandler);
      delete separator._mouseenterHandler;
    }
    if (separator._mouseleaveHandler) {
      separator.removeEventListener('mouseleave', separator._mouseleaveHandler);
      delete separator._mouseleaveHandler;
    }
    removeResizer(separator);
  }

  const pdfPanel = document.querySelector('#panel-pdf');
  if (pdfPanel) {
    window.dispatchEvent(new Event('resize'));
    setTimeout(() => {
      pdfPanel.style.display = 'none';
      void pdfPanel.offsetHeight;
      pdfPanel.style.display = '';
    }, 150);
  }
}

function setupResizer(separator, container) {
  removeResizer(separator);
  separator._resizeHandler = (e) => startResize(e, separator, container);
  separator.addEventListener('mousedown', separator._resizeHandler, true);
}

function removeResizer(separator) {
  if (separator._resizeHandler) {
    separator.removeEventListener('mousedown', separator._resizeHandler, true);
    delete separator._resizeHandler;
  }
}

function startResize(e, separator, container) {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  
  isResizing = true;
  currentSeparator = separator;
  currentContainer = container;

  separator.style.background = "#9e9e9e";
  
  document.body.style.cssText = `
    cursor: row-resize !important;
    user-select: none !important;
    -webkit-user-select: none !important;
  `;
  document.documentElement.style.cursor = "row-resize";

  const style = document.createElement('style');
  style.id = 'overleaf-vertical-cursor-override';
  style.textContent = `* { cursor: row-resize !important; }`;
  document.head.appendChild(style);

  document.addEventListener('mousemove', handleResize, true);
  document.addEventListener('mouseup', stopResize, true);
}

function handleResize(e) {
  if (!isResizing || !currentContainer) return;
  
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();

  const containerRect = currentContainer.getBoundingClientRect();
  const idePanel = currentContainer.querySelector('#panel-ide');
  const pdfPanel = currentContainer.querySelector('#panel-pdf');

  if (!idePanel || !pdfPanel) return;

  const mouseY = e.clientY;
  const containerTop = containerRect.top;
  const containerHeight = containerRect.height;

  let percentage = ((mouseY - containerTop) / containerHeight) * 100;
  percentage = Math.max(10, Math.min(90, percentage));

  idePanel.style.height = `${percentage}%`;
  idePanel.style.flex = "none";
  pdfPanel.style.height = `${100 - percentage}%`;
  pdfPanel.style.flex = "none";

  window.dispatchEvent(new Event('resize'));
}

function stopResize(e) {
  if (!isResizing) return;

  if (e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  isResizing = false;

  document.body.style.cssText = "";
  document.documentElement.style.cssText = "";

  const cursorOverride = document.getElementById('overleaf-vertical-cursor-override');
  if (cursorOverride) cursorOverride.remove();

  if (currentSeparator) currentSeparator.style.background = "#e0e0e0";

  currentSeparator = null;
  currentContainer = null;

  document.removeEventListener('mousemove', handleResize, true);
  document.removeEventListener('mouseup', stopResize, true);

  const pdfPanel = document.querySelector('#panel-pdf');
  if (pdfPanel) {
    setTimeout(() => {
      pdfPanel.style.display = 'none';
      void pdfPanel.offsetHeight;
      pdfPanel.style.display = '';
    }, 50);
  }
}

function injectLayoutOption() {
  const layoutDropdown = document.querySelector('[aria-labelledby="layout-dropdown-btn"]');
  if (!layoutDropdown) return;

  if (document.getElementById("vertical-layout-option")) return;

  const menuItems = layoutDropdown.querySelectorAll('[role="menuitem"]');
  if (menuItems.length === 0) return;

  const lastItem = menuItems[menuItems.length - 1];

  const verticalOption = document.createElement('a');
  verticalOption.setAttribute('role', 'menuitem');
  verticalOption.setAttribute('aria-current', 'false');
  verticalOption.setAttribute('aria-selected', 'false');
  verticalOption.setAttribute('data-rr-ui-dropdown-item', '');
  verticalOption.setAttribute('tabindex', '0');
  verticalOption.setAttribute('href', '#');
  verticalOption.setAttribute('id', 'vertical-layout-option');
  verticalOption.className = 'dropdown-item';

  verticalOption.innerHTML = `
    <span class="material-symbols dropdown-item-leading-icon" aria-hidden="true" translate="no">view_agenda</span>
    <div class="d-flex flex-column">
      Editor & PDF (Vertical)
    </div>
  `;

  verticalOption.addEventListener('click', (e) => {
    e.preventDefault();
    setVerticalLayout();
    layoutDropdown.querySelectorAll('[role="menuitem"]').forEach(item => {
      item.setAttribute('aria-current', 'false');
      item.setAttribute('aria-selected', 'false');
    });
    verticalOption.setAttribute('aria-current', 'true');
    verticalOption.setAttribute('aria-selected', 'true');
  });

  lastItem.parentNode.insertBefore(verticalOption, lastItem.nextSibling);

  // Add click listeners to other layout options to restore horizontal layout
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      if (isVerticalMode) {
        restoreHorizontalLayout();
      }
    }, true);
  });
}

let injectionAttempts = 0;
const maxAttempts = 50;

function tryInjectLayoutOption() {
  if (injectionAttempts >= maxAttempts) return;

  injectionAttempts++;
  injectLayoutOption();

  if (!document.getElementById("vertical-layout-option")) {
    setTimeout(tryInjectLayoutOption, 200);
  }
}

window.addEventListener("load", () => {
  tryInjectLayoutOption();

  const observer = new MutationObserver(() => {
    if (!document.getElementById("vertical-layout-option")) {
      injectLayoutOption();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
});
