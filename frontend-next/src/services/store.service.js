import apiClient from "@/services/api/client";

const storeService = {
  async getPublicConfig(storeId) {
    if (!storeId) {
      throw new Error("Store ID is required.");
    }

    return apiClient.get(`/stores/${storeId}/config/`);
  },

  async getPublicCategories(storeId) {
    if (!storeId) {
      throw new Error("Store ID is required.");
    }

    return apiClient.get(`/stores/${storeId}/categories/`);
  },

  async getPublicProducts(storeId, params = {}) {
    if (!storeId) {
      throw new Error("Store ID is required.");
    }

    return apiClient.get(`/stores/${storeId}/products/`, {
      params,
    });
  },

  async getPublicProduct(storeId, slug) {
    if (!storeId) {
      throw new Error("Store ID is required.");
    }

    if (!slug) {
      throw new Error("Product slug is required.");
    }

    return apiClient.get(`/stores/${storeId}/products/${slug}/`);
  },
};

export default storeService;