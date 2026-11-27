(function () {
  "use strict";

  var MEASUREMENT_ID = "G-TF41MZMKPN";
  var STORAGE_KEY = "rtn.analytics-consent.v1";
  var STYLE_URL = "/site-analytics-consent.css?v=20261126-v1";
  var SCRIPT_URL = "https://www.googletagmanager.com/gtag/js?id=" + MEASUREMENT_ID;
  var choice = null;
  var analyticsLoaded = false;

  function readChoice() {
    try {
      var value = window.localStorage.getItem(STORAGE_KEY);
      return value === "accepted" || value === "rejected" ? value : null;
    } catch (error) {
      return null;
    }
  }

  function saveChoice(value) {
    choice = value;
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      /* The current-page choice still applies if browser storage is unavailable. */
    }
  }

  function clearAnalyticsCookies() {
    var names = document.cookie.split(";").map(function (item) {
      return item.split("=")[0].trim();
    }).filter(function (name) {
      return /^(_ga|_gid|_gat|_gcl_au|__utm)/.test(name);
    });
    names.forEach(function (name) {
      document.cookie = name + "=; Max-Age=0; path=/; SameSite=Lax";
      if (location.hostname === "regtechnexusai.com" || location.hostname.endsWith(".regtechnexusai.com")) {
        document.cookie = name + "=; Max-Age=0; path=/; domain=.regtechnexusai.com; SameSite=Lax";
      }
    });
  }

  function loadAnalytics() {
    if (analyticsLoaded || choice !== "accepted") return;
    analyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID, { anonymize_ip: true });

    var script = document.createElement("script");
    script.async = true;
    script.src = SCRIPT_URL;
    script.referrerPolicy = "strict-origin-when-cross-origin";
    script.onerror = function () {
      analyticsLoaded = false;
    };
    document.head.appendChild(script);
  }

  function addStylesheet() {
    if (document.querySelector('link[data-rtn-analytics-consent-style="true"]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = STYLE_URL;
    link.setAttribute("data-rtn-analytics-consent-style", "true");
    document.head.appendChild(link);
  }

  function makeButton(label, className, handler) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.addEventListener("click", handler);
    return button;
  }

  function init() {
    choice = readChoice();
    if (choice === "accepted") loadAnalytics();
    if (choice === "rejected") clearAnalyticsCookies();

    addStylesheet();

    var panel = document.createElement("section");
    panel.className = "rtn-consent-panel";
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-label", "Privacy and analytics choices");
    panel.hidden = true;

    var copy = document.createElement("div");
    copy.className = "rtn-consent-copy";
    var heading = document.createElement("strong");
    heading.textContent = "Your privacy choices";
    var message = document.createElement("p");
    message.textContent = "RegTech Nexus AI keeps optional Google Analytics disabled unless you choose to accept it. You can reject analytics and still use the website.";
    copy.append(heading, message);

    var actions = document.createElement("div");
    actions.className = "rtn-consent-actions";
    var accept = makeButton("Accept analytics", "rtn-consent-accept", function () {
      saveChoice("accepted");
      panel.hidden = true;
      settings.hidden = false;
      loadAnalytics();
    });
    var reject = makeButton("Reject optional analytics", "rtn-consent-reject", function () {
      saveChoice("rejected");
      clearAnalyticsCookies();
      panel.hidden = true;
      settings.hidden = false;
    });
    actions.append(accept, reject);
    panel.append(copy, actions);

    var settings = makeButton("Privacy choices", "rtn-consent-settings", function () {
      panel.hidden = !panel.hidden;
      settings.setAttribute("aria-expanded", String(!panel.hidden));
      if (!panel.hidden) accept.focus();
    });
    settings.setAttribute("aria-expanded", "false");

    document.body.append(panel, settings);
    if (!choice) panel.hidden = false;
    settings.hidden = !choice;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();