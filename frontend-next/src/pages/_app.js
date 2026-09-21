import "@/styles/globals.css";

import { AuthProvider } from "@/context/AuthContext";
import { StoreProvider } from "@/context/StoreContext";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { I18nProvider } from "@/i18n";

export default function App({ Component, pageProps }) {
  return (
    <I18nProvider>
      <StoreProvider>
        <ThemeProvider>
          <AuthProvider>
            <Component {...pageProps} />
          </AuthProvider>
        </ThemeProvider>
      </StoreProvider>
    </I18nProvider>
  );
}