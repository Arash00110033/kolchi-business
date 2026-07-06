export function filterProducts(products, query) {
  if (!query) return products;

  const q = query.toLowerCase().trim();

  return products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q)
  );
}