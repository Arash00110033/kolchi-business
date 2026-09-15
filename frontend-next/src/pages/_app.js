import "@/styles/globals.css";

import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { I18nProvider } from "@/i18n";

export default function App({ Component, pageProps }) {
  return (
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}