import apiClient from "@/services/api/client";

const catalogService = {
  async getProducts(params = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, value);
      }
    });

    const queryString = searchParams.toString();

    return apiClient.get(
      `/products/${queryString ? `?${queryString}` : ""}`
    );
  },

  async getProduct(slug) {
    if (!slug) {
      throw new Error("Product slug is required.");
    }

    return apiClient.get(
      `/products/${encodeURIComponent(slug)}/`
    );
  },

  async getCategories() {
    return apiClient.get("/categories/");
  },
};

export default catalogService;