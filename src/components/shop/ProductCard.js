/**
 * -------------------------------------------------------
 * Kolchi Business
 * Product Card
 * -------------------------------------------------------
 * Layer: Components
 *
 * Responsibilities:
 * - نمایش اطلاعات محصول
 * - باز کردن Modal با کلیک روی کارت
 * - افزودن مستقیم محصول به سبد خرید با دکمه مستقل
 * -------------------------------------------------------
 */

export function ProductCard(product) {

  if (!product) return "";

  return `
    <article
      class="product-card"
      data-product-id="${product.id}"
      data-action="open-product-modal"
      tabindex="0"
      aria-label="مشاهده جزئیات ${product.name}"
    >

      <div class="product-card__image">

        <span class="product-card__icon">
          ${product.icon ?? "☕️"}
        </span>

      </div>

      <div class="product-card__content">

        <span class="product-card__brand">
          ${product.brand ?? ""}
        </span>

        <h3 class="product-card__title">
          ${product.name}
        </h3>

        <p class="product-card__description">
          ${product.description ?? ""}
        </p>

        <p class="product-card__price">
          ${Number(product.price).toLocaleString("fa-IR")}
          تومان
        </p>

        <button
          class="btn btn-primary add"
          data-id="${product.id}"
          data-action="add-to-cart"
          type="button"
        >
          افزودن به سبد خرید
        </button>

      </div>

    </article>
  `;
}