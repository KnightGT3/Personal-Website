/* Portfolio site behavior. No dependencies, no build step. */
(function () {
  "use strict";

  /* ---------- Current year in the footer ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("site-nav");

  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    // Tapping a link, or hitting Escape, dismisses the menu.
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- Hairline under the header once you scroll ---------- */
  var header = document.getElementById("site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Highlight the nav link for the section in view ---------- */
  // Only same-page anchors — an href like "/#work" is not a valid selector.
  var links = nav ? Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]')) : [];
  var sections = links
    .map(function (link) { return document.querySelector(link.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (link) {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === "#" + entry.target.id
            );
          });
        });
      },
      // Trip the switch when a section crosses the upper third of the viewport.
      { rootMargin: "-30% 0px -60% 0px" }
    );
    sections.forEach(function (section) { spy.observe(section); });
  }

  /* ---------- Fade content in as it enters the viewport ---------- */
  var revealables = document.querySelectorAll(".reveal");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!("IntersectionObserver" in window) || reducedMotion) {
    // No observer support, or the visitor asked for less motion: just show everything.
    revealables.forEach(function (el) { el.classList.add("visible"); });
  } else {
    var revealer = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // animate once, then stop watching
        });
      },
      { threshold: 0.12 }
    );
    revealables.forEach(function (el) { revealer.observe(el); });
  }

  /* ---------- Reading progress (article pages) ---------- */
  var article = document.querySelector(".article");
  var railFill = document.getElementById("rail-fill");
  var topFill = document.getElementById("read-progress-fill");

  if (article && (railFill || topFill)) {
    var updateProgress = function () {
      var rect = article.getBoundingClientRect();
      var scrollable = rect.height - window.innerHeight;
      var pct = scrollable > 0
        ? Math.min(1, Math.max(0, -rect.top / scrollable))
        : (rect.top <= 0 ? 1 : 0);
      var value = (pct * 100).toFixed(2) + "%";
      if (railFill) railFill.style.height = value;
      if (topFill) topFill.style.width = value;
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    updateProgress();
  }

  /* ---------- Highlight the rail entry for the section in view ---------- */
  var railLinks = Array.prototype.slice.call(
    document.querySelectorAll(".rail-list a")
  );
  var railSections = railLinks
    .map(function (link) { return document.querySelector(link.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && railSections.length) {
    var railSpy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          railLinks.forEach(function (link) {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === "#" + entry.target.id
            );
          });
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    railSections.forEach(function (section) { railSpy.observe(section); });
  }
})();
