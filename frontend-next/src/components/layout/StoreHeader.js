import Link from "next/link";
import useAuth from "@/hooks/useAuth";

export default function StoreHeader() {
  const { user, loading, isAuthenticated, logout } = useAuth();

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

        <nav className="hidden items-center gap-6 text-sm font-semibold text-[#5f514a] sm:flex">
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
