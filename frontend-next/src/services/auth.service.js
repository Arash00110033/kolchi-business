import apiClient from "@/services/api/client";

const ACCESS_TOKEN_KEY = "kolchi-access-token";
const REFRESH_TOKEN_KEY = "kolchi-refresh-token";

function isBrowser() {
  return typeof window !== "undefined";
}

function getAccessToken() {
  if (!isBrowser()) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken() {
  if (!isBrowser()) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function saveTokens({ access, refresh }) {
  if (!isBrowser()) return;

  if (access) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
  }

  if (refresh) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  }
}

function clearTokens() {
  if (!isBrowser()) return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function register(userData) {
  return apiClient.post("/auth/register/", userData);
}

async function login(credentials) {
  const data = await apiClient.post("/auth/login/", credentials);

  if (!data?.access || !data?.refresh) {
    throw new Error("Invalid authentication response.");
  }

  saveTokens(data);

  const user = await getCurrentUser();

  return {
    ...data,
    user,
  };
}

async function getCurrentUser() {
  const access = getAccessToken();

  if (!access) {
    return null;
  }

  return apiClient.get(
    "/auth/me/",
    apiClient.withAuth(access)
  );
}

async function refreshToken() {
  const refresh = getRefreshToken();

  if (!refresh) {
    clearTokens();
    return null;
  }

  try {
    const data = await apiClient.post("/auth/refresh/", {
      refresh,
    });

    if (!data?.access) {
      throw new Error("Invalid refresh response.");
    }

    /*
     * Because ROTATE_REFRESH_TOKENS is enabled,
     * the backend may return a new refresh token.
     */
    saveTokens({
      access: data.access,
      refresh: data.refresh,
    });

    return data.access;
  } catch (error) {
    clearTokens();
    throw error;
  }
}

async function logout() {
  const refresh = getRefreshToken();

  try {
    if (refresh) {
      const access = getAccessToken();

      await apiClient.post(
        "/auth/logout/",
        { refresh },
        access ? apiClient.withAuth(access) : {}
      );
    }
  } finally {
    clearTokens();
  }
}

function getStoredAccessToken() {
  return getAccessToken();
}

function getStoredRefreshToken() {
  return getRefreshToken();
}

function isAuthenticated() {
  return Boolean(getAccessToken());
}

function clearAuth() {
  clearTokens();
}

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  refreshToken,
  getStoredAccessToken,
  getStoredRefreshToken,
  isAuthenticated,
  clearAuth,
};

export default authService;