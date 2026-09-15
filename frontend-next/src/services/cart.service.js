import apiClient from "@/services/api/client";

async function getCart(token) {
  return apiClient.get(
    "/cart/",
    apiClient.withAuth(token)
  );
}

async function addItem(token, productId, quantity = 1) {
  return apiClient.post(
    "/cart/items/",
    {
      product: productId,
      quantity,
    },
    apiClient.withAuth(token)
  );
}

async function updateItem(token, itemId, quantity) {
  return apiClient.patch(
    `/cart/items/${itemId}/`,
    {
      quantity,
    },
    apiClient.withAuth(token)
  );
}

async function removeItem(token, itemId) {
  return apiClient.delete(
    `/cart/items/${itemId}/delete/`,
    apiClient.withAuth(token)
  );
}

async function clearCart(token) {
  return apiClient.delete(
    "/cart/clear/",
    apiClient.withAuth(token)
  );
}

const cartService = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};

export default cartService;
