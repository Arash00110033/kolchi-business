/**
 * -------------------------------------------------------
 * Kolchi Business
 * Product Grid
 * -------------------------------------------------------
 */

import { ProductCard } from "./ProductCard.js";

export function ProductGrid(
  products = [],
  loading = false
) {

  if (loading) {

  return `

    <section class="product-grid">

      ${Array.from({ length: 6 })
        .map(() => `

          <article class="product-card skeleton">

            <div class="skeleton-image"></div>

            <div class="skeleton-line"></div>

            <div class="skeleton-line short"></div>

            <div class="skeleton-button"></div>

          </article>

        `)
        .join("")}

    </section>

  `;

}
  if (!Array.isArray(products) || products.length === 0) {

    return `
      <div class="empty-state">
        <h3>محصولی پیدا نشد</h3>
        <p>عبارت جستجو یا دسته‌بندی دیگری را امتحان کنید.</p>
      </div>
    `;

  }

  const count = products.length;

  return `
    <div class="product-grid-header">

      <span class="product-count">
        ${count} محصول یافت شد
      </span>

    </div>

    <section class="product-grid">

      ${products.map(ProductCard).join("")}

    </section>
  `;

}