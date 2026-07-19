/* ==================================================
   ROUTER
================================================== */


/* ==================================================
   ROUTES STATE
================================================== */

let currentRoute =
  window.location.pathname;


/* ==================================================
   INIT ROUTER
================================================== */

export function initRouter() {


  /* ==================================================
     BROWSER BACK / FORWARD
  ================================================== */

  window.addEventListener(
    "popstate",
    () => {

      currentRoute =
        window.location.pathname;

    }
  );


  /* ==================================================
     INTERNAL NAVIGATION
  ================================================== */

  document.addEventListener(
    "click",
    (event) => {


      const link =
        event.target.closest(
          "[data-link]"
        );


      if (!link) {

        return;

      }


      event.preventDefault();


      const url =
        link.getAttribute(
          "href"
        );


      navigate(url);

    }
  );

}


/* ==================================================
   NAVIGATE
================================================== */

export function navigate(url) {


  window.history.pushState(
    {},
    "",
    url
  );


  currentRoute =
    url;

}


/* ==================================================
   GET ROUTE
================================================== */

export function getRoute() {

  return currentRoute;

}