// State management for resizing
let isResizing = false;
let currentSeparator = null;
let currentContainer = null;
let isVerticalMode = false;

function setVerticalLayout() {
  // 找到包含编辑器和PDF的容器 - 使用更精确的选择器
  let container = document.querySelector('#ide-redesign-editor-and-pdf-panel [data-panel-group][data-panel-group-direction="horizontal"]');
  if (!container) {
    // 备用选择器
    container = document.querySelector('div[data-panel-group][data-panel-group-id]');
  }
  if (!container) {
    console.log('Container not found');
    return;
  }

  console.log('Container found:', container);

  isVerticalMode = true;

  // 修改容器为垂直布局
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.height = "100%";
  container.style.width = "100%";
  container.style.overflow = "hidden";
  container.setAttribute('data-panel-group-direction', 'vertical');

  // 查找编辑器和PDF面板 - 直接使用ID选择器
  const editorPanel = document.getElementById('ide-redesign-editor-panel');
  const pdfPanel = document.getElementById('ide-redesign-pdf-panel');
  
  console.log('Editor panel:', editorPanel);
  console.log('PDF panel:', pdfPanel);

  if (!editorPanel || !pdfPanel) {
    console.error('无法找到编辑器或PDF面板');
    console.log('Editor panel found:', !!editorPanel);
    console.log('PDF panel found:', !!pdfPanel);
    return;
  }

  // 设置编辑器面板样式
  editorPanel.style.height = '50%';
  editorPanel.style.width = '100%';
  editorPanel.style.flex = '0 0 50%';
  editorPanel.style.minHeight = '100px';
  editorPanel.style.maxHeight = 'none';
  editorPanel.style.overflow = 'auto';
  editorPanel.style.position = 'relative';

  // 设置PDF面板样式
  pdfPanel.style.height = '50%';
  pdfPanel.style.width = '100%';
  pdfPanel.style.flex = '0 0 50%';
  pdfPanel.style.minHeight = '100px';
  pdfPanel.style.maxHeight = 'none';
  pdfPanel.style.overflow = 'auto';
  pdfPanel.style.position = 'relative';

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

  // 强制重新渲染PDF面板
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
  let container = document.querySelector('#ide-redesign-editor-and-pdf-panel [data-panel-group][data-panel-group-direction="vertical"]');
  if (!container) {
    container = document.querySelector('div[data-panel-group][data-panel-group-id]');
  }
  if (!container) return;

  isVerticalMode = false;

  container.style.flexDirection = "row";
  container.setAttribute('data-panel-group-direction', 'horizontal');

  const editorPanel = document.getElementById('ide-redesign-editor-panel');
  const pdfPanel = document.getElementById('ide-redesign-pdf-panel');
  
  if (editorPanel) {
    editorPanel.style.cssText = "";
  }
  if (pdfPanel) {
    pdfPanel.style.cssText = "";
  }

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

  const pdfPanelForRefresh = document.getElementById('ide-redesign-pdf-panel');
  if (pdfPanelForRefresh) {
    window.dispatchEvent(new Event('resize'));
    setTimeout(() => {
      pdfPanelForRefresh.style.display = 'none';
      void pdfPanelForRefresh.offsetHeight;
      pdfPanelForRefresh.style.display = '';
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
  const idePanel = document.getElementById('ide-redesign-editor-panel');
  const pdfPanel = document.getElementById('ide-redesign-pdf-panel');

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

  const pdfPanel = document.getElementById('ide-redesign-pdf-panel');
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
