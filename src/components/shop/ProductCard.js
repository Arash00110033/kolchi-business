/**
 * -------------------------------------------------------
 * Kolchi Business
 * Product Card
 * -------------------------------------------------------
 */

export function ProductCard(product) {

  return `
    <article class="product-card">

      <div class="product-card__image">
        <span class="product-card__icon">
          ${product.icon ?? "☕️"}
        </span>
      </div>

      <div class="product-card__content">

        <span class="product-card__brand">
          ${product.brand}
        </span>

        <h3 class="product-card__title">
          ${product.name}
        </h3>

        <p class="product-card__description">
          ${product.description}
        </p>

        <p class="product-card__price">
          ${Number(product.price).toLocaleString("fa-IR")}
          تومان
        </p>

        <button
          class="add"
          data-id="${product.id}"
          type="button"
        >
          افزودن به سبد خرید
        </button>

      </div>

    </article>
  `;

}