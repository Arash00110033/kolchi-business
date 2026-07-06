/**
 * -------------------------------------------------------
 * Kolchi Business
 * Product Service
 * Layer: Services
 * -------------------------------------------------------
 * مسئولیت:
 * مدیریت تمام عملیات مربوط به محصولات
 * -------------------------------------------------------
 */

import { mockProducts } from "../data/mock.products.js";

const products = [...mockProducts];

export const ProductService = {

  /**
   * دریافت همه محصولات
   */
  getAll() {
  return products;
},

/**
 * دریافت محصولات با فیلترهای اولیه
 */
getProducts({
  query = "",
  category = "all",
  brand = "all",
  sort = "default"
} = {}) {

  let result = [...products];

  if (query.trim()) {

  const q = query.trim().toLowerCase();

  result = result.filter(product => {

    return (
  (product.name ?? "").toLowerCase().includes(q) ||
  (product.description ?? "").toLowerCase().includes(q) ||
  (product.brand ?? "").toLowerCase().includes(q) ||
  (product.category ?? "").toLowerCase().includes(q) ||
  (product.sku ?? "").toLowerCase().includes(q)
);

  });

}

  if (category !== "all") {

    result = result.filter(
      product => product.category === category
    );

  }

  if (brand !== "all") {

    result = result.filter(
      product =>
        product.brand.toLowerCase() === brand.toLowerCase()
    );

  }

  return this.sort(result, sort);

},

  /**
   * دریافت محصول با شناسه
   */
  getById(id) {
    return products.find(product => product.id === id);
  },

  /**
   * جستجو
   */
  search(query = "") {

    const q = query.trim().toLowerCase();

    if (!q) return products;

    return products.filter(product =>

      product.name.toLowerCase().includes(q) ||

      product.description.toLowerCase().includes(q) ||

      product.brand.toLowerCase().includes(q)

    );

  },

  /**
   * فیلتر دسته‌بندی
   */
  filterByCategory(category = "all") {

    if (category === "all") return products;

    return products.filter(
      product => product.category === category
    );

  },

  /**
   * فیلتر برند
   */
  filterByBrand(brand = "all") {

    if (brand === "all") return products;

    return products.filter(
      product =>
        product.brand.toLowerCase() === brand.toLowerCase()
    );

  },

  /**
   * مرتب‌سازی
   */
  sort(list, sortBy = "default") {

    const result = [...list];

    switch (sortBy) {

      case "price-asc":
        return result.sort((a, b) => a.price - b.price);

      case "price-desc":
        return result.sort((a, b) => b.price - a.price);

      case "name":
        return result.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

      default:
        return result;

    }

  }

};