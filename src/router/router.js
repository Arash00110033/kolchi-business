import { renderApp } from "../app.js";

/* =========================
   ROUTES STATE
========================= */

let currentRoute = "/";

/* =========================
   INIT ROUTER
========================= */

export function initRouter() {
  window.addEventListener("popstate", () => {
    currentRoute = window.location.pathname;
    renderApp(currentRoute);
  });

  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-link]");
    if (!link) return;

    e.preventDefault();

    const url = link.getAttribute("href");

    navigate(url);
  });
}

/* =========================
   NAVIGATE
========================= */

export function navigate(url) {
  window.history.pushState({}, "", url);

  currentRoute = url;

  renderApp(currentRoute);
}

/* =========================
   GET ROUTE
========================= */

export function getRoute() {
  return currentRoute;
}