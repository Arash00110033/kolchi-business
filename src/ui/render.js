export function renderUI({ products, cartCount, query, formatPrice }) {
  return `
    <header class="topbar">
      <div class="brand-mark">کل‌چی</div>

      <input
        id="searchInput"
        type="search"
        placeholder="جستجو محصولات..."
        value="${query}"
      />

      <button data-action="cart">
        🛒 (${cartCount})
      </button>
    </header>

    <main class="page">
      <h2>محصولات</h2>

      <div class="grid">
        ${
          products.length
            ? products.map(p => 
                <div class="card">
                  <div class="icon">${p.icon}</div>
                  <h3>${p.name}</h3>
                  <p>${p.description}</p>
                  <strong>${formatPrice(p.price)} تومان</strong>

                  <button data-action="add" data-id="${p.id}">
                    افزودن
                  </button>
                </div>
              ).join("")
            : <p>محصولی یافت نشد</p>
        }
      </div>
    </main>
  `;
}