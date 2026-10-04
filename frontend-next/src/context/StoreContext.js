import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_STORE_ID,
  normalizeStoreId,
} from "@/store/config";
import storeService from "@/services/store.service";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [storeId, setStoreIdState] = useState(DEFAULT_STORE_ID);
  const [storeConfig, setStoreConfig] = useState(null);
  const [storeConfigLoading, setStoreConfigLoading] = useState(true);
  const [storeConfigError, setStoreConfigError] = useState(null);
  const [storeCategories, setStoreCategories] = useState([]);
  const [storeProducts, setStoreProducts] = useState([]);

  const setStoreId = useCallback((value) => {
    const normalizedId = normalizeStoreId(value);

    if (normalizedId === null) {
      throw new Error("Invalid store ID.");
    }

    setStoreIdState(normalizedId);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadStoreConfig() {
      setStoreConfigLoading(true);
      setStoreConfigError(null);

      try {
        const [config, categoryResponse, productResponse] = await Promise.all([
          storeService.getPublicConfig(storeId),
          storeService.getPublicCategories(storeId),
          storeService.getPublicProducts(storeId, { page_size: 6 }),
        ]);

        if (cancelled) {
          return;
        }

        setStoreConfig(config);
        setStoreCategories(categoryResponse?.results ?? []);
        setStoreProducts(productResponse?.results ?? []);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setStoreConfig(null);
        setStoreCategories([]);
        setStoreProducts([]);
        setStoreConfigError(error);
      } finally {
        if (!cancelled) {
          setStoreConfigLoading(false);
        }
      }
    }

    loadStoreConfig();

    return () => {
      cancelled = true;
    };
  }, [storeId]);

  const value = useMemo(
    () => ({
      storeId,
      setStoreId,
      storeConfig,
      storeCategories,
      storeProducts,
      storeConfigLoading,
      storeConfigError,
    }),
    [
      storeId,
      setStoreId,
      storeConfig,
      storeCategories,
      storeProducts,
      storeConfigLoading,
      storeConfigError,
    ]
  );

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStore must be used inside StoreProvider");
  }

  return context;
}