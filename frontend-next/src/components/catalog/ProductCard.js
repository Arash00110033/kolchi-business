import { useEffect, useState } from "react";
import Link from "next/link";

import useAuth from "@/hooks/useAuth";
import authService from "@/services/auth.service";
import wishlistService from "@/services/wishlist.service";
import { useI18n } from "@/i18n";

export default function ProductCard({ product }) {
  const { isAuthenticated } = useAuth();
  const { t, locale, isRTL } = useI18n();

  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function syncWishlist() {
      if (!isAuthenticated || !product?.id) {
        if (mounted) {
          setWishlisted(false);
          setWishlistItemId(null);
        }
        return;
      }

      const token = authService.getStoredAccessToken();

      if (!token) {
        return;
      }

      try {
        const data = await wishlistService.getWishlist(token);

        if (!mounted) return;

        const wishlistItems = Array.isArray(data)
          ? data
          : data?.results || [];

        const item = wishlistItems.find(
          (wishlistItem) =>
            Number(wishlistItem.product) === Number(product.id)
        );

        setWishlisted(Boolean(item));
        setWishlistItemId(item?.id || null);
      } catch (error) {
        console.error("Wishlist sync error:", error);
      }
    }

    syncWishlist();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, product?.id]);

  if (!product) {
    return null;
  }

  const price = Number(product.price || 0);
  const isAvailable = Number(product.stock || 0) > 0;

  async function handleWishlist(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated || wishlistLoading) {
      return;
    }

    const token = authService.getStoredAccessToken();

    if (!token) {
      return;
    }

    try {
      setWishlistLoading(true);

      if (wishlisted && wishlistItemId) {
        await wishlistService.removeItem(token, wishlistItemId);

        setWishlisted(false);
        setWishlistItemId(null);
      } else {
        const item = await wishlistService.addItem(
          token,
          product.id
        );

        setWishlisted(true);
        setWishlistItemId(item?.id || null);
      }
    } catch (error) {
      console.error("Wishlist error:", error);
    } finally {
      setWishlistLoading(false);
    }
  }

  return (
    <article
      dir={isRTL ? "rtl" : "ltr"}
      className="group overflow-hidden rounded-[var(--theme-radius-large)] border border-[var(--theme-border)] bg-[var(--theme-surface)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--theme-secondary)] hover:shadow-[0_20px_50px_rgba(62,40,31,0.10)]"
    >
      <div className="relative">
        <Link
          href={`/product/${encodeURIComponent(product.slug)}`}
          className="block"
        >
          <div className="relative aspect-square overflow-hidden bg-[var(--theme-surface-muted)] p-6">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[var(--theme-muted)]">
                {t("common.image")}
              </div>
            )}

            <div className="absolute right-4 top-4">
              {isAvailable ? (
                <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-[var(--theme-success)] shadow-sm backdrop-blur">
                  {t("common.available")}
                </span>
              ) : (
                <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-[var(--theme-danger)] shadow-sm backdrop-blur">
                  {t("common.unavailable")}
                </span>
              )}
            </div>
          </div>
        </Link>

        {isAuthenticated && (
          <button
            type="button"
            onClick={handleWishlist}
            disabled={wishlistLoading}
            aria-label={
              wishlisted
                ? t("common.wishlisted")
                : t("common.wishlist")
            }
            aria-pressed={wishlisted}
            className={`absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/95 backdrop-blur transition-all duration-300 ${
              wishlisted
                ? "scale-105 text-red-500 shadow-[0_0_12px_rgba(255,215,0,0.95),0_0_28px_rgba(255,193,7,0.65),0_0_45px_rgba(255,215,0,0.25)]"
                : "text-[var(--theme-muted)] shadow-[0_4px_15px_rgba(62,40,31,0.10)] hover:scale-110 hover:text-red-500 hover:shadow-[0_0_14px_rgba(255,215,0,0.45)]"
            }`}
          >
            <span
              className={`relative z-10 text-[27px] leading-none transition-all duration-300 ${
                wishlisted
                  ? "animate-[pulse_1.2s_ease-in-out_infinite] text-red-500 drop-shadow-[0_0_5px_rgba(255,0,0,0.65)]"
                  : ""
              }`}
            >
              {wishlisted ? "♥" : "♡"}
            </span>

            {wishlisted && (
              <>
                <span className="pointer-events-none absolute inset-[-6px] rounded-full border border-yellow-300/70 shadow-[0_0_10px_rgba(255,215,0,0.9),0_0_24px_rgba(255,193,7,0.55)]" />

                <span className="pointer-events-none absolute inset-[-10px] rounded-full border border-yellow-400/30 shadow-[0_0_18px_rgba(255,215,0,0.45)]" />

                <span className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-300 opacity-90 shadow-[0_0_8px_rgba(255,215,0,1)]" />
              </>
            )}
          </button>
        )}
      </div>

      <div className="p-5">
        <div className="mb-3">
          <span className="inline-flex rounded-full bg-[var(--theme-surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--theme-primary)]">
            {product.category_name || t("common.product")}
          </span>
        </div>

        <Link
          href={`/product/${encodeURIComponent(product.slug)}`}
          className="block"
        >
          <h3 className="line-clamp-1 text-xl font-black text-[var(--theme-foreground)] transition group-hover:text-[var(--theme-primary)]">
            {product.name}
          </h3>
        </Link>

        <p className="mt-2 min-h-[48px] line-clamp-2 text-sm leading-7 text-[var(--theme-muted)]">
          {product.description ||
            t("common.noDescription")}
        </p>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <div className="text-xs text-[var(--theme-muted)]">
              {t("common.price")}
            </div>

            <div className="mt-1">
              <span className="text-xl font-black text-[var(--theme-primary)]">
                {price.toLocaleString(locale)}
              </span>

              <span className="mr-1 text-xs font-medium text-[var(--theme-muted)]">
                {t("common.currency")}
              </span>
            </div>
          </div>

          <Link
            href={`/product/${encodeURIComponent(product.slug)}`}
            className="rounded-[var(--theme-radius-small)] bg-[var(--theme-primary)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--theme-primary-hover)]"
          >
            {t("common.view")}
          </Link>
        </div>
      </div>
    </article>
  );
}
