import { ProductService } from "../../services/product.service.js";
import { CartItem } from "./CartItem.js";
import { CartFooter } from "./CartFooter.js";
import { CartEmpty } from "./CartEmpty.js";
export function CartDrawer(state) {

  const totalPrice = state.cart.reduce((total, cartItem) => {

    const product = ProductService.getById(cartItem.id);

    if (!product) return total;

    return total + (product.price * cartItem.qty);

  }, 0);

  const items = state.cart
    .map(item => {

      const product = ProductService.getById(item.id);

      if (!product) return null;

      return {
        ...product,
        qty: item.qty
      };

    })
    .filter(Boolean);

  return `
    <div class="cart-overlay ${state.isCartOpen ? "open" : ""}">

      <aside class="cart-drawer">

        <header class="cart-drawer__header">

          <h2>سبد خرید</h2>

          <button
            id="closeCart"
            class="cart-close"
            type="button"
          >
            ✕
          </button>

        </header>

        <div class="cart-drawer__body">

          ${
            items.length === 0
              ? CartEmpty()
              : items.map(item =>
                CartItem(item)).join("")
          }

        </div>

        ${
          items.length > 0
            ? `
              ${items.length > 0 ?
              CartFooter(totalPrice) : ""}
              }
            `
            : ""
        }

      </aside>

    </div>
  `;
}