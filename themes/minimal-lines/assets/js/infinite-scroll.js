(function () {
  "use strict";

  var list = document.querySelector("[data-infinite-scroll]");
  if (!list) return;

  var container = list.parentElement;
  var infinite = container && container.querySelector(".infinite-scroll");
  var sentinel = infinite && infinite.querySelector(".infinite-scroll-sentinel");
  var status = infinite && infinite.querySelector(".infinite-scroll-status");
  var end = infinite && infinite.querySelector(".infinite-scroll-end");
  if (!infinite || !sentinel) return;

  var nextPage = list.getAttribute("data-next-page");
  if (!nextPage) {
    complete();
    return;
  }

  var loading = false;

  function setVisible(el, visible) {
    if (!el) return;
    el.hidden = !visible;
  }

  function complete() {
    list.removeAttribute("data-next-page");
    infinite.classList.add("is-complete");
    setVisible(status, false);
    setVisible(end, true);
    observer.disconnect();
  }

  function getNextPage(doc) {
    var link = doc.querySelector(".pagination-next");
    if (!link || link.classList.contains("disabled")) return null;
    return link.getAttribute("href");
  }

  function loadNext() {
    if (loading || !nextPage) return;
    loading = true;
    setVisible(status, true);
    setVisible(end, false);

    fetch(nextPage, { credentials: "same-origin" })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var items = doc.querySelectorAll(".post-list .post-item");
        items.forEach(function (item) {
          list.appendChild(item);
        });

        nextPage = getNextPage(doc);
        if (nextPage) {
          list.setAttribute("data-next-page", nextPage);
        } else {
          complete();
        }
      })
      .catch(function () {
        setVisible(status, false);
        if (end) {
          end.textContent = "加载失败，请刷新重试";
          setVisible(end, true);
        }
        observer.disconnect();
      })
      .finally(function () {
        loading = false;
        if (nextPage) setVisible(status, false);
      });
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) loadNext();
      });
    },
    { rootMargin: "240px 0px" }
  );

  observer.observe(sentinel);
})();
