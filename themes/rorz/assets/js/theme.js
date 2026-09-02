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

  document.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-copy]");
    if (!btn) return;
    var target = document.querySelector(btn.getAttribute("data-copy"));
    if (!target) return;
    var text = target.textContent || "";
    var original = btn.textContent;
    var done = function () {
      btn.textContent = "已复制";
      window.setTimeout(function () {
        btn.textContent = original;
      }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {});
      return;
    }
    var area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand("copy");
      done();
    } catch (e) {
      /* ignore */
    }
    document.body.removeChild(area);
  });
})();
