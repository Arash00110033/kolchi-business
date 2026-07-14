/**
 * -------------------------------------------------------
 * Kolchi Business
 * Shop Page
 * -------------------------------------------------------
 */

import { ProductGrid } from "../components/shop/ProductGrid.js";
import { ProductService } from "../services/product.service.js";
import { getState } from "../store/store.js";

export function ShopPage() {

  const state = getState();
  // console.log("Shop state:", state); // Removed this line
  const products = ProductService.getProducts({
    query: state.query,
    category: state.category,
    brand: state.brand,
    sort: state.sort
  });
   const resultCount = products.length;

  return `
    <section class="shop-page">

      <div class="search-container">
        <input type="text" id="search" placeholder="Search..." value="${state.query}" />
        <button id="clearSearch" ${state.query ? "" : "style='display:none'"}>
          Clear
        </button>
      </div>
      <div class="shop-result-count">
        ${resultCount} محصول پیدا شد
      </div>
      ${ProductGrid(products)}

    </section>
  `;

}
