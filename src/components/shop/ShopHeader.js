/**
 * -------------------------------------------------------
 * Kolchi Business
 * Shop Page
 * -------------------------------------------------------
 */

import { ProductService } from "../services/product.service.js";
import { ProductCard } from "../components/ProductCard.js";
import { ShopHeader } from "../components/shop/ShopHeader.js";
import { getState } from "../store/store.js";

export function ShopPage() {

  const state = getState();

  const products = ProductService.getProducts({
    query: state.query,
    category: state.category,
    brand: state.brand
  });

  return 
    <section class="section">

      ${ShopHeader(products.length)}

      <div class="product-grid">

        ${
          products.length
            ? products.map(ProductCard).join("")
            : 
              <div class="empty-state">
                محصولی پیدا نشد.
              </div>
            
        }

      </div>

    </section>
  ;

}