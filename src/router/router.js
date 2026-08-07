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

      window.dispatchEvent(
        new Event("routechange")
      )

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

  window.dispatchEvent(
    new PopStateEvent("popstate")
  );
}


/* ==================================================
   GET ROUTE
================================================== */

export function getRoute() {

  return currentRoute;

}