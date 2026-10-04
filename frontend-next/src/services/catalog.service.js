import apiClient from "@/services/api/client";

const catalogService = {
  async getProducts(storeId, params = {}) {
    if (!storeId) {
      throw new Error("Store ID is required.");
    }

    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, value);
      }
    });

    const queryString = searchParams.toString();

    return apiClient.get(
      `/stores/${storeId}/products/${queryString ? `?${queryString}` : ""}`
    );
  },

  async getProduct(storeId, slug) {
    if (!storeId) {
      throw new Error("Store ID is required.");
    }

    if (!slug) {
      throw new Error("Product slug is required.");
    }

    return apiClient.get(
      `/stores/${storeId}/products/${encodeURIComponent(slug)}/`
    );
  },

  async getCategories(storeId) {
    if (!storeId) {
      throw new Error("Store ID is required.");
    }

    return apiClient.get(`/stores/${storeId}/categories/`);
  },
};

export default catalogService;