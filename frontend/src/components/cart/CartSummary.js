/**
 * -------------------------------------------------------
 * Kolchi Business
 * Cart Summary
 * Layer: Components
 * -------------------------------------------------------
 *
 * مسئولیت:
 * - نمایش خلاصه سفارش
 * - نمایش تعداد کالا
 * - نمایش مبلغ نهایی
 * - آماده سازی Checkout
 */

export function CartSummary({
  totalItems,
  totalPrice
}) {

  const shipping = 0;

  const discount = 0;

  const finalPrice =
    totalPrice + shipping - discount;


  return `

    <aside class="cart-summary">

      <h2>
        خلاصه سفارش
      </h2>


      <div class="cart-summary__row">

        <span>
          تعداد کالا
        </span>

        <strong>
          ${totalItems.toLocaleString("fa-IR")}
        </strong>

      </div>


      <div class="cart-summary__row">

        <span>
          جمع کالا
        </span>

        <strong>
          ${totalPrice.toLocaleString("fa-IR")}
          تومان
        </strong>

      </div>


      <div class="cart-summary__row">

        <span>
          هزینه ارسال
        </span>

        <strong>
          رایگان
        </strong>

      </div>


      <div class="cart-summary__row">

        <span>
          تخفیف
        </span>

        <strong>
          ${discount.toLocaleString("fa-IR")}
          تومان
        </strong>

      </div>


      <hr>


      <div class="cart-summary__total">

        <span>
          مبلغ نهایی
        </span>

        <strong>
          ${finalPrice.toLocaleString("fa-IR")}
          تومان
        </strong>

      </div>


      <button
        id="checkoutButton"
        class="btn btn-primary btn-block"
        type="button"
      >
        ادامه پرداخت
      </button>


    </aside>

  `;
}