export function formatPrice(num) {
  return new Intl.NumberFormat("fa-IR").format(num);
}