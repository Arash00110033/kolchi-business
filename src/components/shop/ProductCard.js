import { getState } from "../../store/store.js";

/**
* -------------------------------------------------------
* Kolchi Business
* Product Card
* Layer: Components / Shop
* -------------------------------------------------------
*
* مسئولیت:
* - نمایش اطلاعات محصول
* - نمایش وضعیت Wishlist
* - فراهم کردن تعامل با محصول
*
* منطق Wishlist در:
*
* src/store/store.js
*
* مدیریت می‌شود.
* -------------------------------------------------------
*/

export function ProductCard(product) {

  if (!product) {
    return "";
  }

  const state = getState();

  const isInWishlist =
    state.wishlist.includes(product.id);

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

        <button
          class="product-card__wishlist ${
            isInWishlist ? "is-active" : ""
          }"
          data-action="toggle-wishlist"
          data-id="${product.id}"
          type="button"
          aria-label="${
            isInWishlist
              ? "حذف از علاقه‌مندی‌ها"
              : "افزودن به علاقه‌مندی‌ها"
          }"
          aria-pressed="${isInWishlist}"
        >
          ${isInWishlist ? "♥" : "♡"}
        </button>

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