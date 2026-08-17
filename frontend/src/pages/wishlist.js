/* ==================================================
   KOLCHI BUSINESS
   WISHLIST PAGE
================================================== */

import { getState } from "../store/store.js";

import { ProductService } from "../services/product.service.js";

import { ProductGrid } from "../components/shop/ProductGrid.js";


/* ==================================================
   WISHLIST PAGE
================================================== */

export function WishlistPage() {

  const state =
    getState();


  const wishlistIds =
    state.wishlist;


  const wishlistProducts =
    wishlistIds

      .map(id =>
        ProductService.getById(id)
      )

      .filter(Boolean);


  /* ==================================================
     EMPTY STATE
  ================================================== */

  if (wishlistProducts.length === 0) {

    return `

      <section class="section wishlist-page">

        <div class="wishlist-page__header">

          <h1>
            علاقه‌مندی‌های من
          </h1>

          <p>
            محصولاتی که دوست دارید اینجا نمایش داده می‌شوند.
          </p>

        </div>


        <div class="empty-state wishlist-empty">

          <div class="wishlist-empty__icon">
            ♡
          </div>

          <h2>
            لیست علاقه‌مندی‌ها خالی است
          </h2>

          <p>
            هنوز محصولی به علاقه‌مندی‌های خود اضافه نکرده‌اید.
          </p>

          <a
            href="/shop"
            data-link
            class="btn btn-primary"
          >
            مشاهده محصولات
          </a>

        </div>

      </section>

    `;

  }


  /* ==================================================
     WISHLIST CONTENT
  ================================================== */

  return `

    <section class="section wishlist-page">

      <header class="wishlist-page__header">

        <h1>
          علاقه‌مندی‌های من
        </h1>

        <p>
          ${wishlistProducts.length}
          محصول در لیست علاقه‌مندی‌های شما
        </p>

      </header>


      ${ProductGrid(wishlistProducts)}

    </section>

  `;

}