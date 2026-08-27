(function () {
  var root = document.getElementById("float-contact");
  var toggle = document.getElementById("float-contact-toggle");
  var menu = document.getElementById("float-contact-menu");
  if (!root || !toggle || !menu) return;

  function setOpen(isOpen) {
    root.classList.toggle("is-open", isOpen);
    menu.setAttribute("aria-hidden", String(!isOpen));
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "문의 채널 닫기" : "문의 채널 열기");
  }

  function close() {
    setOpen(false);
  }

  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    setOpen(!root.classList.contains("is-open"));
  });

  menu.addEventListener("click", function (e) {
    var link = e.target.closest("a");
    if (!link) return;
    close();
  });

  document.addEventListener("click", function (e) {
    if (!root.classList.contains("is-open")) return;
    if (root.contains(e.target)) return;
    close();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });
})();
