/* Portfolio site behavior. */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ScrollTrigger is a plugin, so it has to be registered before any
// scrollTrigger:{} config is read. Doing it once at module scope is enough.
gsap.registerPlugin(ScrollTrigger);

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

  /* ---------- Portrait crossfade ----------
     Hover and keyboard focus are handled in CSS. Touch devices have no
     hover, so a tap toggles a sticky .swapped class instead. The fade
     itself is a CSS transition, which is what lets the reduced-motion
     media query turn it into an instant swap. */
  var portraitSwap = document.querySelector(".portrait-swap");

  if (portraitSwap) {
    portraitSwap.addEventListener("click", function () {
      var swapped = !portraitSwap.classList.contains("swapped");
      portraitSwap.classList.toggle("swapped", swapped);
      portraitSwap.setAttribute("aria-pressed", String(swapped));
    });
  }

  /* ============================================================
     Scroll animation (homepage only)

     Everything lives inside gsap.matchMedia(), which is GSAP's
     media-query-aware context. Animations created inside its callback are
     only built while the query matches, and GSAP reverts them
     automatically when it stops matching — so a visitor who has "reduce
     motion" turned on never gets these animations at all, and the page
     stays a normal static scroll. That is why the reduced-motion check is
     the query itself rather than an if-statement inside the animation.
     ============================================================ */
  var hero = document.querySelector(".hero.photo-section");

  if (document.body.classList.contains("home") && hero) {
    var mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", function () {
      // CSS `scroll-behavior: smooth` fights ScrollTrigger's scrub: the
      // browser animates the scroll position while GSAP reads it, which
      // reads as stutter. Disable it while these animations are live and
      // restore it in the cleanup below.
      var htmlEl = document.documentElement;
      var priorScrollBehavior = htmlEl.style.scrollBehavior;
      htmlEl.style.scrollBehavior = "auto";

      /* ---------- Hero pin ---------- */
      var heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,

          // start/end define the scroll window this timeline maps onto.
          // "top top" = when the top of the hero reaches the top of the
          // viewport (immediately, since the hero is first on the page).
          start: "top top",

          // "+=100%" = the window lasts one viewport height of scrolling.
          // That is the "about one viewport of scroll" you asked for.
          end: "+=100%",

          // pin freezes the element in place for that window. GSAP does
          // this by fixing it and inserting a spacer of equal height, so
          // the rest of the page keeps its normal flow.
          pin: true,

          // pinSpacing keeps that spacer. With it, the next section slides
          // up into view exactly as the pin releases. Set it to false and
          // the following section would overlap the hero instead.
          pinSpacing: true,

          // scrub ties progress to scroll position rather than playing on
          // a timer, so dragging the scrollbar backwards rewinds it. `true`
          // is 1:1; a number like 0.5 adds that many seconds of catch-up.
          scrub: true,

          // anticipatePin looks slightly ahead of the scroll position when
          // pinning. Without it, fast scrolling can show a one-frame jump
          // as the element switches to fixed positioning.
          anticipatePin: 1,

          // Recalculates start/end on refresh instead of caching them,
          // which matters here because the lazy-loaded photographs change
          // the page height after first paint.
          invalidateOnRefresh: true
        }
      });

      // Position parameter `0` on each tween starts them all together, so
      // the zoom, the fade to black, and the text exit run as one move.
      heroTl
        .to(hero.querySelector(".section-bg-img"), { scale: 1.15, ease: "none" }, 0)
        .to(hero.querySelector(".section-bg-fade"), { opacity: 1, ease: "none" }, 0)
        // Animating the wrapper, not the .reveal children, leaves the
        // existing reveal system in sole control of their opacity.
        .to(hero.querySelector(".hero-content"), { y: -80, opacity: 0, ease: "none" }, 0);

      /* ---------- Background colour journey ---------- */
      // The body starts at #0b0d12 from the stylesheet. Each stop scrubs
      // the body toward its colour as that section approaches, and scrub
      // means scrolling back up runs the transition in reverse.
      var colourStops = [
        { selector: "#work", color: "#272430" },    // warm slate
        { selector: "#contact", color: "#3a2308" }  // deep amber
      ];

      colourStops.forEach(function (stop) {
        var section = document.querySelector(stop.selector);
        if (!section) return;

        gsap.to(document.body, {
          backgroundColor: stop.color,
          ease: "none",
          scrollTrigger: {
            trigger: section,

            // "top bottom" = the section's top touching the viewport's
            // bottom, i.e. the moment it first peeks into view.
            start: "top bottom",

            // "top center" = its top reaching the middle of the screen.
            // The colour is fully swapped by the time you are reading it.
            end: "top center",

            scrub: true
          }
        });
      });

      // matchMedia cleanup: GSAP reverts the animations itself, so this
      // only has to undo the side effect it cannot know about.
      return function () {
        htmlEl.style.scrollBehavior = priorScrollBehavior;
      };
    });

    // Lazy-loaded photos land after first paint and change the document
    // height, which invalidates every start/end ScrollTrigger measured.
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  }
})();
