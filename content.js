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
      separator.style.height = "4px";
      separator.style.cursor = "row-resize";
    } else {
      separator.style.width = "";
      separator.style.height = "";
      separator.style.cursor = "";
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
