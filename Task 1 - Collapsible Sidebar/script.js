(() => {
  "use strict";

  const body     = document.body;
  const toggle   = document.getElementById("sidebarToggle");
  const sidebar  = document.getElementById("sidebar");
  const backdrop = document.getElementById("backdrop");

  // Breakpoint must match the CSS media query (max-width: 640px).
  // Keeping this in sync with CSS is a maintenance risk — see notes below.
  const MOBILE_BREAKPOINT = 640;
  const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;

  /**
   * Apply a state. Single function, single source of truth.
   * Every mutation of the DOM happens here — no state scattered elsewhere.
   */
  function setState(open) {
    body.dataset.sidebar = open ? "open" : "closed";
    toggle.setAttribute("aria-expanded", String(open));
    // On mobile the sidebar is an overlay: when closed it must be hidden from AT.
    // On desktop, collapsed rail is still visible/interactive, so we don't hide it.
    sidebar.setAttribute("aria-hidden", String(!open && isMobile()));
  }

  function toggleState() {
    setState(body.dataset.sidebar !== "open");
  }

  // --- Events ---
  toggle.addEventListener("click", toggleState);

  // Backdrop click closes the sidebar (mobile overlay behavior)
  backdrop.addEventListener("click", () => setState(false));

  // Escape key closes — standard a11y expectation for dismissible panels
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && body.dataset.sidebar === "open") {
      setState(false);
      toggle.focus(); // return focus to the control that opened it
    }
  });

  // On resize across the breakpoint, reset state so we don't leak mobile
  // "closed" state into desktop (where it means "collapsed rail") and vice versa.
  let lastWasMobile = isMobile();
  window.addEventListener("resize", () => {
    const nowMobile = isMobile();
    if (nowMobile !== lastWasMobile) {
      lastWasMobile = nowMobile;
      // Desktop default = open (collapsed rail is opt-in). Mobile default = closed.
      setState(!nowMobile);
    }
  });

  // Initialize to a sane default on load
  setState(!isMobile());
})();