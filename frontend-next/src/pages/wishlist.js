import { useEffect, useState } from "react";
import Link from "next/link";

import useAuth from "@/hooks/useAuth";
import authService from "@/services/auth.service";
import wishlistService from "@/services/wishlist.service";
import { useI18n } from "@/i18n";

export default function WishlistPage() {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const { t, isRTL } = useI18n();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const locale = isRTL ? "fa-IR" : "en-US";

  async function loadWishlist() {
    const token = authService.getStoredAccessToken();

    if (!token) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setError("");

      const data = await wishlistService.getWishlist(token);

      setItems(
        Array.isArray(data)
          ? data
          : data?.results || []
      );
    } catch (err) {
      setError(t("wishlist.fetchError"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    loadWishlist();
  }, [authLoading, isAuthenticated]);

  async function removeItem(itemId) {
    const token = authService.getStoredAccessToken();

    try {
      setError("");

      await wishlistService.removeItem(token, itemId);

      setItems((current) =>
        current.filter((item) => item.id !== itemId)
      );
    } catch (err) {
      setError(t("wishlist.removeError"));
    }
  }

  if (authLoading || loading) {
    return (
      <main
        dir={isRTL ? "rtl" : "ltr"}
        className="mx-auto max-w-5xl px-5 py-10"
      >
        <p className="text-[var(--theme-muted)]">
          {t("wishlist.loading")}
        </p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main
        dir={isRTL ? "rtl" : "ltr"}
        className="mx-auto max-w-5xl px-5 py-10"
      >
        <div className="rounded-3xl border border-[var(--theme-border)] bg-white p-8 text-center shadow-sm">
          <h1 className="mb-3 text-2xl font-black text-[var(--theme-primary)]">
            {t("wishlist.title")}
          </h1>

          <p className="mb-6 text-[var(--theme-muted)]">
            {t("wishlist.unauthMessage")}
          </p>

          <Link
            href="/login"
            className="inline-block rounded-xl bg-[var(--theme-primary)] px-5 py-3 font-semibold text-white"
          >
            {t("wishlist.login")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className="mx-auto max-w-5xl px-5 py-10"
    >
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-block rounded-xl border border-[var(--theme-border)] px-4 py-2 text-sm font-semibold text-[var(--theme-primary)] transition hover:bg-[var(--theme-surface-muted)]"
          >
            {t("wishlist.backToStore")}
          </Link>
        </div>

        <h1 className="text-3xl font-black text-[var(--theme-primary)]">
          {t("wishlist.title")}
        </h1>

        <p className="mt-2 text-sm text-[var(--theme-muted)]">
          {t("wishlist.count").replace(
            "{count}",
            items.length.toLocaleString(locale)
          )}
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-3xl border border-[var(--theme-border)] bg-white p-10 text-center shadow-sm">
          <div className="mb-4 text-4xl">♡</div>

          <h2 className="mb-3 text-xl font-bold text-[var(--theme-primary)]">
            {t("wishlist.emptyTitle")}
          </h2>

          <p className="mb-6 text-[var(--theme-muted)]">
            {t("wishlist.emptyMessage")}
          </p>

          <Link
            href="/"
            className="inline-block rounded-xl bg-[var(--theme-primary)] px-5 py-3 font-semibold text-white"
          >
            {t("wishlist.backToStore")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-3xl border border-[var(--theme-border)] bg-white shadow-sm"
            >
              <Link
                href={`/product/${encodeURIComponent(item.slug)}`}
              >
                <div className="aspect-square bg-[var(--theme-surface-muted)] p-6">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[var(--theme-muted)]">
                      {t("wishlist.productImage")}
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-5">
                <span className="rounded-full bg-[var(--theme-surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--theme-primary)]">
                  {item.category_name || t("wishlist.product")}
                </span>

                <Link
                  href={`/product/${encodeURIComponent(item.slug)}`}
                >
                  <h2 className="mt-3 line-clamp-1 text-lg font-black text-[var(--theme-foreground)]">
                    {item.product_name}
                  </h2>
                </Link>

                <p className="mt-2 text-lg font-black text-[var(--theme-foreground)]">
                  {Number(item.price || 0).toLocaleString(locale)}
                  <span className="mr-1 text-xs font-medium">
                    {t("wishlist.currency")}
                  </span>
                </p>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="mt-4 w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
                >
                  {t("wishlist.remove")}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
