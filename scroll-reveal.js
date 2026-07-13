(function () {
  var STAGGER_GROUPS = [
    { parent: ".service-showcase", child: ".service-showcase-item", effect: "fade-up" },
    { parent: ".why-grid", child: ".why-item", effect: "fade-up" },
    { parent: ".pricing-packages", child: ".pricing-package-card", effect: "fade-up" },
    { parent: ".pricing-extras", child: ".pricing-extra-card", effect: "fade-up" },
  ];

  var SINGLE_GROUPS = [
    { selector: ".cta-band-inner", effect: "fade-in" },
    { selector: ".scope-block", effect: "fade-up" },
    { selector: ".pricing-intro", effect: "fade-up" },
    { selector: ".pricing-panels", effect: "fade-up" },
    { selector: ".pricing-notice", effect: "fade-in" },
    { selector: ".about-inner", effect: "fade-up" },
  ];

  var OBSERVER_OPTIONS = {
    root: null,
    rootMargin: "0px 0px -8% 0px",
    threshold: 0.15,
  };

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function usesPcStagger() {
    return window.matchMedia("(pointer: fine)").matches;
  }

  function getPcStaggerMs() {
    return 300;
  }

  function prepareSingleGroup(group) {
    var items = document.querySelectorAll(group.selector);
    items.forEach(function (el) {
      el.classList.add("reveal", "reveal--" + group.effect);
    });
    return Array.prototype.slice.call(items);
  }

  function preparePcStaggerGroup(group) {
    var parent = document.querySelector(group.parent);
    if (!parent) return null;

    var items = parent.querySelectorAll(group.child);
    var staggerMs = getPcStaggerMs();

    items.forEach(function (el, index) {
      el.classList.add("reveal", "reveal--" + group.effect);
      el.style.setProperty("--reveal-delay", index * staggerMs + "ms");
    });

    return { parent: parent, items: items };
  }

  function prepareMobileStaggerGroup(group) {
    var parent = document.querySelector(group.parent);
    if (!parent) return [];

    var items = parent.querySelectorAll(group.child);
    items.forEach(function (el) {
      el.classList.add("reveal", "reveal--" + group.effect);
      el.style.setProperty("--reveal-delay", "0ms");
    });

    return Array.prototype.slice.call(items);
  }

  function revealNodes(nodes) {
    nodes.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  function createObserver() {
    return new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var items = entry.target._revealItems;
        if (items) {
          revealNodes(Array.prototype.slice.call(items));
        } else {
          entry.target.classList.add("is-visible");
        }

        observer.unobserve(entry.target);
      });
    }, OBSERVER_OPTIONS);
  }

  function initMobileFixedCta() {
    var cta = document.querySelector(".fixed-cta");
    var hero = document.querySelector(".hero");
    var footer = document.querySelector(".site-footer");
    if (!cta || !hero || !footer) return;

    var mobileQuery = window.matchMedia("(pointer: coarse) and (max-width: 1024px)");
    var ticking = false;

    function shouldShowCta() {
      if (!mobileQuery.matches) return false;

      var heroBottom = hero.getBoundingClientRect().bottom;
      var footerTop = footer.getBoundingClientRect().top;

      var passedHero = heroBottom <= window.innerHeight * 0.2;
      var nearFooter = footerTop <= window.innerHeight + 56;

      return passedHero && !nearFooter;
    }

    function syncCtaVisibility() {
      cta.classList.toggle("is-visible", shouldShowCta());
    }

    function onScrollOrResize() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        syncCtaVisibility();
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", onScrollOrResize);
    } else if (typeof mobileQuery.addListener === "function") {
      mobileQuery.addListener(onScrollOrResize);
    }

    syncCtaVisibility();
  }

  function init() {
    var singleTargets = [];

    SINGLE_GROUPS.forEach(function (group) {
      singleTargets = singleTargets.concat(prepareSingleGroup(group));
    });

    var pcStaggerParents = [];

    if (usesPcStagger()) {
      STAGGER_GROUPS.forEach(function (group) {
        var prepared = preparePcStaggerGroup(group);
        if (prepared) pcStaggerParents.push(prepared);
      });
    } else {
      STAGGER_GROUPS.forEach(function (group) {
        singleTargets = singleTargets.concat(prepareMobileStaggerGroup(group));
      });
    }

    if (prefersReducedMotion()) {
      revealNodes(document.querySelectorAll(".reveal"));
      return;
    }

    var observer = createObserver();

    pcStaggerParents.forEach(function (group) {
      group.parent._revealItems = group.items;
      observer.observe(group.parent);
    });

    singleTargets.forEach(function (el) {
      observer.observe(el);
    });

    initMobileFixedCta();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
