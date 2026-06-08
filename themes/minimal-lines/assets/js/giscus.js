(function () {
  "use strict";

  var GISCUS_ORIGIN = "https://giscus.app";

  function getConfig() {
    var el = document.querySelector(".giscus");
    if (!el || !el.dataset.repo) return null;
    return {
      repo: el.dataset.repo,
      repoId: el.dataset.repoId,
      category: el.dataset.category,
      categoryId: el.dataset.categoryId,
      mapping: el.dataset.mapping,
      reactionsEnabled: el.dataset.reactionsEnabled,
      emitMetadata: el.dataset.emitMetadata,
      inputPosition: el.dataset.inputPosition,
      lightTheme: el.dataset.lightTheme,
      darkTheme: el.dataset.darkTheme,
      lang: el.dataset.lang,
    };
  }

  function resolveSiteTheme() {
    var theme = document.documentElement.getAttribute("data-theme") || "auto";
    if (theme === "dark") return "dark";
    if (theme === "light") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function giscusThemeName() {
    var cfg = getConfig() || {};
    return resolveSiteTheme() === "dark"
      ? cfg.darkTheme || "dark"
      : cfg.lightTheme || "light";
  }

  function loadGiscus() {
    var cfg = getConfig();
    if (!cfg || !document.querySelector(".giscus")) return;

    var script = document.createElement("script");
    script.src = GISCUS_ORIGIN + "/client.js";
    script.setAttribute("data-repo", cfg.repo);
    script.setAttribute("data-repo-id", cfg.repoId);
    script.setAttribute("data-category", cfg.category);
    script.setAttribute("data-category-id", cfg.categoryId);
    script.setAttribute("data-mapping", cfg.mapping || "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", String(cfg.reactionsEnabled ?? 1));
    script.setAttribute("data-emit-metadata", String(cfg.emitMetadata ?? 0));
    script.setAttribute("data-input-position", cfg.inputPosition || "bottom");
    script.setAttribute("data-theme", giscusThemeName());
    script.setAttribute("data-lang", cfg.lang || "zh-CN");
    script.crossOrigin = "anonymous";
    script.async = true;
    document.body.appendChild(script);
  }

  window.syncGiscusTheme = function () {
    var iframe = document.querySelector("iframe.giscus-frame");
    if (!iframe) return;
    iframe.contentWindow.postMessage(
      { giscus: { setConfig: { theme: giscusThemeName() } } },
      GISCUS_ORIGIN
    );
  };

  window.addEventListener("message", function (event) {
    if (event.origin !== GISCUS_ORIGIN) return;
    if (event.data.giscus && event.data.giscus.discussion) {
      window.syncGiscusTheme();
    }
  });

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
    if ((document.documentElement.getAttribute("data-theme") || "auto") === "auto") {
      window.syncGiscusTheme();
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadGiscus);
  } else {
    loadGiscus();
  }
})();
