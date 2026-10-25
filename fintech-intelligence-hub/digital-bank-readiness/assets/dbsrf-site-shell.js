/* Accessible mobile navigation for the DBSRF shared site shell. */
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("header.nav");
  const menu = header?.querySelector("button.menu");
  const nav = header?.querySelector("#main-nav");
  if (!header || !menu || !nav) return;
  menu.addEventListener("click", () => {
    const expanded = menu.getAttribute("aria-expanded") === "true";
    menu.setAttribute("aria-expanded", String(!expanded));
    menu.setAttribute("aria-label", expanded ? "Open menu" : "Close menu");
    menu.textContent = expanded ? "☰" : "✕";
    header.classList.toggle("nav-open", !expanded);
  });
  nav.addEventListener("click", event => {
    if (event.target.closest("a") && window.matchMedia("(max-width: 760px)").matches) {
      header.classList.remove("nav-open");
      menu.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-label", "Open menu");
      menu.textContent = "☰";
    }
  });
});
