import {
  getState,
  actions
} from "../store/store.js";

import { CartService } from "../services/cart.service.js";

import { ProductService } from "../services/product.service.js";


/* ==================================================
   CLICK EVENTS
================================================== */

export function bindClickEvents() {


  document.addEventListener(
    "click",
    (event) => {


      /* ==================================================
         OPEN CART
      ================================================== */

      const cartButton =
        event.target.closest("#cartBtn");


      if (cartButton) {

        actions.toggleCart();

        return;

      }


      /* ==================================================
         CONTINUE SHOPPING
      ================================================== */

      const continueShoppingButton =
        event.target.closest(
          "#continueShopping"
        );


      if (continueShoppingButton) {

        actions.closeCart();

        return;

      }


      /* ==================================================
         ADD TO CART
      ================================================== */

      const addToCartButton =
        event.target.closest(
          '[data-action="add-to-cart"]'
        );


      if (addToCartButton) {


        event.stopPropagation();


        const productId =
          addToCartButton.dataset.id;


        actions.addToCart(productId);


        /* =========================
           VISUAL FEEDBACK
        ========================= */

        const originalText =
          addToCartButton.textContent;


        addToCartButton.classList.add(
          "is-added"
        );


        addToCartButton.textContent =
          "✓ اضافه شد";


        addToCartButton.disabled =
          true;


        setTimeout(() => {


          addToCartButton.classList.remove(
            "is-added"
          );


          addToCartButton.textContent =
            originalText;


          addToCartButton.disabled =
            false;


        }, 1200);


        return;

      }


      /* ==================================================
         OPEN PRODUCT MODAL
      ================================================== */

      const productCard =
        event.target.closest(
          '[data-action="open-product-modal"]'
        );


      if (productCard) {


        const productId =
          productCard.dataset.productId;


        const product =
          ProductService.getById(productId);


        if (product) {

          actions.openProductModal(product);

        }


        return;

      }


      /* ==================================================
         CLOSE PRODUCT MODAL
      ================================================== */

      const closeProductModalButton =
        event.target.closest(
          "#closeProductModal"
        );


      if (closeProductModalButton) {

        actions.closeProductModal();

        return;

      }


      /* ==================================================
         CLOSE PRODUCT MODAL
         BY OVERLAY
      ================================================== */

      const modalOverlay =
        event.target.closest(".modal");


      if (
        modalOverlay &&
        event.target === modalOverlay
      ) {

        actions.closeProductModal();

        return;

      }


      /* ==================================================
         CLOSE CART
      ================================================== */

      const closeCartButton =
        event.target.closest(
          "#closeCart"
        );


      if (closeCartButton) {

        actions.closeCart();

        return;

      }


      /* ==================================================
         CLOSE CART
         BY OVERLAY
      ================================================== */

      const cartOverlay =
        event.target.closest(
          ".cart-overlay"
        );


      if (
        cartOverlay &&
        event.target === cartOverlay
      ) {

        actions.closeCart();

        return;

      }


      /* ==================================================
         INCREASE QUANTITY
      ================================================== */

      const increaseQuantityButton =
        event.target.closest(
          ".increaseQty"
        );


      if (increaseQuantityButton) {


        CartService.increaseQuantity(
          increaseQuantityButton.dataset.id
        );


        return;

      }


      /* ==================================================
         DECREASE QUANTITY
      ================================================== */

      const decreaseQuantityButton =
        event.target.closest(
          ".decreaseQty"
        );


      if (decreaseQuantityButton) {


        CartService.decreaseQuantity(
          decreaseQuantityButton.dataset.id
        );


        return;

      }


      /* ==================================================
         REMOVE ITEM
      ================================================== */

      const removeItemButton =
        event.target.closest(
          ".cart-item__remove"
        );


      if (removeItemButton) {


        CartService.removeItem(
          removeItemButton.dataset.id
        );


        return;

      }


      /* ==================================================
         CLEAR CART
      ================================================== */

      const clearCartButton =
        event.target.closest(
          "#clearCart"
        );


      if (clearCartButton) {


        CartService.clear();


        return;

      }


      /* ==================================================
         CLEAR SEARCH
      ================================================== */

      const clearSearchButton =
        event.target.closest(
          "#clearSearch"
        );


      if (clearSearchButton) {


        const searchInput =
          document.getElementById(
            "search"
          );


        if (searchInput) {

          searchInput.value =
            "";

        }


        actions.setQuery(
          ""
        );


        return;

      }

    }
  );

}


