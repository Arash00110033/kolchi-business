/**
 * -------------------------------------------------------
 * Kolchi Business
 * Shop State (Single Source of Truth)
 * -------------------------------------------------------
 */

const state = {
  products: [],
  filteredProducts: [],
  searchQuery: "",
  selectedCategory: "all",
  sortType: "default",
  cart: []
};

const listeners = [];

/**
 * گرفتن state
 */
export function getShopState() {
  return state;
}

/**
 * آپدیت state
 */
export function setShopState(partial) {
  Object.assign(state, partial);

  notify();
}

/**
 * subscribe برای UI (reactive system ساده)
 */
export function subscribe(listener) {
  listeners.push(listener);

  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
}

/**
 * notify همه UI ها
 */
function notify() {
  listeners.forEach((fn) => fn(state));
}

/**
 * افزودن به cart (MVP)
 */
export function addToCart(product) {
  const existing = state.cart.find(item => item.id === product.id);

  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ ...product, qty: 1 });
  }

  notify();
}

/**
 * سرچ ساده (MVP)
 */
export function setSearchQuery(query) {
  state.searchQuery = query;

  applyFilters();
}

/**
 * فیلتر ساده (MVP)
 */
export function setCategory(category) {
  state.selectedCategory = category;

  applyFilters();
}

/**
 * فیلتر کردن محصولات
 */
function applyFilters() {
  let result = [...state.products];

  if (state.searchQuery) {
    result = result.filter(p =>
      p.title.toLowerCase().includes(state.searchQuery.toLowerCase())
    );
  }

  if (state.selectedCategory !== "all") {
    result = result.filter(p =>
      p.category === state.selectedCategory
    );
  }

  state.filteredProducts = result;

  notify();
}

/**
 * ست کردن محصولات اولیه
 */
export function setProducts(products) {
  state.products = products;
  state.filteredProducts = products;

  notify();
}