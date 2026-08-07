/**
 * -------------------------------------------------------
 * Kolchi Business
 * Sort Select
 * Layer: Components / Shop
 * -------------------------------------------------------
 *
 * مسئولیت:
 * - نمایش گزینه‌های مرتب‌سازی محصولات
 * - نمایش گزینه انتخاب‌شده فعلی
 *
 * منطق مرتب‌سازی در:
 *
 * src/app/filter.events.js
 *
 * انجام می‌شود.
 * -------------------------------------------------------
 */

export function SortSelect(
  selectedSort = "default"
) {

  return `
    <div class="shop-filter">

      <label
        class="shop-filter__label"
        for="sort"
      >
        مرتب‌سازی
      </label>

      <select
        id="sort"
        class="shop-filter__select"
      >

        <option
          value="default"
          ${selectedSort === "default" ? "selected" : ""}
        >
          پیش‌فرض
        </option>

        <option
          value="price-asc"
          ${selectedSort === "price-asc" ? "selected" : ""}
        >
          ارزان‌ترین
        </option>

        <option
          value="price-desc"
          ${selectedSort === "price-desc" ? "selected" : ""}
        >
          گران‌ترین
        </option>

        <option
          value="name"
          ${selectedSort === "name" ? "selected" : ""}
        >
          نام محصول
        </option>

      </select>

    </div>
  `;
}