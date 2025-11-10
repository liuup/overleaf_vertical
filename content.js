function toggleSplitView() {
  // 精确查找蓝色区域的分屏容器（编辑区 + PDF）
  const container = document.querySelector('#panel-main > div[data-panel-group-id=":rb:"]');
  if (!container) return;

  const current = container.style.flexDirection || "row";
  const isVertical = current !== "column";

  // 切换布局方向
  container.style.display = "flex";
  container.style.flexDirection = isVertical ? "column" : "row";
  container.style.height = "100%";
  container.style.width = "100%";
  container.style.overflow = "hidden";

  // 调整上下面板的高度（仅在上下分屏时）
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

  // 调整分割线样式
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

  // 🩹 修复 PDF 白屏问题：强制刷新 PDF Viewer 区域
  const pdfPanel = document.querySelector('#panel-pdf');
  if (pdfPanel) {
    // 方法1：强制触发浏览器 resize 事件（Overleaf 内部监听这个）
    window.dispatchEvent(new Event('resize'));

    // 方法2（保险）：轻微延迟后触发一次强制重绘
    setTimeout(() => {
      pdfPanel.style.display = 'none';
      void pdfPanel.offsetHeight; // 触发 reflow
      pdfPanel.style.display = '';
    }, 150);
  }
}


function injectButton() {
  // 查找 Overleaf 顶部工具栏
  const toolbarRight = document.querySelector(".toolbar-right");
  if (!toolbarRight) return;

  // 避免重复注入
  if (document.getElementById("toggle-split-btn")) return;

  // 创建按钮外层
  const wrapper = document.createElement("div");
  wrapper.className = "toolbar-item";
  wrapper.setAttribute("data-floating-ui-inert", "");

  // 按钮HTML
  wrapper.innerHTML = `
    <button type="button" class="btn btn-full-height" id="toggle-split-btn" title="Toggle Split Layout">
      <span class="material-symbols align-middle" aria-hidden="true" translate="no">view_agenda</span>
      <p class="toolbar-label">Split</p>
    </button>
  `;

  // 找到 Review 按钮并插入其前
  const reviewBtn = [...toolbarRight.querySelectorAll(".toolbar-label")].find(el => el.textContent.trim() === "Review");
  if (reviewBtn && reviewBtn.closest(".toolbar-item")) {
    reviewBtn.closest(".toolbar-item").before(wrapper);
  } else {
    toolbarRight.prepend(wrapper);
  }

  // 添加点击事件
  document.getElementById("toggle-split-btn").addEventListener("click", toggleSplitView);
}

// 页面加载完后注入按钮
window.addEventListener("load", () => {
  injectButton();

  // 监听 Overleaf 的动态 DOM 更新（React 渲染）
  const observer = new MutationObserver(() => injectButton());
  observer.observe(document.body, { childList: true, subtree: true });
});
