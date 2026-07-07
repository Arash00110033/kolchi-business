import { getState, actions } from "../store/store.js";

/* =========================
   CART SERVICE
========================= */

export const CartService = {

  getItems() {
    return getState().cart;
  },

  getCount() {
    return getState().cart.reduce(
      (total, item) => total + item.qty,
      0
    );
  },

  add(productId) {
    actions.addToCart(productId);
  },

  decreaseQuantity(productId) {
    const cartItem = getState().cart.find(item => item.id === productId);

    if (cartItem && cartItem.qty > 1) {
      actions.updateCartItemQty(productId, cartItem.qty - 1);
    }
  },

  removeItem(productId) {
    actions.removeFromCart(productId);
  }

};
