import {
  getState,
  actions
} from "../store/store.js";

import { ProductService } from "../services/product.service.js";


/* ==================================================
   KEYBOARD EVENTS
================================================== */

export function bindKeyboardEvents() {


  /* ==================================================
     ESCAPE
  ================================================== */

  document.addEventListener("keydown", (event) => {


    if (event.key === "Escape") {

      const state = getState();


      if (state.isProductModalOpen) {

        actions.closeProductModal();

        return;

      }


      if (state.isCartOpen) {

        actions.closeCart();

      }

    }

  });


  /* ==================================================
     PRODUCT CARD KEYBOARD SUPPORT
  ================================================== */

  document.addEventListener("keydown", (event) => {


    if (
      event.key !== "Enter" &&
      event.key !== " "
    ) {

      return;

    }


    const productCard =
      event.target.closest(
        '[data-action="open-product-modal"]'
      );


    if (!productCard) {

      return;

    }


    event.preventDefault();


    const productId =
      productCard.dataset.productId;


    const product =
      ProductService.getById(productId);


    if (product) {

      actions.openProductModal(product);

    }

  });

}