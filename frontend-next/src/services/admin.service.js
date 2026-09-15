import apiClient from "@/services/api/client";

const adminService = {
  // ============================================================
  // STORE
  // ============================================================

  async getStore(storeId, token) {
    if (!storeId) {
      throw new Error("Store ID is required.");
    }

    return apiClient.get(
      `/admin/stores/${storeId}/`,
      apiClient.withAuth(token)
    );
  },

  async updateStore(storeId, data, token) {
    if (!storeId) {
      throw new Error("Store ID is required.");
    }

    return apiClient.patch(
      `/admin/stores/${storeId}/`,
      data,
      apiClient.withAuth(token)
    );
  },

  // ============================================================
  // MEMBERS
  // ============================================================

  async getMembers(storeId, token) {
    if (!storeId) {
      throw new Error("Store ID is required.");
    }

    return apiClient.get(
      `/admin/stores/${storeId}/members/`,
      apiClient.withAuth(token)
    );
  },

  async createMember(storeId, data, token) {
    if (!storeId) {
      throw new Error("Store ID is required.");
    }

    return apiClient.post(
      `/admin/stores/${storeId}/members/`,
      data,
      apiClient.withAuth(token)
    );
  },

  async updateMember(storeId, memberId, data, token) {
    if (!storeId || !memberId) {
      throw new Error("Store ID and member ID are required.");
    }

    return apiClient.patch(
      `/admin/stores/${storeId}/members/${memberId}/`,
      data,
      apiClient.withAuth(token)
    );
  },

  async deleteMember(storeId, memberId, token) {
    if (!storeId || !memberId) {
      throw new Error("Store ID and member ID are required.");
    }

    return apiClient.delete(
      `/admin/stores/${storeId}/members/${memberId}/`,
      apiClient.withAuth(token)
    );
  },

  // ============================================================
  // CATALOG
  // ============================================================

  async getProducts(storeId, token) {
    if (!storeId) {
      throw new Error("Store ID is required.");
    }

    return apiClient.get(
      `/admin/stores/${storeId}/products/`,
      apiClient.withAuth(token)
    );
  },

  async getCategories(storeId, token) {
    if (!storeId) {
      throw new Error("Store ID is required.");
    }

    return apiClient.get(
      `/admin/stores/${storeId}/categories/`,
      apiClient.withAuth(token)
    );
  },

  async createCategory(storeId, data, token) {
    if (!storeId) {
      throw new Error("Store ID is required.");
    }

    return apiClient.post(
      `/admin/stores/${storeId}/categories/`,
      data,
      apiClient.withAuth(token)
    );
  },

  async updateCategory(storeId, categoryId, data, token) {
    if (!storeId || !categoryId) {
      throw new Error("Store ID and category ID are required.");
    }

    return apiClient.patch(
      `/admin/stores/${storeId}/categories/${categoryId}/`,
      data,
      apiClient.withAuth(token)
    );
  },

  async deleteCategory(storeId, categoryId, token) {
    if (!storeId || !categoryId) {
      throw new Error("Store ID and category ID are required.");
    }

    return apiClient.delete(
      `/admin/stores/${storeId}/categories/${categoryId}/`,
      apiClient.withAuth(token)
    );
  },
  async createProduct(storeId, data, token) {
    if (!storeId) {
      throw new Error("Store ID is required.");
    }

    return apiClient.post(
      `/admin/stores/${storeId}/products/`,
      data,
      apiClient.withAuth(token)
    );
  },

  async updateProduct(storeId, productId, data, token) {
    if (!storeId || !productId) {
      throw new Error("Store ID and product ID are required.");
    }

    return apiClient.patch(
      `/admin/stores/${storeId}/products/${productId}/`,
      data,
      apiClient.withAuth(token)
    );
  },

  async deleteProduct(storeId, productId, token) {
    if (!storeId || !productId) {
      throw new Error("Store ID and product ID are required.");
    }

    return apiClient.delete(
      `/admin/stores/${storeId}/products/${productId}/`,
      apiClient.withAuth(token)
    );
  },

  // ============================================================
  // INVENTORY
  // ============================================================

  async getInventory(storeId, token) {
    if (!storeId) {
      throw new Error("Store ID is required.");
    }

    return apiClient.get(
      `/admin/stores/${storeId}/inventory/`,
      apiClient.withAuth(token)
    );
  },

  async adjustInventory(storeId, productId, data, token) {
    if (!storeId || !productId) {
      throw new Error(
        "Store ID and product ID are required."
      );
    }

    return apiClient.post(
      `/admin/stores/${storeId}/inventory/${productId}/adjust/`,
      data,
      apiClient.withAuth(token)
    );
  },
  // ============================================================
  // ORDERS
  // ============================================================

  async getOrders(storeId, token) {
    if (!storeId) {
      throw new Error("Store ID is required.");
    }

    return apiClient.get(
      `/admin/stores/${storeId}/orders/`,
      apiClient.withAuth(token)
    );
  },

  async getOrder(storeId, orderId, token) {
    if (!storeId || !orderId) {
      throw new Error("Store ID and order ID are required.");
    }

    return apiClient.get(
      `/admin/stores/${storeId}/orders/${orderId}/`,
      apiClient.withAuth(token)
    );
  },

  async updateOrderStatus(storeId, orderId, status, token) {
    if (!storeId || !orderId) {
      throw new Error("Store ID and order ID are required.");
    }

    if (!status) {
      throw new Error("Order status is required.");
    }

    return apiClient.patch(
      `/admin/stores/${storeId}/orders/${orderId}/status/`,
      { status },
      apiClient.withAuth(token)
    );
  },
};

export default adminService;
