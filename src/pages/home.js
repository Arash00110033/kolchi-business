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
 * - ارسال محصولات به ProductCard
 * - رندر لیست محصولات
 * -------------------------------------------------------
 */

import { ProductService } from "../services/product.service.js";
import { ProductCard } from "../components/shop/ProductCard.js";
import { getState } from "../store/store.js";

export function HomePage() {

  const state = getState();

  console.log("Shop state:", state);

  const products = ProductService.getProducts({
    query: state.query,
    category: state.category,
    brand: state.brand,
    sort: state.sort,
  });

  const productList = products.length
    ? products.map(ProductCard).join("")
    : `
      <div class="empty-state">
        محصولی پیدا نشد.
      </div>
    `;

  return `
    <section class="hero">
      <h1>کل‌چی بیزینس</h1>
      <p>فروشگاه قهوه و ابزار حرفه‌ای</p>
    </section>

    <section class="section">

      <h2>محصولات</h2>

      <div class="product-grid">
        ${productList}
      </div>

    </section>
  `;

}