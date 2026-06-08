(function () {
  "use strict";

  var canvas = document.getElementById("lines-bg");
  if (!canvas) return;

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  var ctx = canvas.getContext("2d");
  var lines = [];
  var animId = null;
  var w = 0;
  var h = 0;

  var LINE_COUNT = 18;
  var SPEED = 0.3;

  function getLineColor() {
    var theme = document.documentElement.getAttribute("data-theme");
    if (theme === "dark") return "rgba(255,255,255,0.075)";
    if (theme === "light") return "rgba(0,0,0,0.09)";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "rgba(255,255,255,0.075)"
      : "rgba(0,0,0,0.09)";
  }

  function createLine() {
    var horizontal = Math.random() > 0.5;
    return {
      horizontal: horizontal,
      pos: horizontal ? Math.random() * h : Math.random() * w,
      offset: Math.random() * 2000,
      length: 80 + Math.random() * 200,
      speed: (0.2 + Math.random() * 0.5) * SPEED,
      drift: (Math.random() - 0.5) * 0.15,
    };
  }

  function initLines() {
    lines = [];
    for (var i = 0; i < LINE_COUNT; i++) {
      lines.push(createLine());
    }
  }

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    initLines();
  }

  function drawLine(line, t) {
    var color = getLineColor();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();

    if (line.horizontal) {
      var x = ((t * line.speed + line.offset) % (w + line.length)) - line.length;
      var y = line.pos + Math.sin(t * 0.001 + line.offset) * 12;
      ctx.moveTo(x, y);
      ctx.lineTo(x + line.length, y + line.drift * line.length);
    } else {
      var y2 = ((t * line.speed + line.offset) % (h + line.length)) - line.length;
      var x2 = line.pos + Math.sin(t * 0.001 + line.offset) * 12;
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 + line.drift * line.length, y2 + line.length);
    }

    ctx.stroke();
  }

  function drawGrid(t) {
    var color = getLineColor();
    var gridSize = 60;
    var drift = Math.sin(t * 0.0003) * 8;

    ctx.strokeStyle = color.replace(/[\d.]+\)$/, "0.04)");
    ctx.lineWidth = 0.5;

    var startX = (drift % gridSize) - gridSize;
    for (var x = startX; x < w + gridSize; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    var startY = (drift * 0.7 % gridSize) - gridSize;
    for (var y = startY; y < h + gridSize; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  function frame(t) {
    ctx.clearRect(0, 0, w, h);
    drawGrid(t);
    for (var i = 0; i < lines.length; i++) {
      drawLine(lines[i], t);
    }
    animId = requestAnimationFrame(frame);
  }

  resize();
  animId = requestAnimationFrame(frame);

  window.addEventListener("resize", resize);

  var observer = new MutationObserver(function () {
    /* redraw picks up new color on next frame */
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      animId = requestAnimationFrame(frame);
    }
  });
})();
