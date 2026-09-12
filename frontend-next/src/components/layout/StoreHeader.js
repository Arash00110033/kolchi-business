import { useEffect, useState } from "react";
import Link from "next/link";

import useAuth from "@/hooks/useAuth";
import adminService from "@/services/admin.service";
import authService from "@/services/auth.service";

export default function StoreHeader() {
  const { user, loading, isAuthenticated, logout } = useAuth();

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

  return (
    <header
      dir="rtl"
      className="mb-6 rounded-[28px] border border-[#e7e0d9] bg-white px-5 py-4 shadow-[0_10px_35px_rgba(70,45,30,0.06)] sm:px-7"
    >
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-xl font-black tracking-tight text-[#432a22]"
        >
          Kolchi
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-[#5f514a] sm:gap-6">
          <Link
            href="/"
            className="transition hover:text-[#a06b45]"
          >
            فروشگاه
          </Link>

          <Link
            href="/cart"
            className="transition hover:text-[#a06b45]"
          >
            سبد خرید
          </Link>

          {isAuthenticated && (
            <>
              <Link
                href="/wishlist"
                className="transition hover:text-[#a06b45]"
              >
                علاقه‌مندی‌ها
              </Link>

              <Link
                href="/orders"
                className="transition hover:text-[#a06b45]"
              >
                سفارش‌های من
              </Link>

              {canAccessAdmin && (
                <Link
                  href="/admin"
                  className="font-bold text-[#a06b45] transition hover:text-[#432a22]"
                >
                  پنل مدیریت
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-xl bg-[#eee7e1]" />
          ) : isAuthenticated ? (
            <>
              <span className="hidden text-sm font-semibold text-[#4b3b34] sm:inline">
                {user?.username || user?.email || "کاربر"}
              </span>

              <button
                type="button"
                onClick={logout}
                className="rounded-xl border border-[#ded3ca] px-3 py-2 text-sm font-semibold text-[#5f514a] transition hover:bg-[#f7f3ee]"
              >
                خروج
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl px-3 py-2 text-sm font-semibold text-[#5f514a] transition hover:bg-[#f7f3ee]"
              >
                ورود
              </Link>

              <Link
                href="/register"
                className="rounded-xl bg-[#432a22] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#5a382d]"
              >
                ثبت‌نام
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

