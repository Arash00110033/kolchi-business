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

  return `
    <section class="product-grid">

      ${products.map(ProductCard).join("")}

    </section>
  `;

}