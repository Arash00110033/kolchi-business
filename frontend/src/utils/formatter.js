export function formatPrice(price) {
    return new Intl.NumberFormat("fa-IR").format(price);
}