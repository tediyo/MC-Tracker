(function () {
  "use me";

  const APP_BASE_URL = "http://localhost:3000";

  function isWebAppDomainOrPage() {
    if (
      window.__mc_tracker_web_app ||
      (document.documentElement && document.documentElement.hasAttribute("data-mc-tracker-web-app")) ||
      document.getElementById("mc-tracker-web-fab") ||
      document.querySelector("[data-mc-tracker-fab]")
    ) {
      return true;
    }
    try {
      if (window.location && window.location.origin === new URL(APP_BASE_URL).origin) {
        return true;
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
    return false;
  }

  if (window.__mc_tracker_fab_injected || isWebAppDomainOrPage()) return;
  window.__mc_tracker_fab_injected = true;

  let isLiveMode = true;
  let fabRoot = null;
  let fabButton = null;
  let modalOverlay = null;

  let isDragging = false;
  let isMoved = false;
  let startX = 0, startY = 0;
  let initialPosX = 0, initialPosY = 0;
  let currentPosX = 0, currentPosY = 0;

  // Listen for Live Mode toggle changes from popup
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.action === "toggle_live_mode") {
        isLiveMode = msg.enabled;
        if (fabRoot) {
          fabRoot.style.display = isLiveMode ? "block" : "none";
        }
      }
    });
  }

  function safeInit() {
    if (isWebAppDomainOrPage()) return;

    if (!document.body) {
      setTimeout(safeInit, 100);
      return;
    }

    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      try {
        chrome.storage.local.get(["live_mode_enabled", "fab_position"], (res) => {
          isLiveMode = !res || res.live_mode_enabled !== false;
          initUI(res ? res.fab_position : null);
        });
      } catch (err) {
        initUI(null);
      }
    } else {
      initUI(null);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", safeInit);
  } else {
    safeInit();
  }

  function initUI(savedPos) {
    if (document.getElementById("mc-tracker-fab-root") || isWebAppDomainOrPage()) return;

    // 1. Create Root Host
    fabRoot = document.createElement("div");
    fabRoot.id = "mc-tracker-fab-root";
    fabRoot.style.display = isLiveMode ? "block" : "none";

    // Default position (Bottom Right)
    const buttonSize = 56;
    const defaultX = Math.max(16, window.innerWidth - buttonSize - 24);
    const defaultY = Math.max(16, window.innerHeight - buttonSize - 32);

    currentPosX = savedPos ? savedPos.x : defaultX;
    currentPosY = savedPos ? savedPos.y : defaultY;

    // Clamp inside initial screen bounds
    currentPosX = Math.min(Math.max(12, currentPosX), window.innerWidth - buttonSize - 12);
    currentPosY = Math.min(Math.max(12, currentPosY), window.innerHeight - buttonSize - 12);

    fabRoot.style.left = currentPosX + "px";
    fabRoot.style.top = currentPosY + "px";

    // 2. Build FAB Container
    const container = document.createElement("div");
    container.className = "mc-fab-container";
    container.style.position = "relative";

    // Tooltip
    const tooltip = document.createElement("div");
    tooltip.className = "mc-fab-tooltip";
    tooltip.innerText = "MC Tracker Quick Actions";

    // Button
    fabButton = document.createElement("button");
    fabButton.type = "button";
    fabButton.className = "mc-fab-button";
    fabButton.ariaLabel = "MC Tracker Quick Actions";
    fabButton.innerHTML = `
      <svg class="mc-fab-icon" viewBox="0 0 24 24">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    `;

    container.appendChild(tooltip);
    container.appendChild(fabButton);
    fabRoot.appendChild(container);

    // 3. Build Quick Action Modal
    modalOverlay = document.createElement("div");
    modalOverlay.className = "mc-modal-overlay";
    modalOverlay.innerHTML = `
      <div class="mc-modal-card">
        <div class="mc-modal-header">
          <div class="mc-modal-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#03ad03" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            MC Tracker Quick Actions
          </div>
          <button type="button" class="mc-modal-close" id="mc-close-modal">✕</button>
        </div>
        <div class="mc-modal-grid">
          <a href="${APP_BASE_URL}/costs" target="_blank" class="mc-action-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"></path>
              <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
              <path d="M12 6v12"></path>
            </svg>
            <span>Log Expense</span>
          </a>
          <a href="${APP_BASE_URL}/income" target="_blank" class="mc-action-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#03ad03" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
            <span>Log Income</span>
          </a>
          <a href="${APP_BASE_URL}/plans" target="_blank" class="mc-action-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
            <span>Create Plan</span>
          </a>
        </div>
      </div>
    `;

    document.body.appendChild(fabRoot);
    document.body.appendChild(modalOverlay);

    // Modal Events
    const closeBtn = modalOverlay.querySelector("#mc-close-modal");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    // 4. Attach Drag & Touch Events
    fabButton.addEventListener("mousedown", onMouseDown);
    fabButton.addEventListener("touchstart", onTouchStart, { passive: false });

    window.addEventListener("resize", clampOnResize);
  }

  function openModal() {
    if (modalOverlay) {
      modalOverlay.classList.add("active");
      if (fabButton) fabButton.classList.add("open");
    }
  }

  function closeModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove("active");
      if (fabButton) fabButton.classList.remove("open");
    }
  }

  // Pointer Handlers
  function onPointerDown(cX, cY) {
    isDragging = true;
    isMoved = false;
    startX = cX;
    startY = cY;
    initialPosX = currentPosX;
    initialPosY = currentPosY;

    if (fabButton) fabButton.classList.add("dragging");

    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onPointerUp);
  }

  function onPointerMove(e) {
    if (!isDragging) return;

    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    const deltaX = clientX - startX;
    const deltaY = clientY - startY;

    if (Math.hypot(deltaX, deltaY) > 5) {
      isMoved = true;
    }

    const buttonSize = 56;
    const minX = 12;
    const maxX = window.innerWidth - buttonSize - 12;
    const minY = 12;
    const maxY = window.innerHeight - buttonSize - 12;

    currentPosX = Math.min(Math.max(minX, initialPosX + deltaX), maxX);
    currentPosY = Math.min(Math.max(minY, initialPosY + deltaY), maxY);

    if (fabRoot) {
      fabRoot.style.left = currentPosX + "px";
      fabRoot.style.top = currentPosY + "px";
    }
  }

  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;

    if (fabButton) fabButton.classList.remove("dragging");

    window.removeEventListener("mousemove", onPointerMove);
    window.removeEventListener("mouseup", onPointerUp);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onPointerUp);

    // Save Position
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ fab_position: { x: currentPosX, y: currentPosY } });
    }

    // Trigger Click if not moved
    if (!isMoved) {
      if (modalOverlay.classList.contains("active")) {
        closeModal();
      } else {
        openModal();
      }
    }
  }

  function onMouseDown(e) {
    if (e.button !== 0) return;
    onPointerDown(e.clientX, e.clientY);
  }

  function onTouchStart(e) {
    if (e.touches.length !== 1) return;
    onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
  }

  function onTouchMove(e) {
    if (isDragging) {
      e.preventDefault();
      onPointerMove(e);
    }
  }

  function clampOnResize() {
    const buttonSize = 56;
    currentPosX = Math.min(Math.max(12, currentPosX), window.innerWidth - buttonSize - 12);
    currentPosY = Math.min(Math.max(12, currentPosY), window.innerHeight - buttonSize - 12);

    if (fabRoot) {
      fabRoot.style.left = currentPosX + "px";
      fabRoot.style.top = currentPosY + "px";
    }
  }
})();
