/**
 * -------------------------------------------------------
 * Kolchi Business
 * Cart Page
 * Layer: Pages
 * -------------------------------------------------------
 *
 * مسئولیت:
 * - نمایش صفحه کامل سبد خرید
 * - دریافت State از Store
 * - دریافت اطلاعات محصولات از ProductService
 * - استفاده مجدد از CartItem
 * - نمایش Empty State
 * - نمایش خلاصه سبد خرید
 */

import { getState } from "../store/store.js";
import { ProductService } from "../services/product.service.js";
import { CartService } from "../services/cart.service.js";

import { CartItem } from "../components/cart/CartItem.js";
import { CartEmpty } from "../components/cart/CartEmpty.js";
import { CartSummary } from "../components/cart/CartSummary.js";
export function CartPage() {

  const state = getState();

  const items = state.cart
    .map(item => {

      const product =
        ProductService.getById(item.id);

      if (!product) {
        return null;
      }

      return {
        ...product,
        qty: item.qty
      };

    })
    .filter(Boolean);

  const totalItems =
    CartService.getTotalItems();

  const totalPrice =
    CartService.getTotalPrice();

  if (items.length === 0) {

    return `
      <section class="section cart-page">

        <h1>
          سبد خرید
        </h1>

        ${CartEmpty()}

      </section>
    `;

  }

  return `
    <section class="section cart-page">

      <div class="cart-page__header">

        <div>

          <h1>
            سبد خرید
          </h1>

          <p>
            ${totalItems.toLocaleString("fa-IR")}
            کالا در سبد خرید شما
          </p>

        </div>

      </div>

      <div class="cart-page__layout">

        <div class="cart-page__items">

          ${items
            .map(item => CartItem(item))
            .join("")
          }

        </div>
   <div class="cart-page__summary">
    ${
      CartSummary({
        totalItems,
        totalPrice
      })
    }
  
    <button
    id="clearCart"
    class="btn btn-ghost btn-block"
    type="button"
  >
    🗑 پاک کردن سبد خرید
  </button>
    </div>
      </div>

    </section>
  `;

}