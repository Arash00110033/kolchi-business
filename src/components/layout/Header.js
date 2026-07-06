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

export function Header(state, cartCount) {

  return `
    <header class="topbar">

      <div class="brand">

        <a href="#/">

          <span class="brand-logo">☕️</span>

          <span class="brand-name">
            Kolchi
          </span>

        </a>

      </div>

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

      <nav class="top-menu">

        <a href="#/">خانه</a>

        <a href="#/shop">فروشگاه</a>

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

    </header>
  `;

}