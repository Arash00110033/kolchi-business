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
        محصولی پیدا نشد.
      </div>
    `;

  }

  return `
    <section class="product-grid">

      ${products.map(ProductCard).join("")}

    </section>
  `;

}