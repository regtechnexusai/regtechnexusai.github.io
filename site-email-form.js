(() => {
  "use strict";
  const form = document.getElementById("site-email-form");
  if (!form) return;
  const submit = document.getElementById("site-email-submit");
  const challengeStatus = document.getElementById("site-email-challenge-status");
  const result = document.getElementById("site-email-result");
  const category = document.getElementById("site-email-category");
  if (category) {
    const requestedCategory = new URLSearchParams(window.location.search).get("category");
    if (requestedCategory && Array.from(category.options).some(option => option.value === requestedCategory)) {
      category.value = requestedCategory;
    }
  }
  let token = "";
  let widgetId = null;
  let submitting = false;
  const render = () => {
    if (!window.turnstile || widgetId !== null) return;
    try {
      widgetId = window.turnstile.render("#site-email-turnstile", {
        sitekey: "0x4AAAAAAF5yBlsssEZ2K6FF",
        action: "site_email",
        callback: value => {
          token = value;
          submit.disabled = false;
          challengeStatus.textContent = "Security check completed.";
        },
        "expired-callback": () => {
          token = "";
          submit.disabled = true;
          challengeStatus.textContent = "Security check expired. Please complete it again.";
        },
        "error-callback": () => {
          token = "";
          submit.disabled = true;
          challengeStatus.textContent = "Security check unavailable. Refresh the page and retry.";
        }
      });
    } catch {
      challengeStatus.textContent = "Security check could not load. Please refresh the page.";
    }
  };
  if (window.turnstile) render();
  else window.addEventListener("load", render, { once: true });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (submitting || !token) {
      result.textContent = "Complete the security check before submitting.";
      return;
    }
    if (!form.reportValidity()) return;
    submitting = true;
    submit.disabled = true;
    result.textContent = "Sending your enquiry securely…";
    const data = Object.fromEntries(new FormData(form).entries());
    data.turnstileToken = token;
    try {
      const response = await fetch("https://gaas-research-api-staging.regtechnexusai.workers.dev/api/email/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
        credentials: "omit",
        cache: "no-store"
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.status !== "sent") throw new Error(payload.error || "Your enquiry could not be sent. Please email regtechnexusai@gmail.com.");
      form.reset();
      result.textContent = "Thank you. Your enquiry has been sent to RegTech Nexus AI.";
    } catch (error) {
      result.textContent = error.message || "Your enquiry could not be sent. Please email regtechnexusai@gmail.com.";
    } finally {
      token = "";
      submitting = false;
      submit.disabled = true;
      if (window.turnstile && widgetId !== null) {
        try { window.turnstile.reset(widgetId); } catch {}
      }
      challengeStatus.textContent = "Complete the security check again before another submission.";
    }
  });
})();
