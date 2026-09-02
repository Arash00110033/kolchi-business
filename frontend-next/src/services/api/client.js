/*
=========================================================
API CLIENT
=========================================================

Responsibility:
- Centralize HTTP requests
- Handle JSON responses
- Handle API errors
- Provide common HTTP methods
- Support authenticated requests

=========================================================
*/

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:9000/api/v1";

/*
=========================================================
REQUEST
=========================================================
*/

async function request(endpoint, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    ...rest
  } = options;

  const requestHeaders = {
    Accept: "application/json",
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });

  let data = null;

  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const error = new Error(
      typeof data === "string"
        ? data
        : data?.detail || "خطایی در ارتباط با سرور رخ داد."
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

/*
=========================================================
HTTP METHODS
=========================================================
*/

export async function get(endpoint, options = {}) {
  return request(endpoint, {
    ...options,
    method: "GET",
  });
}

export async function post(endpoint, body, options = {}) {
  return request(endpoint, {
    ...options,
    method: "POST",
    body,
  });
}

export async function put(endpoint, body, options = {}) {
  return request(endpoint, {
    ...options,
    method: "PUT",
    body,
  });
}

export async function patch(endpoint, body, options = {}) {
  return request(endpoint, {
    ...options,
    method: "PATCH",
    body,
  });
}

export async function del(endpoint, options = {}) {
  return request(endpoint, {
    ...options,
    method: "DELETE",
  });
}

/*
=========================================================
AUTHENTICATED REQUEST
=========================================================
*/

export function withAuth(token, options = {}) {
  return {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  };
}

/*
=========================================================
DEFAULT API CLIENT
=========================================================
*/

const apiClient = {
  request,
  get,
  post,
  put,
  patch,
  delete: del,
  withAuth,
};

export default apiClient;