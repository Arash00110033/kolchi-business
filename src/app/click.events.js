import { actions } from "../store/store.js"; 
import { CartService } from "../services/cart.service.js"; 
import { ProductService } from "../services/product.service.js"; 
import { showSuccessToast } from "../services/toast.service.js";

/**

Global click event delegation */ export function bindClickEvents() { document.addEventListener("click", (event) => { const target = event.target;

if (!(target instanceof Element)) { return; }

/* ================================================== OPEN CART ================================================== */

const cartButton = target.closest("#cartBtn");

if (cartButton) { actions.toggleCart(); return; }

/* ================================================== CONTINUE SHOPPING ================================================== */

const continueShoppingButton = target.closest("#continueShopping");

if (continueShoppingButton) { actions.closeCart(); return; }

/* ================================================== ADD TO CART ================================================== */

const addToCartButton = target.closest('[data-action="add-to-cart"]');

if (addToCartButton) { event.stopPropagation();

const productId = addToCartButton.dataset.id;

if (!productId) { return; }

actions.addToCart(productId);

showSuccessToast( "محصول با موفقیت به سبد خرید اضافه شد" );

const originalText = addToCartButton.textContent;

addToCartButton.classList.add("is-added");

addToCartButton.textContent = "✓ اضافه شد";

addToCartButton.disabled = true;

setTimeout(() => { addToCartButton.classList.remove("is-added");

 addToCartButton.textContent =
   originalText;

 addToCartButton.disabled = false;
}, 1200);

return; }

/* ================================================== OPEN PRODUCT MODAL ================================================== */

const productCard = target.closest('[data-action="open-product-modal"]');

if (productCard) { const productId = productCard.dataset.productId;

if (!productId) { return; }

const product = ProductService.getById(productId);

if (product) { actions.openProductModal(product); }

return; }

/* ================================================== CLOSE PRODUCT MODAL ================================================== */

const closeProductModalButton = target.closest("#closeProductModal");

if (closeProductModalButton) { actions.closeProductModal(); return; }

/* ================================================== CLOSE PRODUCT MODAL BY OVERLAY ================================================== */

const modalOverlay = target.closest(".modal");

if ( modalOverlay && target === modalOverlay ) { actions.closeProductModal(); return; }

/* ================================================== CLOSE CART ================================================== */

const closeCartButton = target.closest("#closeCart");

if (closeCartButton) { actions.closeCart(); return; }

/* ================================================== CLOSE CART BY OVERLAY ================================================== */

const cartOverlay = target.closest(".cart-overlay");

if ( cartOverlay && target === cartOverlay ) { actions.closeCart(); return; }

/* ================================================== INCREASE QUANTITY ================================================== */

const increaseQuantityButton = target.closest(".increaseQty");

if (increaseQuantityButton) { const productId = increaseQuantityButton.dataset.id;

if (productId) { CartService.increaseQuantity(productId); }

return; }

/* ================================================== DECREASE QUANTITY ================================================== */

const decreaseQuantityButton = target.closest(".decreaseQty");

if (decreaseQuantityButton) { const productId = decreaseQuantityButton.dataset.id;

if (productId) { CartService.decreaseQuantity(productId); }

return; }

/* ================================================== REMOVE ITEM ================================================== */

const removeItemButton = target.closest(".cart-item__remove");

if (removeItemButton) { const productId = removeItemButton.dataset.id;

if (productId) { CartService.removeItem(productId); }

return; }

/* ================================================== CLEAR CART ================================================== */

const clearCartButton = target.closest("#clearCart");

if (clearCartButton) { CartService.clear(); return; }

/* ================================================== CLEAR SEARCH ================================================== */

const clearSearchButton = target.closest("#clearSearch");

if (clearSearchButton) { const searchInput = document.getElementById("search");

if (searchInput) { searchInput.value = ""; }

actions.setQuery("");

return; } }); }