/**
 * -------------------------------------------------------
 * Kolchi Business
 * Product Grid
 * -------------------------------------------------------
 */

import { ProductCard } from "./ProductCard.js";

export function ProductGrid(products = []) {

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