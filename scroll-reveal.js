(function () {
  var STAGGER_GROUPS = [
    { parent: ".service-showcase", child: ".service-showcase-item", effect: "fade-up" },
    { parent: ".why-grid", child: ".why-item", effect: "fade-up" },
  ];

  var SINGLE_GROUPS = [
    { selector: ".cta-band-inner", effect: "fade-in" },
    { selector: ".scope-block", effect: "fade-up" },
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
