/* Single release metadata source for the static pages. */
window.PAYSCALE_META = Object.freeze({
  version: '1.30',
  lastVerified: '24 September 2026'
});

document.querySelectorAll('[data-app-version]').forEach((element) => {
  element.textContent = 'Version ' + window.PAYSCALE_META.version;
});
