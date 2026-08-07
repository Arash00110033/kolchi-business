import { getRoute } from "../router/router.js";

import { getState } from "../store/store.js";

import { Header } from "../components/layout/Header.js";

import { HomePage } from "../pages/home.js";
import { ShopPage } from "../pages/shop.js";
import { CartPage } from "../pages/cart.js";
import { WishlistPage } from "../pages/wishlist.js";
import { CheckoutPage } from "../pages/checkout.js";

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
  const wishlistCount = state.wishlist.length;

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

      page = CartPage();

      break;

    case "/wishlist":

      page = WishlistPage();

      break;

    case "/checkout":

      page = CheckoutPage();

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

    ${Header(
      state,
      cartCount,
      wishlistCount,
      route
    )}

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