import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useStore } from "@/context/StoreContext";
import { DEFAULT_THEME } from "./tokens";
import { resolveTheme } from "./resolver";

const ThemeContext = createContext(null);

const CSS_VARIABLE_MAP = {
  radius: "--theme-radius",
  radiusSmall: "--theme-radius-small",
  radiusLarge: "--theme-radius-large",
  maxWidth: "--theme-max-width",
};

function applyTheme(theme) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  Object.entries(theme.colors || {}).forEach(([key, value]) => {
    root.style.setProperty(`--theme-${key}`, value);
  });

  Object.entries(theme.shape || {}).forEach(([key, value]) => {
    const cssVariable = CSS_VARIABLE_MAP[key] || `--theme-${key}`;
    root.style.setProperty(cssVariable, value);
  });

  Object.entries(theme.layout || {}).forEach(([key, value]) => {
    const cssVariable = CSS_VARIABLE_MAP[key] || `--theme-${key}`;
    root.style.setProperty(cssVariable, value);
  });

  if (theme.typography?.fontFamily) {
    root.style.setProperty(
      "--theme-font-family",
      theme.typography.fontFamily
    );
  }
}

export function ThemeProvider({ children }) {
  const {
    storeConfig,
    storeConfigLoading,
  } = useStore();

  const [theme, setTheme] = useState(DEFAULT_THEME);

  useEffect(() => {
    if (storeConfigLoading) {
      return;
    }

    const resolvedTheme = resolveTheme({
      presetName: storeConfig?.theme_preset,
      overrides: storeConfig?.theme_overrides || {},
    });

    setTheme(resolvedTheme);
  }, [storeConfig, storeConfigLoading]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}