/**
 * -------------------------------------------------------
 * Kolchi Business
 * Search Bar
 * Layer: Components / Shop
 * -------------------------------------------------------
 *
 * مسئولیت:
 * - نمایش ورودی جستجو
 * - نمایش مقدار فعلی جستجو
 *
 * منطق جستجو در این فایل قرار ندارد.
 * مدیریت جستجو در:
 *
 * src/app/search.events.js
 *
 * انجام می‌شود.
 * -------------------------------------------------------
 */

export function SearchBar(query = "") {

  return `
    <div class="shop-search">

      <label
        class="shop-search__label"
        for="search"
      >
        جستجوی محصولات
      </label>

      <input
        id="search"
        class="shop-search__input"
        type="search"
        placeholder="نام محصول، برند یا دسته‌بندی..."
        value="${query}"
        autocomplete="off"
      >

    </div>
  `;

}