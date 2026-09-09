import { useEffect, useState } from "react";
import Link from "next/link";

import useAuth from "@/hooks/useAuth";
import authService from "@/services/auth.service";
import wishlistService from "@/services/wishlist.service";

export default function WishlistPage() {
  const { loading: authLoading, isAuthenticated } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      setError("دریافت علاقه‌مندی‌ها ناموفق بود.");
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
      setError("حذف از علاقه‌مندی‌ها ناموفق بود.");
    }
  }

  if (authLoading || loading) {
    return (
      <main dir="rtl" className="mx-auto max-w-5xl px-5 py-10">
        <p className="text-[#6b5b52]">
          در حال دریافت علاقه‌مندی‌ها...
        </p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main dir="rtl" className="mx-auto max-w-5xl px-5 py-10">
        <div className="rounded-3xl border border-[#e7e0d9] bg-white p-8 text-center shadow-sm">
          <h1 className="mb-3 text-2xl font-black text-[#432a22]">
            علاقه‌مندی‌ها
          </h1>

          <p className="mb-6 text-[#6b5b52]">
            برای مشاهده علاقه‌مندی‌ها ابتدا وارد حساب کاربری شوید.
          </p>

          <Link
            href="/login"
            className="inline-block rounded-xl bg-[#432a22] px-5 py-3 font-semibold text-white"
          >
            ورود
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="mx-auto max-w-5xl px-5 py-10"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#432a22]">
          علاقه‌مندی‌ها
        </h1>

        <p className="mt-2 text-sm text-[#75665d]">
          {items.length} محصول در علاقه‌مندی‌ها
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-3xl border border-[#e7e0d9] bg-white p-10 text-center shadow-sm">
          <div className="mb-4 text-4xl">♡</div>

          <h2 className="mb-3 text-xl font-bold text-[#432a22]">
            هنوز محصولی ذخیره نکرده‌اید
          </h2>

          <p className="mb-6 text-[#75665d]">
            محصولات مورد علاقه‌تان را اینجا ذخیره کنید.
          </p>

          <Link
            href="/"
            className="inline-block rounded-xl bg-[#432a22] px-5 py-3 font-semibold text-white"
          >
            بازگشت به فروشگاه
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-3xl border border-[#e7e0d9] bg-white shadow-sm"
            >
              <Link
                href={`/product/${encodeURIComponent(item.slug)}`}
              >
                <div className="aspect-square bg-[#f7f3ee] p-6">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[#a49a93]">
                      تصویر محصول
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-5">
                <span className="rounded-full bg-[#f4ebe4] px-3 py-1 text-xs font-semibold text-[#704b3a]">
                  {item.category_name || "محصول"}
                </span>

                <Link
                  href={`/product/${encodeURIComponent(item.slug)}`}
                >
                  <h2 className="mt-3 line-clamp-1 text-lg font-black text-[#2d211d]">
                    {item.product_name}
                  </h2>
                </Link>

                <p className="mt-2 text-lg font-black text-[#3e281f]">
                  {Number(item.price || 0).toLocaleString("fa-IR")}
                  <span className="mr-1 text-xs font-medium">
                    تومان
                  </span>
                </p>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="mt-4 w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
                >
                  حذف از علاقه‌مندی‌ها
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
