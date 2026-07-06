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

  remove(productId) {
    actions.removeFromCart(productId);
  },

  clear() {
    actions.clearCart();
  },

  has(productId) {
    return getState().cart.some(
      item => item.id === productId
    );
  }

};