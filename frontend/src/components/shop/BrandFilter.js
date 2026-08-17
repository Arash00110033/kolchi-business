/**
 * -------------------------------------------------------
 * Kolchi Business
 * Brand Filter
 * Layer: Components / Shop
 * -------------------------------------------------------
 *
 * مسئولیت:
 * - نمایش فیلتر برند
 * - نمایش برندهای موجود
 * - نمایش برند انتخاب‌شده
 *
 * منطق فیلتر در:
 *
 * src/app/filter.events.js
 *
 * انجام می‌شود.
 * -------------------------------------------------------
 */

import { brands } from "../../data/brands.js";

export function BrandFilter(
  selectedBrand = "all"
) {

  return `
    <div class="shop-filter">

      <label
        class="shop-filter__label"
        for="brand"
      >
        برند
      </label>

      <select
        id="brand"
        class="shop-filter__select"
      >

        <option
          value="all"
          ${selectedBrand === "all" ? "selected" : ""}
        >
          همه برندها
        </option>

        ${brands.map(brand => `

          <option
            value="${brand.id}"
            ${selectedBrand === brand.id ? "selected" : ""}
          >
            ${brand.name}
          </option>

        `).join("")}

      </select>

    </div>
  `;
}