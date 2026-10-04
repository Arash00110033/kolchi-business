import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  isRTL,
} from "./config";
import fa from "./locales/fa";

const translations = {
  fa,
};

const I18nContext = createContext(null);

function getStoredLocale() {
  return DEFAULT_LOCALE;
}

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(DEFAULT_LOCALE);

  useEffect(() => {
    setLocale(getStoredLocale());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem("kolchi_locale", DEFAULT_LOCALE);

    document.documentElement.lang = DEFAULT_LOCALE;
    document.documentElement.dir = isRTL(DEFAULT_LOCALE) ? "rtl" : "ltr";
  }, []);

  const value = useMemo(() => {
    const dictionary = translations[DEFAULT_LOCALE];

    function t(key) {
      return key.split(".").reduce(
        (current, part) => current?.[part],
        dictionary
      ) ?? key;
    }

    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      t,
      isRTL: true,
      supportedLocales: SUPPORTED_LOCALES,
    };
  }, []);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return context;
}