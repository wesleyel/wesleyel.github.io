(function () {
  "use strict";

  var STORAGE_KEY = "minimal-lines-theme";
  var html = document.documentElement;
  var btn = document.querySelector(".theme-toggle");

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

  function applyTheme(theme) {
    html.setAttribute("data-theme", theme);
    setStored(theme);
    if (typeof window.syncGiscusTheme === "function") {
      window.syncGiscusTheme();
    }
  }

  function cycleTheme() {
    var current = html.getAttribute("data-theme") || "auto";
    var next = current === "auto" ? "light" : current === "light" ? "dark" : "auto";
    applyTheme(next);
  }

  var stored = getStored();
  if (stored) {
    html.setAttribute("data-theme", stored);
  }

  if (btn) {
    btn.addEventListener("click", cycleTheme);
  }
})();
