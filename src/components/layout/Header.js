/**
 * -------------------------------------------------------
 * Kolchi Business
 * Global Header
 * Layer: Layout
 * -------------------------------------------------------
 * مسئولیت:
 * نمایش هدر اصلی سایت
 * - لوگو
 * - جستجو
 * - فیلتر دسته‌بندی
 * - فیلتر برند
 * - منوی ناوبری
 * - سبد خرید
 * -------------------------------------------------------
 */

export function Header(
  state,
  cartCount,
  wishlistCount,
  currentRoute
) {

  const isHome =
  currentRoute === "/";

  const isShop =
  currentRoute === "/shop";

  const isWishlist =
  currentRoute === "/wishlist";

  return `
    <header class="topbar">

      <div class="brand-block">

        <a
         href="/"
         data-link
        >

          <span class="brand-mark">☕️</span>

          <span class="brand-copy">
            <strong>
              Kolchi
            </strong>

            <p>
              Coffee Store
            </p>

          </span>

        </a>

      </div>
    <div class="topbar-center">
      <div class="searchbox">

        <input
          id="search"
          type="text"
          placeholder="جستجوی محصولات..."
          value="${state.query}"
          autocomplete="off"
        />

        <select id="category">

          <option value="all" ${state.category === "all" ? "selected" : ""}>
            همه محصولات
          </option>

          <option value="coffee" ${state.category === "coffee" ? "selected" : ""}>
            قهوه
          </option>

          <option value="brew" ${state.category === "brew" ? "selected" : ""}>
            ابزار دم‌آوری
          </option>

          <option value="mug" ${state.category === "mug" ? "selected" : ""}>
            ماگ
          </option>

        </select>

        <select id="brand">
        

          <option value="all" ${state.brand === "all" ? "selected" : ""}>
            همه برندها
          </option>

          <option value="Kolchi" ${state.brand === "Kolchi" ? "selected" : ""}>
            Kolchi
          </option>

          <option value="BrewLab" ${state.brand === "BrewLab" ? "selected" : ""}>
            BrewLab
          </option>

        </select>
        <select id="sort">

  <option value="default">مرتب‌سازی</option>

  <option value="price-asc">
    ارزان‌ترین
  </option>

  <option value="price-desc">
    گران‌ترین
  </option>

  <option value="name">
    نام محصول
  </option>

          </select>

        </div>

      </div>

      <div class="topbar-right">

      <nav class="top-menu">

        <a
         href="/"
         data-link
         class="${isHome ? "active" : ""}"
        >
         خانه
        </a>

        <a
         href="/shop"
         data-link
         class="${isShop ? "active" : ""}"
        >
         فروشگاه
        </a>

        <a
          href="/wishlist"
          data-link
          class="${isWishlist ? "active" : ""}"
        >
          ♡ علاقه‌مندی‌ها

          <span class="wishlist-count">
            ${wishlistCount}
          </span>

        </a>

      </nav>

      <button
        id="cartBtn"
        class="btn btn-primary"
      >

        🛒

        <span class="cart-count">
          ${cartCount}
        </span>

      </button>

    </div>

    </header>
  `;

}
