import { getState, actions } from "../store/store.js";
import { ProductService } from "./product.service.js";
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

  increaseQuantity(productId) {
    const cartItem = getState().cart.find(
      item => item.id === productId
    );

    if (!cartItem) return;

    actions.updateCartItemQty(
      productId,
      cartItem.qty + 1
    );
  },

  decreaseQuantity(productId) {
    const cartItem = getState().cart.find(
      item => item.id === productId
    );

    if (!cartItem) return;

    if (cartItem.qty > 1) {
      actions.updateCartItemQty(
        productId,
        cartItem.qty - 1
      );
    }
  },
getTotalPrice() {
  return getState().cart.reduce((total, item) => {

    const product = ProductService.getById(item.id);

    if (!product) return total;

    return total + (product.price * item.qty);

  }, 0);
},

getTotalItems() {
  return getState().cart.reduce(
    (total, item) => total + item.qty,
    0 );
},
  removeItem(productId) {
    actions.removeFromCart(productId);
  },
  clear() {
    actions.clearCart();
  },

};