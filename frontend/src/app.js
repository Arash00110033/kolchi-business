import {
  subscribe
} from "./store/store.js";


import {
  renderApp
} from "./app/render.js";


import {
  bindKeyboardEvents
} from "./app/keyboard.events.js";


import {
  bindClickEvents
} from "./app/click.events.js";


import {
  bindSearchEvents
} from "./app/search.events.js";


import {
  bindFilterEvents
} from "./app/filter.events.js";


/* ==================================================
   ROOT
================================================== */

const app =
  document.getElementById("app");


if (!app) {

  throw new Error(
    "APP ROOT NOT FOUND"
  );

}


/* ==================================================
   INIT APPLICATION
================================================== */

export function initApp() {


  /*
   * Register global event handlers
   *
   * Each event category
   * has its own module.
   */

  bindKeyboardEvents();

  bindClickEvents();

  bindSearchEvents();

  bindFilterEvents();


  /*
   * Re-render application
   * whenever store state changes.
   */

  subscribe(() => {

    renderApp(app);

  });

  /*
   * Re-render on route change.
   */

  window.addEventListener(
    "routechange",
    () => {

      renderApp(app);
  }
);
  /*
   * Initial render.
   */

  renderApp(app);


}