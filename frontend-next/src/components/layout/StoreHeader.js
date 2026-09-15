import { useEffect, useState } from "react";
import Link from "next/link";

import useAuth from "@/hooks/useAuth";
import adminService from "@/services/admin.service";
import authService from "@/services/auth.service";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";
import { useI18n } from "@/i18n";

export default function StoreHeader() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { t, isRTL } = useI18n();

  const [canAccessAdmin, setCanAccessAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAdminAccess() {
      if (!isAuthenticated) {
        setCanAccessAdmin(false);
        return;
      }

      const token = authService.getStoredAccessToken();

      if (!token) {
        setCanAccessAdmin(false);
        return;
      }

      try {
        await adminService.getStore(1, token);

        if (mounted) {
          setCanAccessAdmin(true);
        }
      } catch {
        if (mounted) {
          setCanAccessAdmin(false);
        }
      }
    }

    checkAdminAccess();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const navItem =
    "rounded-[var(--theme-radius-small)] px-3 py-2 text-sm font-semibold text-[var(--theme-muted)] transition-all duration-200 hover:bg-[var(--theme-background)] hover:text-[var(--theme-primary)]";

  return (
    <header
      dir={isRTL ? "rtl" : "ltr"}
      className="mb-6 rounded-[var(--theme-radius-large)] border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-4 shadow-[0_10px_35px_rgba(70,45,30,0.06)] sm:px-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Link
          href="/"
          className="self-center text-2xl font-black tracking-tight text-[var(--theme-primary)] transition hover:text-[var(--theme-primary-hover)] lg:self-auto"
        >
          Kolchi
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          <Link href="/" className={navItem}>
            {t("common.store")}
          </Link>

          <Link href="/cart" className={navItem}>
            {t("common.cart")}
          </Link>

          {isAuthenticated && (
            <>
              <Link href="/wishlist" className={navItem}>
                {t("common.wishlistLink")}
              </Link>

              <Link href="/orders" className={navItem}>
                {t("common.orders")}
              </Link>

              {canAccessAdmin && (
                <Link
                  href="/admin"
                  className="rounded-[var(--theme-radius-small)] bg-[var(--theme-surface-muted)] px-3.5 py-2 text-sm font-bold text-[var(--theme-primary)] transition-all duration-200 hover:bg-[var(--theme-primary)] hover:text-white"
                >
                  {t("common.panel")}
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center justify-center gap-2 lg:justify-end">
          <LanguageSwitcher />
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-[var(--theme-radius-small)] bg-[var(--theme-border)]" />
          ) : isAuthenticated ? (
            <>
              <span className="hidden max-w-32 truncate rounded-[var(--theme-radius-small)] bg-[var(--theme-background)] px-3 py-2 text-sm font-semibold text-[var(--theme-foreground)] sm:inline">
                {user?.username || user?.email || t("common.user")}
              </span>

              <button
                type="button"
                onClick={logout}
                className="rounded-[var(--theme-radius-small)] border border-[var(--theme-border)] px-3.5 py-2 text-sm font-semibold text-[var(--theme-muted)] transition-all duration-200 hover:bg-[var(--theme-background)] hover:text-[var(--theme-primary)]"
              >
                {t("common.logout")}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-[var(--theme-radius-small)] px-3.5 py-2 text-sm font-semibold text-[var(--theme-muted)] transition-all duration-200 hover:bg-[var(--theme-background)] hover:text-[var(--theme-primary)]"
              >
                {t("common.login")}
              </Link>

              <Link
                href="/register"
                className="rounded-[var(--theme-radius-small)] bg-[var(--theme-primary)] px-4 py-2 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-[var(--theme-primary-hover)] hover:shadow-md"
              >
                {t("auth.register")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
