/**
 * -------------------------------------------------------
 * Kolchi Business
 * Module: API Service
 * Layer: Services
 * -------------------------------------------------------
 * Responsibility:
 * Centralized HTTP Client
 *
 * Future:
 * - Express API
 * - JWT
 * - Refresh Token
 * - Error Handler
 * - Request Interceptor
 * * -------------------------------------------------------
 */

const BASE_URL = "/api";

async function request(endpoint, options = {}) {

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export const ApiService = {

  get(endpoint) {
    return request(endpoint);
  },

  post(endpoint, body) {
    return request(endpoint, {
      method: "POST",
      body: JSON.stringify(body)
    });
  },

  put(endpoint, body) {
    return request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body)
    });
  },

  delete(endpoint) {
    return request(endpoint, {
      method: "DELETE"
    });
  }

};