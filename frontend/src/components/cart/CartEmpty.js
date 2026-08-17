/**
 * -------------------------------------------------------
 * Kolchi Business
 * Cart Empty State
 * -------------------------------------------------------
 */

export function CartEmpty() {

  return `

    <div class="empty-state cart-empty">

      <div class="empty-state__icon">
        🛒
      </div>


      <h3>
        سبد خرید شما خالی است
      </h3>


      <p>
        هنوز محصولی به سبد خرید اضافه نکرده‌اید.
      </p>


      <a
        href="/shop"
        data-link
        class="btn btn-primary"
      >
        مشاهده محصولات
      </a>

    </div>

  `;

}