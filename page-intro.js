(function () {
  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function playIntro() {
    document.body.classList.add("is-intro-play");
  }

  function init() {
    if (!document.querySelector(".intro-fade")) return;

    if (prefersReducedMotion()) {
      playIntro();
      return;
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(playIntro);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
