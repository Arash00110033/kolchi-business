import { getRoute } from "./router/router.js";
import {
  getState,
  subscribe,
  actions
} from "./store/store.js";

import { Header } from "./components/layout/Header.js";

import { HomePage } from "./pages/home.js";
import { ShopPage } from "./pages/shop.js";
import { CartDrawer } from "./components/cart/CartDrawer.js";
import { CartService } from "./services/cart.service.js"; // Import CartService

/* =========================
   ROOT
========================= */

const app = document.getElementById("app");

if (!app) {
  throw new Error("APP ROOT NOT FOUND");
}

/* =========================
   INIT
========================= */

export function initApp() {
  bindEvents();

  subscribe(render);

  render();
}

/* =========================
   RENDER
========================= */

function render() {

  const route = getRoute();
  const state = getState();

  const cartCount = state.cart.reduce(
    (total, item) => total + item.qty,
    0
  );

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

  app.innerHTML = `
    ${Header(state, cartCount)}
    ${CartDrawer(state)}
    <main class="page">
      ${page}
    </main>
  `;

  const searchInput = document.getElementById("search");

  if (searchInput) {
    searchInput.focus();
    searchInput.setSelectionRange(
      searchInput.value.length,
      searchInput.value.length
    );
  }
}

/* =========================
   EVENTS
========================= */

function bindEvents() {
  
  let searchDebounceTimer = null;
  
  document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {
      actions.closeCart();
    }

  });
  document.addEventListener("input", (e) => {

    if (e.target.id === "search") {

     console.log("Search:", e.target.value);

  clearTimeout(searchDebounceTimer);

      const value = e.target.value;

      searchDebounceTimer = setTimeout(() => {

    actions.setQuery(value);

   }, 300);

   }
  });

  document.addEventListener("change", (e) => {

    if (e.target.id === "category") {
      console.log("Category:", e.target.value);
      actions.setCategory(e.target.value);
    }
    if (e.target.id === "brand") {
      console.log("Brand:", e.target.value);
      actions.setBrand(e.target.value);
    }
    if (e.target.id === "sort") {
      console.log("Sort:", e.target.value);
      actions.setSort(e.target.value);
    }

  });

 document.addEventListener("click", (e) => {

  // Open cart
  if (e.target.id === "cartBtn") {
    actions.toggleCart();
    return;
  }

  // Close cart
  const closeBtn = e.target.closest("#closeCart");
  if (closeBtn) {
    actions.closeCart();
    return;
  }
  const overlay = e.target.closest(".cart-overlay");

  if (overlay && e.target === overlay) {
    actions.closeCart();
    return;
}

  // Add to cart
  const addBtn = e.target.closest(".add");
  if (addBtn) {
    actions.addToCart(addBtn.dataset.id);
    return;
  }

  // Increase quantity
  const increaseQtyBtn = e.target.closest(".increaseQty");
  if (increaseQtyBtn) {
    CartService.increaseQuantity(increaseQtyBtn.dataset.id);
    return;
  }

  // Decrease quantity
  const decreaseQtyBtn = e.target.closest(".decreaseQty");
  if (decreaseQtyBtn) {
    CartService.decreaseQuantity(decreaseQtyBtn.dataset.id);
    return;
  }

  // Remove item
  const removeItemBtn = e.target.closest(".cart-item__remove");
  if (removeItemBtn) {
    CartService.removeItem(removeItemBtn.dataset.id);
    return;
  }

  // Clear search
  const clearSearchBtn = e.target.closest("#clearSearch");
  if (clearSearchBtn) {
    const input = document.getElementById("search");

    if (input) {
      input.value = "";
    }

    actions.setQuery("");
    return;
  }

});
}

/* =========================
   EXPORT
========================= */

export function renderApp() {
  render();
}
