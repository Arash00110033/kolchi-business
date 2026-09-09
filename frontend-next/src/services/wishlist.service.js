import apiClient from "@/services/api/client";

async function getWishlist(token) {
  return apiClient.get(
    "/wishlist/",
    apiClient.withAuth(token)
  );
}

async function addItem(token, productId) {
  return apiClient.post(
    "/wishlist/items/",
    {
      product: productId,
    },
    apiClient.withAuth(token)
  );
}

async function removeItem(token, itemId) {
  return apiClient.delete(
    `/wishlist/items/${itemId}/`,
    apiClient.withAuth(token)
  );
}

const wishlistService = {
  getWishlist,
  addItem,
  removeItem,
};

export default wishlistService;