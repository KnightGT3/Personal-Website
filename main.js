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

  /* ---------- Reading progress (article pages) ----------
     The dot rides the leading edge of the fill. Its position interpolates
     between section entries, so scrolling through one long section slides it
     gradually toward the next label instead of snapping when the section
     boundary crosses. An eased follow smooths out trackpad jitter. */
  var article = document.querySelector(".article");
  var railFill = document.getElementById("rail-fill");
  var topFill = document.getElementById("read-progress-fill");
  var rail = document.querySelector(".reading-rail");

  var railStops = Array.prototype.slice
    .call(document.querySelectorAll(".rail-list a"))
    .map(function (link) {
      var section = document.querySelector(link.getAttribute("href"));
      return section ? { link: link, section: section } : null;
    })
    .filter(Boolean);

  if (article && (railFill || topFill)) {
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var TRACK_INSET = 4; // matches .rail-track top/bottom in the stylesheet
    var targetY = 0;
    var currentY = 0;
    var frame = null;

    var railGeometry = function () {
      if (!rail || !railStops.length) return null;
      var railTop = rail.getBoundingClientRect().top;
      return railStops.map(function (stop) {
        var box = stop.link.getBoundingClientRect();
        var sectionBox = stop.section.getBoundingClientRect();
        return {
          center: box.top - railTop + box.height / 2,
          top: sectionBox.top + window.scrollY,
          height: sectionBox.height
        };
      });
    };

    var paint = function () {
      if (railFill) {
        railFill.style.height = Math.max(0, currentY - TRACK_INSET).toFixed(1) + "px";
      }
    };

    var step = function () {
      var delta = targetY - currentY;
      if (Math.abs(delta) < 0.3) {
        currentY = targetY;
        paint();
        frame = null;
        return;
      }
      currentY += delta * 0.18; // ease toward the target
      paint();
      frame = window.requestAnimationFrame(step);
    };

    var update = function () {
      // Overall article progress drives the narrow-screen bar.
      var box = article.getBoundingClientRect();
      var scrollable = box.height - window.innerHeight;
      var overall = scrollable > 0
        ? Math.min(1, Math.max(0, -box.top / scrollable))
        : (box.top <= 0 ? 1 : 0);
      if (topFill) topFill.style.width = (overall * 100).toFixed(2) + "%";

      var stops = railGeometry();
      if (!stops || !railFill) return;

      // Where the reader's eye is, roughly a third down the viewport.
      var readingLine = window.scrollY + window.innerHeight * 0.33;

      var i = 0;
      while (i < stops.length - 1 && readingLine >= stops[i + 1].top) i++;

      var here = stops[i];
      var fraction = here.height > 0 ? (readingLine - here.top) / here.height : 0;
      fraction = Math.min(1, Math.max(0, fraction));

      var nextCenter = i < stops.length - 1 ? stops[i + 1].center : here.center;
      targetY = here.center + (nextCenter - here.center) * fraction;

      // Nearest label lights up, so the text follows the dot rather than
      // leading or lagging it.
      var nearest = 0;
      var shortest = Infinity;
      stops.forEach(function (stop, index) {
        var distance = Math.abs(stop.center - targetY);
        if (distance < shortest) { shortest = distance; nearest = index; }
      });
      railStops.forEach(function (stop, index) {
        stop.link.classList.toggle("active", index === nearest);
      });

      if (reduceMotion) {
        currentY = targetY;
        paint();
      } else if (frame === null) {
        frame = window.requestAnimationFrame(step);
      }
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("load", update);
    update();
  }
})();
