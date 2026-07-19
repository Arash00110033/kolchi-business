/**
 * -------------------------------------------------------
 * Kolchi Business
 * Cart Item
 * -------------------------------------------------------
 */

export function CartItem(item) {

  const unitPrice = Number(item.price);

  const totalPrice = unitPrice * item.qty;

  return `
    <article
      class="cart-item"
      data-id="${item.id}"
    >

      <div class="cart-item__image">

        <span class="cart-item__icon">
          ${item.icon ?? "☕️"}
        </span>

      </div>

      <div class="cart-item__content">

        <div class="cart-item__top">

          <h4 class="cart-item__title">
            ${item.name}
          </h4>

          <button
            class="cart-item__remove"
            data-id="${item.id}"
            type="button"
            aria-label="حذف ${item.name} از سبد خرید"
          >
            ×
          </button>

        </div>

        <p class="cart-item__price">

          ${unitPrice.toLocaleString("fa-IR")}

          تومان

          <span>
            × ${item.qty.toLocaleString("fa-IR")}
          </span>

        </p>

        <div class="cart-item__bottom">

          <div class="cart-item__qty-controls">

            <button
              class="cart-item__qty-control decreaseQty"
              data-id="${item.id}"
              type="button"
              aria-label="کاهش تعداد ${item.name}"
            >
              −
            </button>

            <span
              class="cart-item__qty-value"
              aria-label="تعداد محصول"
            >
              ${item.qty.toLocaleString("fa-IR")}
            </span>

            <button
              class="cart-item__qty-control increaseQty"
              data-id="${item.id}"
              type="button"
              aria-label="افزایش تعداد ${item.name}"
            >
              +
            </button>

          </div>

          <strong class="cart-item__total">

            ${totalPrice.toLocaleString("fa-IR")}

            تومان

          </strong>

        </div>

      </div>

    </article>
  `;
}