import { ProductService } from "../../services/product.service.js";
import { actions } from "../../store/store.js";

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

                    <img src="${item.icon}" alt="${item.name}" class="cart-item__icon" />

                    <h4 class="cart-item__title">
                      ${item.name}
                    </h4>

                    <div class="cart-item__qty-controls">
                      <button
                        id="decreaseQty-${item.id}"
                        class="cart-item__qty-control decreaseQty"
                        type="button"
                      >
                        -
                      </button>
                      <span class="cart-item__qty-value">${item.qty}</span>
                      <button
                        id="increaseQty-${item.id}"
                        class="cart-item__qty-control increaseQty"
                        type="button"
                      >
                        +
                      </button>
                    </div>

                    <p class="cart-item__price">
                      ${Number(item.price).toLocaleString("fa-IR")}
                      تومان
                    </p>

                    <button
                      id="removeItem-${item.id}"
                      class="cart-item__remove"
                      type="button"
                    >
                      حذف
                    </button>

                  </article>
                `).join("")
          }

        </div>

      </aside>

    </div>
  `;
}
