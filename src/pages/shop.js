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
console.log("Shop state:", state);
  const products = ProductService.getProducts({
    query: state.query,
    category: state.category,
    brand: state.brand
  });

  return `
    <section class="shop-page">

      ${ProductGrid(products)}

    </section>
  `;

}