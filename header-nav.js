(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.getElementById("header-menu-toggle");
  var nav = document.getElementById("header-nav");
  if (!header || !toggle || !nav) return;

  var mobileQuery = window.matchMedia("(pointer: coarse) and (max-width: 1024px)");
  var lastScrollY = window.scrollY || 0;
  var ticking = false;
  var hideOffset = 64;

  function setNavOpen(isOpen) {
    header.classList.toggle("is-nav-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");

    if (isOpen) {
      header.classList.remove("is-header-hidden");
    }
  }

  function closeNav() {
    setNavOpen(false);
  }

  function syncHeaderVisibility() {
    if (!mobileQuery.matches) {
      header.classList.remove("is-header-hidden");
      closeNav();
      lastScrollY = window.scrollY || 0;
      return;
    }

    if (header.classList.contains("is-nav-open")) {
      header.classList.remove("is-header-hidden");
      return;
    }

    var currentY = window.scrollY || 0;
    var goingDown = currentY > lastScrollY;
    var pastTop = currentY > hideOffset;

    if (goingDown && pastTop) {
      header.classList.add("is-header-hidden");
    } else {
      header.classList.remove("is-header-hidden");
    }

    lastScrollY = currentY;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      syncHeaderVisibility();
      ticking = false;
    });
  }

  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    setNavOpen(!header.classList.contains("is-nav-open"));
  });

  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeNav();
  });

  document.addEventListener("click", function (e) {
    if (!header.classList.contains("is-nav-open")) return;
    if (header.contains(e.target)) return;
    closeNav();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", onScroll);
  } else if (typeof mobileQuery.addListener === "function") {
    mobileQuery.addListener(onScroll);
  }

  syncHeaderVisibility();
})();
