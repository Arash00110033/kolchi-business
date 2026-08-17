/**
 * -------------------------------------------------------
 * Kolchi Business
 * Home Page
 * Layer: Pages
 * -------------------------------------------------------
 * مسئولیت:
 * - نمایش صفحه اصلی فروشگاه
 * - دریافت State از Store
 * - دریافت محصولات از ProductService
 * - ارسال محصولات به ProductGrid
 * -------------------------------------------------------
 */

import { ProductService } from "../services/product.service.js";
import { ProductGrid } from "../components/shop/ProductGrid.js";
import { getState } from "../store/store.js";

export function HomePage() {

  const state = getState();

  const products = ProductService.getProducts({
    query: state.query,
    category: state.category,
    brand: state.brand,
    sort: state.sort,
  });

  return `
    <section class="hero">

      <h1>کل‌چی بیزینس</h1>

      <p>
        فروشگاه قهوه و ابزار حرفه‌ای
      </p>

    </section>

    <section class="section">

      <h2>محصولات</h2>

      ${ProductGrid(products)}

    </section>
  `;

}