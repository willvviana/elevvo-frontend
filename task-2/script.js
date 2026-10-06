(() => {
  "use strict";

  const form      = document.getElementById("contactForm");
  const success   = document.getElementById("success");
  const resetBtn  = document.getElementById("resetBtn");

  // Field definitions: selector + validation rule.
  // One place to add/remove a field. No repeated logic per input.
  const FIELDS = [
    {
      id: "name",
      validate: (v) => v.trim().length >= 2 || "Enter your full name.",
    },
    {
      id: "email",
      validate: (v) => {
        if (!v.trim()) return "Email is required.";
        // Deliberately permissive. Real email validation is a server job.
        // This catches typos, not exotic-but-valid addresses.
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
        return ok || "Enter a valid email address.";
      },
    },
    {
      id: "subject",
      validate: (v) => v.trim().length >= 3 || "Subject is required.",
    },
    {
      id: "message",
      validate: (v) => v.trim().length >= 10 || "Message must be at least 10 characters.",
    },
  ];

  // Track whether user has attempted submit.
  // Before submit: no validation UI. After: validate on blur too.
  // This is the standard UX — don't yell at the user while they're typing.
  let submitted = false;

  function getField(id) {
    return document.getElementById(id);
  }

  function getErrorEl(id) {
    return document.getElementById(`${id}-error`);
  }

  /**
   * Validate one field. Returns true if valid.
   * Writes error message and toggles .is-invalid on the wrapper.
   */
  function validateField(field) {
    const input = getField(field.id);
    const errorEl = getErrorEl(field.id);
    const wrapper = input.closest(".field");

    const result = field.validate(input.value);
    const valid = result === true;

    if (valid) {
      wrapper.classList.remove("is-invalid");
      errorEl.textContent = "";
      input.removeAttribute("aria-invalid");
    } else {
      wrapper.classList.add("is-invalid");
      errorEl.textContent = result;
      input.setAttribute("aria-invalid", "true");
    }
    return valid;
  }

  // Validate all fields. Focus the first invalid one. Returns true if all pass.
  function validateAll() {
    let firstInvalid = null;
    for (const field of FIELDS) {
      if (!validateField(field) && !firstInvalid) {
        firstInvalid = getField(field.id);
      }
    }
    if (firstInvalid) firstInvalid.focus();
    return firstInvalid === null;
  }

  // After the first submit attempt, re-validate each field on blur.
  // The user gets feedback when they leave a bad field, not on every keystroke.
  FIELDS.forEach((field) => {
    const input = getField(field.id);
    input.addEventListener("blur", () => {
      if (submitted) validateField(field);
    });
    // Clear error as soon as the user fixes it (live feedback after submit)
    input.addEventListener("input", () => {
      if (submitted && input.closest(".field").classList.contains("is-invalid")) {
        validateField(field);
      }
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();        // no backend — stop the page reload
    submitted = true;

    if (!validateAll()) return;

    // In a real app: send the data here.
    // e.g. await fetch('/api/contact', { method: 'POST', body: new FormData(form) });
    // For now, swap the form for a success panel.
    form.hidden = true;
    success.hidden = false;
    success.querySelector("h2").focus?.();  // move focus for screen readers
  });

  // "Send another" — reset everything back to initial state
  resetBtn.addEventListener("click", () => {
    form.reset();
    submitted = false;
    // Clear any lingering error styles
    for (const field of FIELDS) {
      const wrapper = getField(field.id).closest(".field");
      wrapper.classList.remove("is-invalid");
      getErrorEl(field.id).textContent = "";
    }
    success.hidden = true;
    form.hidden = false;
    getField("name").focus();
  });
})();