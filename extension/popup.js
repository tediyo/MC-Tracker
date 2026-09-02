document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("live-toggle");

  // Read current setting
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(["live_mode_enabled"], (res) => {
      toggle.checked = res.live_mode_enabled !== false;
    });
  }

  // Handle toggle change
  toggle.addEventListener("change", () => {
    const enabled = toggle.checked;

    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ live_mode_enabled: enabled });
    }

    // Broadcast to all active tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            action: "toggle_live_mode",
            enabled: enabled,
          }).catch(() => {
            // Ignore error for tabs where content script isn't loaded (e.g. chrome://)
          });
        }
      });
    });
  });
});
