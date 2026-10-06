(() => {
  "use strict";

  // ---------- Footer year ----------
  // Avoids hardcoding a year that goes stale.
  document.getElementById("year").textContent = new Date().getFullYear();

  // ---------- Scroll reveal ----------
  // Use IntersectionObserver, not scroll events.
  // Scroll events fire on every frame → expensive. IO is browser-optimized.
  const revealEls = document.querySelectorAll(".reveal");

  // If the browser doesn't support IO, just show everything. Don't break the page.
  if (!("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          // Once revealed, stop watching — no need to re-run
          observer.unobserve(entry.target);
        }
      }
    },
    {
      // Trigger when 10% of the element is visible, with a small bottom margin
      // so it fires slightly before the element is fully in view.
      threshold: 0.1,
      rootMargin: "0px 0px -40px 0px",
    }
  );

  revealEls.forEach((el) => observer.observe(el));
})();