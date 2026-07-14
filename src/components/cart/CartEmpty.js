export function CartEmpty() {
  return `
    <div class="cart-empty">

      <div class="cart-empty__icon">
        🛒
      </div>

      <h3 class="cart-empty__title">
        سبد خرید شما خالی است
      </h3>

      <p class="cart-empty__text">
        هنوز محصولی به سبد خرید اضافه نکرده‌اید.
      </p>

      <button
        class="btn btn-primary btn-block"
        id="continueShopping"
        type="button"
      >
        مشاهده محصولات
      </button>

    </div>
  `;
}