(function () {
  "use strict";

  var MERMAID_URL =
    "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";

  function isDark() {
    var theme = document.documentElement.getAttribute("data-theme");
    if (theme === "dark") return true;
    if (theme === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function init() {
    var nodes = document.querySelectorAll(".mermaid");
    if (!nodes.length) return;

    import(MERMAID_URL).then(function (mod) {
      var mermaid = mod.default;
      mermaid.initialize({
        startOnLoad: false,
        theme: isDark() ? "dark" : "neutral",
        securityLevel: "strict",
      });
      mermaid.run({ nodes: nodes });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
