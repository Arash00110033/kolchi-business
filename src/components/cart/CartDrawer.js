/**
 * -------------------------------------------------------
 * Kolchi Business
 * Cart Drawer
 * Layer: Component
 * -------------------------------------------------------
 */

import { ProductService } from "../../services/product.service.js";

export function CartDrawer(state) {

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
              ? `
                <p class="cart-empty">
                  سبد خرید خالی است.
                </p>
              `
              : items.map(item => `
                  <article class="cart-item">

                    <h4 class="cart-item__title">
                      ${item.name}
                    </h4>

                    <p class="cart-item__qty">
                      تعداد: ${item.qty}
                    </p>

                    <p class="cart-item__price">
                      ${Number(item.price).toLocaleString("fa-IR")}
                      تومان
                    </p>

                  </article>
                `).join("")
          }

        </div>

      </aside>

    </div>
  `;

}