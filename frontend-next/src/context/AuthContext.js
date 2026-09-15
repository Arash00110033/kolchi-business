import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import authService from "@/services/auth.service";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const initializedRef = useRef(false);

  const loadUser = useCallback(async () => {
    try {
      const accessToken = authService.getStoredAccessToken();

      if (!accessToken) {
        setUser(null);
        return;
      }

      const currentUser = await authService.getCurrentUser();

      setUser(currentUser);
    } catch (error) {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    let mounted = true;

    async function initializeAuth() {
      try {
        const accessToken = authService.getStoredAccessToken();
        const refreshToken = authService.getStoredRefreshToken();

        if (!accessToken && !refreshToken) {
          if (mounted) {
            setUser(null);
          }

          return;
        }

        try {
          const currentUser = await authService.getCurrentUser();

          if (mounted) {
            setUser(currentUser);
          }
        } catch (error) {
          if (!refreshToken) {
            authService.clearAuth();

            if (mounted) {
              setUser(null);
            }

            return;
          }

          try {
            await authService.refreshToken();

            const currentUser = await authService.getCurrentUser();

            if (mounted) {
              setUser(currentUser);
            }
          } catch (refreshError) {
            authService.clearAuth();

            if (mounted) {
              setUser(null);
            }
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const result = await authService.login(credentials);

    setUser(result.user);

    return result;
  }, []);

  const register = useCallback(async (userData) => {
    return authService.register(userData);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();

    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    const accessToken = await authService.refreshToken();

    if (!accessToken) {
      setUser(null);
      return null;
    }

    const currentUser = await authService.getCurrentUser();

    setUser(currentUser);

    return currentUser;
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    refresh,
    loadUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
