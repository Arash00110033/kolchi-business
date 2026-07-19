/* ==========================================
   PRODUCT MODAL
========================================== */

export function ProductModal(product, isOpen = false) {

  if (!product) return "";

  const imageSource = product.image || "";

  return `
    <div
      class="modal ${isOpen ? "is-open" : ""}"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >

      <div class="product-modal">

        <button
          id="closeProductModal"
          class="modal-close"
          type="button"
          aria-label="بستن"
        >
          ✕
        </button>

        <div class="product-modal__image">

          ${
            imageSource
              ? `
                <img
                  src="${imageSource}"
                  alt="${product.name}"
                  loading="lazy"
                >
              `
              : `
                <span
                  class="product-modal__icon"
                  aria-hidden="true"
                >
                  ${product.icon ?? "☕️"}
                </span>
            `  
          }

        </div>

        <div class="product-modal__content">

          <span class="product-modal__brand">
            ${product.brand}
          </span>

          <h2 id="product-modal-title">
            ${product.name}
          </h2>

          <p class="product-modal__description">
            ${product.description}
          </p>

          <strong class="product-modal__price">
            ${Number(product.price).toLocaleString("fa-IR")}
            تومان
          </strong>

          <button
            class="btn btn-primary add"
            data-id="${product.id}"
            data-action="add-to-cart"
            type="button"
          >
            افزودن به سبد خرید
          </button>

        </div>

      </div>

    </div>
  `;
}