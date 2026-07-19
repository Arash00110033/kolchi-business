import { getRoute } from "../router/router.js";

import { getState } from "../store/store.js";

import { Header } from "../components/layout/Header.js";

import { HomePage } from "../pages/home.js";
import { ShopPage } from "../pages/shop.js";

import { CartDrawer } from "../components/cart/CartDrawer.js";
import { ProductModal } from "../components/shop/ProductModal.js";


/* ==================================================
   RENDER APPLICATION
================================================== */

export function renderApp(app) {

  const route = getRoute();

  const state = getState();


  /* ==================================================
     CART COUNT
  ================================================== */

  const cartCount = state.cart.reduce(
    (total, item) => total + item.qty,
    0
  );


  /* ==================================================
     PAGE
  ================================================== */

  let page = "";


  switch (route) {

    case "/":

      page = HomePage();

      break;


    case "/shop":

      page = ShopPage();

      break;


    case "/cart":

      page = `

        <section class="section">

          <h2>سبد خرید</h2>

          <p>
            این صفحه در Sprint بعدی تکمیل خواهد شد.
          </p>

        </section>

      `;

      break;


    default:

      page = `

        <section class="section">

          <h2>404</h2>

          <p>
            صفحه مورد نظر پیدا نشد.
          </p>

        </section>

      `;

  }


  /* ==================================================
     APPLICATION HTML
  ================================================== */

  app.innerHTML = `

    ${Header(state, cartCount)}

    ${CartDrawer(state)}

    ${ProductModal(
      state.selectedProduct,
      state.isProductModalOpen
    )}

    <main class="page">

      ${page}

    </main>

  `;


  /* ==================================================
     RESTORE SEARCH CURSOR
  ================================================== */

  const searchInput =
    document.getElementById("search");


  if (searchInput) {

    searchInput.focus();

    searchInput.setSelectionRange(
      searchInput.value.length,
      searchInput.value.length
    );

  }

}