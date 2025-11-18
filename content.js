// State management for resizing
let isResizing = false;
let currentSeparator = null;
let currentContainer = null;

function toggleSplitView() {
  const container = document.querySelector('#panel-main > div[data-panel-group-id=":rb:"]');
  if (!container) return;

  const current = container.style.flexDirection || "row";
  const isVertical = current !== "column";

  container.style.display = "flex";
  container.style.flexDirection = isVertical ? "column" : "row";
  container.style.height = "100%";
  container.style.width = "100%";
  container.style.overflow = "hidden";

  const panels = container.querySelectorAll('#panel-ide, #panel-pdf');
  panels.forEach(panel => {
    if (isVertical) {
      panel.style.height = "50%";
      panel.style.flex = "none";
    } else {
      panel.style.height = "";
      panel.style.flex = "";
    }
  });

  const separator = container.querySelector('[role="separator"]');
  if (separator) {
    if (isVertical) {
      separator.style.width = "100%";
      separator.style.height = "8px";
      separator.style.cursor = "row-resize";
      separator.style.background = "#e0e0e0";
      separator.style.position = "relative";
      separator.style.zIndex = "10";
      separator.style.flexShrink = "0";

      // Add visual indicator
      separator.style.transition = "background 0.2s";
      separator.addEventListener('mouseenter', () => {
        separator.style.background = "#bdbdbd";
      });
      separator.addEventListener('mouseleave', () => {
        if (!isResizing) {
          separator.style.background = "#e0e0e0";
        }
      });

      // Setup resize functionality
      setupResizer(separator, container);
    } else {
      separator.style.width = "";
      separator.style.height = "";
      separator.style.cursor = "";
      separator.style.background = "";
      separator.style.transition = "";

      // Remove resize functionality
      removeResizer(separator);
    }
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

// Setup resizer functionality
function setupResizer(separator, container) {
  // Remove existing listeners if any
  removeResizer(separator);

  // Store the handler so we can remove it later
  separator._resizeHandler = (e) => startResize(e, separator, container);
  separator.addEventListener('mousedown', separator._resizeHandler);
}

// Remove resizer functionality
function removeResizer(separator) {
  if (separator._resizeHandler) {
    separator.removeEventListener('mousedown', separator._resizeHandler);
    delete separator._resizeHandler;
  }
}

// Start resizing
function startResize(e, separator, container) {
  e.preventDefault();
  isResizing = true;
  currentSeparator = separator;
  currentContainer = container;

  separator.style.background = "#9e9e9e";
  document.body.style.cursor = "row-resize";
  document.body.style.userSelect = "none";

  // Add global mouse move and mouse up listeners
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
}

// Handle resize
function handleResize(e) {
  if (!isResizing || !currentContainer) return;

  const containerRect = currentContainer.getBoundingClientRect();
  const idePanel = currentContainer.querySelector('#panel-ide');
  const pdfPanel = currentContainer.querySelector('#panel-pdf');

  if (!idePanel || !pdfPanel) return;

  // Calculate new position
  const mouseY = e.clientY;
  const containerTop = containerRect.top;
  const containerHeight = containerRect.height;

  // Calculate percentage (with min/max constraints)
  let percentage = ((mouseY - containerTop) / containerHeight) * 100;
  percentage = Math.max(10, Math.min(90, percentage)); // Limit between 10% and 90%

  // Apply new heights
  idePanel.style.height = `${percentage}%`;
  pdfPanel.style.height = `${100 - percentage}%`;

  // Trigger resize event for PDF viewer
  window.dispatchEvent(new Event('resize'));
}

// Stop resizing
function stopResize() {
  if (!isResizing) return;

  isResizing = false;
  document.body.style.cursor = "";
  document.body.style.userSelect = "";

  if (currentSeparator) {
    currentSeparator.style.background = "#e0e0e0";
  }

  currentSeparator = null;
  currentContainer = null;

  // Remove global listeners
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);

  // Force PDF refresh
  const pdfPanel = document.querySelector('#panel-pdf');
  if (pdfPanel) {
    setTimeout(() => {
      pdfPanel.style.display = 'none';
      void pdfPanel.offsetHeight;
      pdfPanel.style.display = '';
    }, 50);
  }
}


function injectButton() {
  const toolbarRight = document.querySelector(".toolbar-right");
  if (!toolbarRight) return;

  if (document.getElementById("toggle-split-btn")) return;

  const wrapper = document.createElement("div");
  wrapper.className = "toolbar-item";
  wrapper.setAttribute("data-floating-ui-inert", "");

  wrapper.innerHTML = `
    <button type="button" class="btn btn-full-height" id="toggle-split-btn" title="Toggle Split Layout">
      <span class="material-symbols align-middle" aria-hidden="true" translate="no">view_agenda</span>
      <p class="toolbar-label">Split</p>
    </button>
  `;

  const reviewBtn = [...toolbarRight.querySelectorAll(".toolbar-label")].find(el => el.textContent.trim() === "Review");
  if (reviewBtn && reviewBtn.closest(".toolbar-item")) {
    reviewBtn.closest(".toolbar-item").before(wrapper);
  } else {
    toolbarRight.prepend(wrapper);
  }

  document.getElementById("toggle-split-btn").addEventListener("click", toggleSplitView);
}


window.addEventListener("load", () => {
  injectButton();

  const observer = new MutationObserver(() => injectButton());
  observer.observe(document.body, { childList: true, subtree: true });
});
