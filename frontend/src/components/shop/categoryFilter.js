/**
 * -------------------------------------------------------
 * Kolchi Business
 * Category Filter
 * Layer: Components / Shop
 * -------------------------------------------------------
 *
 * مسئولیت:
 * - نمایش فیلتر دسته‌بندی محصولات
 * - نمایش دسته‌بندی‌های موجود
 * - نمایش انتخاب فعلی کاربر
 *
 * منطق فیلتر در:
 *
 * src/app/filter.events.js
 *
 * انجام می‌شود.
 * -------------------------------------------------------
 */

import { categories } from "../../data/categories.js";

export function CategoryFilter(
  selectedCategory = "all"
) {

  return `
    <div class="shop-filter">

      <label
        class="shop-filter__label"
        for="category"
      >
        دسته‌بندی
      </label>

      <select
        id="category"
        class="shop-filter__select"
      >

        <option
          value="all"
          ${selectedCategory === "all" ? "selected" : ""}
        >
          همه دسته‌بندی‌ها
        </option>

        ${categories.map(category => `

          <option
            value="${category.id}"
            ${selectedCategory === category.id ? "selected" : ""}
          >
            ${category.icon} ${category.name}
          </option>

        `).join("")}

      </select>

    </div>
  `;

}