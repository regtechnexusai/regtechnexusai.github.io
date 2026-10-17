/* RegTech Nexus AI shared site shell.
   Additive presentation/navigation repair only: preserve page content and tools. */
(function () {
  "use strict";
  var path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/" || path === "/index.html") return;

  function make(tag, attrs, html) {
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) { el.setAttribute(key, attrs[key]); });
    if (html !== undefined) el.innerHTML = html;
    return el;
  }

  function addStandardHeader() {
    var header = document.querySelector("body > header");
    if (!header) {
      header = make("header", { "class": "nav rt-shell-header", "aria-label": "RegTech Nexus AI site navigation" });
      header.appendChild(make("a", { "class": "brand", "href": "/", "aria-label": "RegTech Nexus AI home" },
        '<img class="brand-logo" src="/regtech-nexus-ai-logo-2026.png" alt="RegTech Nexus AI" width="190" height="62">'));
      var menu = make("button", { "class": "menu rt-shell-menu", "type": "button", "aria-label": "Open menu", "aria-expanded": "false", "aria-controls": "rt-main-nav" }, "☰");
      header.appendChild(menu);
      header.appendChild(make("nav", { "id": "rt-main-nav", "class": "rt-shell-nav", "aria-label": "Main navigation" }, standardNav()));
      document.body.insertBefore(header, document.body.firstChild);
    } else {
      header.classList.add("rt-shell-header");
      var nav = header.querySelector("nav");
      if (!nav) {
        nav = make("nav", { "id": "rt-main-nav", "class": "rt-shell-nav", "aria-label": "Main navigation" }, standardNav());
        var cta = header.querySelector(".nav-cta");
        if (cta && cta.parentElement === header) header.insertBefore(nav, cta);
        else header.appendChild(nav);
      }
      nav.classList.add("rt-shell-nav");
      if (!nav.id) nav.id = "rt-main-nav";
      var menuButton = header.querySelector("button.menu, button[aria-controls]");
      if (!menuButton) {
        menuButton = make("button", { "class": "menu rt-shell-menu", "type": "button", "aria-label": "Open menu", "aria-expanded": "false", "aria-controls": nav.id }, "☰");
        nav.parentElement.insertBefore(menuButton, nav);
      }
      menuButton.classList.add("rt-shell-menu");
      menuButton.setAttribute("aria-controls", nav.id);
      if (!menuButton.getAttribute("aria-expanded")) menuButton.setAttribute("aria-expanded", "false");
      if (!menuButton.getAttribute("aria-label")) menuButton.setAttribute("aria-label", "Open menu");
      if (!header.querySelector("img")) {
        header.insertBefore(make("a", { "class": "brand rt-shell-brand", "href": "/", "aria-label": "RegTech Nexus AI home" },
          '<img class="brand-logo" src="/regtech-nexus-ai-logo-2026.png" alt="RegTech Nexus AI" width="190" height="62">'), header.firstChild);
      }
    }
  }

  function standardNav() {
    return '<span class="nav-menu-heading">Explore</span>' +
      '<a href="/">Home</a><a href="/#work">What we do</a><a href="/#solutions">Solutions</a>' +
      '<a href="/fintech-intelligence-hub/">FinTech Intelligence Hub</a>' +
      '<a href="/global-financial-systems.html">Regulatory Signal Labs &amp; Readiness</a>' +
      '<a href="/international-regulatory-calculators.html">Regulatory Calculators</a>' +
      '<a href="/regulatory-gap-analyzer/">Policy Gap Analyzer</a><a href="/insights.html">Insights</a>' +
      '<a href="/explainable-ai.html">Explainable AI</a>' +
      '<span class="nav-menu-heading">Student learning</span><a href="/student/">Student Knowledge Hub</a>' +
      '<span class="nav-menu-heading">Tools &amp; utilities</span><a href="/sanctions-screening/">Official sanctions resources</a>' +
      '<a href="/contact.html">Contact</a>' +
      '<a href="https://chatgpt.com/g/g-6a09920b01348191b9b1628b69367d9b-regtech-nexus-ai" target="_blank" rel="noopener noreferrer">AI Assistant ↗</a>';
  }

  function addStandardFooter() {
    var footer = document.querySelector("footer");
    if (!footer) {
      footer = make("footer", { "class": "rt-shell-footer", "aria-label": "RegTech Nexus AI site footer" },
        '<div class="rt-shell-footer-brand"><a href="/" aria-label="RegTech Nexus AI home"><img src="/regtech-nexus-ai-logo-2026.png" alt="RegTech Nexus AI" width="230" height="70"></a>' +
        '<p>Audit · Regulatory Intelligence · Compliance · Risk · Technology</p></div>' +
        '<div><b>Solutions</b><a href="/tradeguard/">TradeGuard</a><a href="/icms-2026/">ICMS Toolkit</a>' +
        '<a href="/payscale-2026/">PayScale 2026 Calculator</a><a href="/regulatory-gap-analyzer/">Policy Gap Analyzer</a>' +
        '<a href="/derivatives/">Derivatives Risk &amp; Compliance</a><a href="/global-financial-systems.html">International Readiness Tools</a></div>' +
        '<div><b>Expertise</b><a href="/#capabilities">Audit &amp; Regulatory Intelligence</a><a href="/#capabilities">Compliance &amp; Financial Crime</a>' +
        '<a href="/#capabilities">Risk &amp; Governance</a><a href="/explainable-ai.html">Responsible AI</a></div>' +
        '<div><b>Knowledge</b><a href="/insights.html">Research &amp; Insights</a><a href="/blog.html">Blog</a>' +
        '<a href="/regulatory-explainers.html">Regulatory Explainers</a><a href="/frameworks-toolkit.html">Frameworks &amp; Toolkits</a>' +
        '<a href="/publications.html">Publications</a><a href="/bank-use-review.html">Bank-use review</a><a href="/student/">Student Knowledge Hub</a></div>' +
        '<div><b>Connect</b><a href="https://www.linkedin.com/company/regtech-nexus-ai/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>' +
        '<a href="https://www.facebook.com/regtechnexusai" target="_blank" rel="noopener noreferrer">Facebook ↗</a>' +
        '<a href="https://youtube.com/@regtechnexusai" target="_blank" rel="noopener noreferrer">YouTube ↗</a>' +
        '<a href="/contact.html">Contact</a><a href="/visitor-feedback.html">Visitor Feedback</a></div>' +
        '<p class="footer-note rt-shell-footer-note">Research and digital tools support professional analysis. They do not provide legal advice, regulatory approval or an automatic compliance determination. Review findings against evidence and applicable requirements.</p>' +
        '<div class="legal rt-shell-legal"><span>© 2026 RegTech Nexus AI</span><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a><a href="/contact.html">Contact</a><a href="/#about">Responsible use</a></div>');
      document.body.appendChild(footer);
    } else {
      footer.classList.add("rt-shell-existing-footer");
    }
  }

  function bindMenu() {
    var header = document.querySelector("body > header.rt-shell-header");
    if (!header) return;
    var button = header.querySelector("button.rt-shell-menu");
    var nav = header.querySelector("nav.rt-shell-nav");
    if (!button || !nav || button.getAttribute("data-rt-bound") === "true") return;
    button.setAttribute("data-rt-bound", "true");
    function close() {
      nav.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", "Open menu");
    }
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      var open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }, true);
    nav.addEventListener("click", function (event) {
      if (event.target && event.target.closest && event.target.closest("a")) close();
    });
    document.addEventListener("click", function (event) {
      if (!header.contains(event.target)) close();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") close();
    });
  }

  function addBackHome() {
    if (document.querySelector(".rt-back-home")) return;
    var a = make("a", { "class": "rt-back-home", "href": "/", "aria-label": "Back to RegTech Nexus AI homepage" },
      '<span aria-hidden="true">←</span><span>Back to Home</span>');
    document.body.appendChild(a);
  }

  function ensureShellStyles() {
    var found = Array.prototype.some.call(document.querySelectorAll('link[rel="stylesheet"]'), function (link) {
      return /\/site-wide-shell\.css(?:\?|$)/.test(link.getAttribute("href") || "");
    });
    if (found && !document.querySelector('link[data-rt-shell-latest="true"]')) {
      var css = make("link", { "rel": "stylesheet", "href": "/site-wide-shell.css?v=20261017-v2", "data-rt-shell-latest": "true" });
      document.head.appendChild(css);
    }
  }

  function init() {
    if (!document.body) return;
    ensureShellStyles();
    addStandardHeader();
    addStandardFooter();
    bindMenu();
    addBackHome();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();