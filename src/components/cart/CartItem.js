export function CartItem(item) {

  return `
    <article class="cart-item">

      <img
        src="${item.icon}"
        alt="${item.name}"
        class="cart-item__icon"
      />

      <div class="cart-item__content">

        <h4 class="cart-item__title">
          ${item.name}
        </h4>

        <p class="cart-item__price">
          ${Number(item.price).toLocaleString("fa-IR")}
          تومان
        </p>

        <div class="cart-item__qty-controls">

          <button
            class="cart-item__qty-control decreaseQty"
            data-id="${item.id}"
            type="button"
          >
            −
          </button>

          <span class="cart-item__qty-value">
            ${item.qty}
          </span>

          <button
            class="cart-item__qty-control increaseQty"
            data-id="${item.id}"
            type="button"
          >
            +
          </button>

        </div>

        <div class="cart-item__footer">

          <button
            class="cart-item__remove"
            data-id="${item.id}"
            type="button"
          >
            🗑 حذف
          </button>

        </div>

      </div>

    </article>
  `;
}