(() => {
  "use strict";

  // ---------- Footer year ----------
  document.getElementById("year").textContent = new Date().getFullYear();

  // ============================================================
  // THEME TOGGLE
  // The initial theme is already applied by the inline script in <head>.
  // Here we just handle toggling and persistence after that.
  // ============================================================

  const root = document.documentElement;
  const toggleBtn = document.getElementById("themeToggle");

  // Reflect the current theme on the button's aria-pressed.
  // Call this whenever the theme changes.
  function syncToggleAria() {
    const isDark = root.getAttribute("data-theme") === "dark";
    toggleBtn.setAttribute("aria-pressed", String(isDark));
  }

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      // localStorage can be blocked (private mode, storage quota, etc.)
      // Theme still works for this session — just won't persist.
    }
    syncToggleAria();
  }

  toggleBtn.addEventListener("click", () => {
    const current = root.getAttribute("data-theme");
    setTheme(current === "dark" ? "light" : "dark");
  });

  // If the user has no explicit preference saved, follow OS changes live.
  // If they've saved a preference, respect it — don't override their choice.
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", (e) => {
    let saved = null;
    try { saved = localStorage.getItem("theme"); } catch (_) {}
    if (!saved) setTheme(e.matches ? "dark" : "light");
  });

  syncToggleAria();

  // ============================================================
  // CTA FORM
  // ============================================================

  const form = document.getElementById("ctaForm");
  const msg  = document.getElementById("ctaMsg");
  const email = document.getElementById("cta-email");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const value = email.value.trim();
    // Same intentionally-loose email regex as Task 2.
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    if (!ok) {
      msg.textContent = "Enter a valid email address.";
      email.focus();
      return;
    }

    // No backend. This is where you'd POST to your API.
    // Simulate success for the demo.
    msg.textContent = "Thanks — check your inbox for the setup link.";
    form.reset();
  });
})();