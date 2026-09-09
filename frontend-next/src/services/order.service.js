import apiClient from "@/services/api/client";

async function getOrders(token) {
  return apiClient.get(
    "/orders/",
    apiClient.withAuth(token)
  );
}

async function getOrder(token, orderId) {
  return apiClient.get(
    `/orders/${orderId}/`,
    apiClient.withAuth(token)
  );
}

async function createOrder(token, shippingData) {
  return apiClient.post(
    "/orders/",
    shippingData,
    apiClient.withAuth(token)
  );
}

const orderService = {
  getOrders,
  getOrder,
  createOrder,
};

export default orderService;
