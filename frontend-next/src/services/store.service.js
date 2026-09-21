import apiClient from "@/services/api/client";

const storeService = {
  async getPublicConfig(storeId) {
    if (!storeId) {
      throw new Error("Store ID is required.");
    }

    return apiClient.get(`/stores/${storeId}/config/`);
  },
};

export default storeService;