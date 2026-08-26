(function () {
  "use strict";

  var STORAGE_KEY = "rorz-theme";
  var html = document.documentElement;
  var btns = document.querySelectorAll(".theme-toggle-btn");

  function getStored() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStored(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      /* ignore */
    }
  }

  function resolvedForGiscus(theme) {
    if (theme === "auto") {
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return theme;
  }

  function updateButtons(theme) {
    btns.forEach(function (b) {
      var isActive = b.getAttribute("data-theme-value") === theme;
      b.classList.toggle("active", isActive);
      b.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function applyTheme(theme) {
    html.setAttribute("data-theme", theme);
    setStored(theme);
    updateButtons(theme);
    if (typeof window.syncGiscusTheme === "function") {
      window.syncGiscusTheme(resolvedForGiscus(theme));
    }
  }

  var current = getStored() || html.getAttribute("data-theme") || "auto";
  applyTheme(current);

  btns.forEach(function (b) {
    b.addEventListener("click", function () {
      applyTheme(b.getAttribute("data-theme-value"));
    });
  });
})();
