/* RegTech Nexus AI GA4 event instrumentation.
   Uses the existing GA4 property G-TF41MZMKPN. Does not alter calculator or quiz logic.
   Business-success events must be emitted by the relevant feature only after success. */
(function () {
  "use strict";
  var MEASUREMENT_ID = "G-TF41MZMKPN";
  if (window.__rtGa4EventsLoaded) return;
  window.__rtGa4EventsLoaded = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  // The homepage already loads and configures this tag in index.html.
  // Other pages load it here so their page views and events use the same property.
  var hasTag = Array.prototype.some.call(document.scripts, function (script) {
    return (script.src || "").indexOf("googletagmanager.com/gtag/js?id=" + MEASUREMENT_ID) !== -1;
  });
  if (!hasTag) {
    var tag = document.createElement("script");
    tag.async = true;
    tag.src = "https://www.googletagmanager.com/gtag/js?id=" + MEASUREMENT_ID;
    document.head.appendChild(tag);
    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID);
  }

  function track(name, params) {
    if (typeof name !== "string" || !/^[a-z][a-z0-9_]{1,39}$/.test(name)) return;
    var safe = Object.assign({ page_path: location.pathname }, params || {});
    // Never pass form values, email addresses, names, free text, or other PII.
    ["email", "name", "phone", "message", "query", "search_term", "value"].forEach(function (key) {
      if (Object.prototype.hasOwnProperty.call(safe, key)) delete safe[key];
    });
    window.gtag("event", name, safe);
  }
  window.rtTrackEvent = track;

  document.addEventListener("click", function (event) {
    var link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
    if (!link) return;
    var href = link.getAttribute("href") || "";
    var label = (link.getAttribute("aria-label") || link.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80);
    if (/^(mailto:|tel:)/i.test(href)) {
      track("contact_click", { contact_method: href.split(":")[0], link_text: label });
      return;
    }
    if (/\.(pdf|docx?|xlsx?|pptx?|csv|zip)(?:[?#].*)?$/i.test(href)) {
      track("file_download", {
        file_name: href.split("/").pop().split(/[?#]/)[0].slice(0, 100),
        link_text: label
      });
    }
  }, true);

  // Capture submission attempts for diagnostics only. Do not count these as successful leads.
  document.addEventListener("submit", function (event) {
    var form = event.target;
    if (!form || form.tagName !== "FORM") return;
    track("form_submit_attempt", {
      form_id: (form.id || "").slice(0, 80),
      form_name: (form.getAttribute("name") || "").slice(0, 80)
    });
  }, true);
})();