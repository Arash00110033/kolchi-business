import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  isRTL,
} from "./config";
import fa from "./locales/fa";
import en from "./locales/en";
import es from "./locales/es";
import it from "./locales/it";
import he from "./locales/he";
import zh from "./locales/zh";
import ja from "./locales/ja";
import ar from "./locales/ar";

const translations = {
  fa,
  en,
  es,
  it,
  he,
  zh,
  ja,
  ar,
};

const I18nContext = createContext(null);

function getStoredLocale() {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  const stored = window.localStorage.getItem("kolchi_locale");

  if (SUPPORTED_LOCALES.includes(stored)) {
    return stored;
  }

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

    window.localStorage.setItem("kolchi_locale", locale);

    document.documentElement.lang = locale;
    document.documentElement.dir = isRTL(locale) ? "rtl" : "ltr";
  }, [locale]);

  const value = useMemo(() => {
    const dictionary = translations[locale] || translations[DEFAULT_LOCALE];

    function t(key) {
      return key.split(".").reduce(
        (current, part) => current?.[part],
        dictionary
      ) ?? key;
    }

    return {
      locale,
      setLocale,
      t,
      isRTL: isRTL(locale),
      supportedLocales: SUPPORTED_LOCALES,
    };
  }, [locale]);

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