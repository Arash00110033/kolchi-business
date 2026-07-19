import { ProductService } from "../../services/product.service.js";
import { CartItem } from "./CartItem.js";
import { CartFooter } from "./CartFooter.js";
import { CartEmpty } from "./CartEmpty.js";
import { CartService } from "../../services/cart.service.js";

/* ==========================================
   CART DRAWER
========================================== */

export function CartDrawer(state) {

  const totalPrice = CartService.getTotalPrice();

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
    <div
      class="cart-overlay ${state.isCartOpen ? "open" : ""}"
      aria-hidden="${state.isCartOpen ? "false" : "true"}"
    >

      <aside
        class="cart-drawer"
        aria-label="سبد خرید"
      >

        <header class="cart-drawer__header">

          <div class="cart-drawer__title">

            <h2>
              سبد خرید
            </h2>

            <span class="cart-drawer__count">
              ${CartService.getTotalItems()} کالا
            </span>

          </div>

          <button
            id="closeCart"
            class="cart-close"
            type="button"
            aria-label="بستن سبد خرید"
          >
            ×
          </button>

        </header>

        <div class="cart-drawer__body">

          ${
            items.length === 0
              ? CartEmpty()
              : items
                  .map(item => CartItem(item))
                  .join("")
          }

        </div>

        ${
          items.length > 0
            ? CartFooter(totalPrice)
            : ""
        }

      </aside>

    </div>
  `;
}