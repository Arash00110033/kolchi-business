import apiClient from "@/services/api/client";

async function getPayments(token) {
  return apiClient.get(
    "/payments/",
    apiClient.withAuth(token)
  );
}

async function createPayment(token, orderId) {
  return apiClient.post(
    "/payments/",
    {
      order: orderId,
    },
    apiClient.withAuth(token)
  );
}

const paymentService = {
  getPayments,
  createPayment,
};

export default paymentService;
