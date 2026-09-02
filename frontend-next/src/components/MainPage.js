import { useEffect, useState } from "react";
import catalogService from "@/services/catalog.service";
import CatalogHeader from "@/components/catalog/CatalogHeader";
import ProductGrid from "@/components/catalog/ProductGrid";
import CatalogToolbar from "@/components/catalog/CatalogToolbar";

export default function MainPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("");

  useEffect(() => {
  async function loadCatalog() {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (query.trim()) {
        params.query = query.trim();
      }

      if (category !== "all") {
        params.category = category;
      }

      if (sort) {
        params.sort = sort;
      }

      const productsResponse = await catalogService.getProducts(params);

      setProducts(productsResponse?.results || []);
    } catch (err) {
      console.error("Products loading error:", err);

      setError(
        "خطایی در دریافت محصولات رخ داد. لطفاً دوباره تلاش کنید."
      );
    } finally {
      setLoading(false);
    }
  }

  loadCatalog();
}, [query, category, sort]);

  useEffect(() => {
  async function loadCategories() {
    try {
      const categoriesResponse =
        await catalogService.getCategories();

      setCategories(categoriesResponse?.results || []);
    } catch (err) {
      console.error("Categories loading error:", err);
    }
  }

  loadCategories();
}, []);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#f7f3ee] px-4 py-5 sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-[1540px]">

        {/* Header */}
        <CatalogHeader categories={categories} />

        {/* Hero */}
        <section className="relative mt-6 overflow-hidden rounded-[32px] bg-gradient-to-l from-[#d0a06c] via-[#8f5d43] to-[#432a22] px-7 py-12 text-white shadow-[0_18px_50px_rgba(70,45,30,0.12)] sm:px-10 sm:py-14 lg:px-16 lg:py-16">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              Kolchi Store
            </span>

            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl lg:text-7xl">
              همه‌چیز برای تجربه بهتر
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
              قهوه، ابزار و محصولات منتخب را پیدا کن و با خیال راحت انتخابت را
              انجام بده.
            </p>
          </div>

          {/* Decorative shapes */}
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-32 right-1/3 h-72 w-72 rounded-full bg-black/5" />
        </section>

        {/* Products */}
        <section className="mt-6 rounded-[32px] border border-[#e7e0d9] bg-white p-6 shadow-[0_12px_40px_rgba(70,45,30,0.05)] sm:p-8 lg:p-10">

          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-sm font-semibold text-[#a06b45]">
                Collection
              </span>

              <h2 className="mt-1 text-3xl font-black text-[#29211e]">
                محصولات منتخب
              </h2>
            </div>

            <span className="text-sm text-[#817770]">
              {loading
                ? "در حال دریافت محصولات..."
                : `${products.length.toLocaleString("fa-IR")} محصول`}
            </span>
          </div>

          <CatalogToolbar
            categories={categories}
            query={query}
            category={category}
            sort={sort}
           onQueryChange={setQuery}
           onCategoryChange={setCategory}
           onSortChange={setSort}
/>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-[28px] border border-[#eee7e1] bg-[#fffdfa]"
                >
                  <div className="aspect-square animate-pulse bg-[#f1ece7]" />

                  <div className="space-y-3 p-5">
                    <div className="h-4 w-20 animate-pulse rounded-full bg-[#eee7e1]" />
                    <div className="h-6 w-2/3 animate-pulse rounded bg-[#eee7e1]" />
                    <div className="h-10 animate-pulse rounded bg-[#f2ede8]" />
                    <div className="h-10 animate-pulse rounded-xl bg-[#eee7e1]" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex min-h-[280px] items-center justify-center rounded-[26px] border border-red-200 bg-red-50 px-6 text-center">
              <div>
                <h3 className="text-lg font-bold text-red-800">
                  دریافت اطلاعات ناموفق بود
                </h3>

                <p className="mt-2 text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && products.length === 0 && (
            <div className="flex min-h-[280px] items-center justify-center rounded-[26px] border border-dashed border-[#ded5ce] bg-[#fffdfa] text-center">
              <div>
                <h3 className="text-xl font-bold text-[#2d211d]">
                  محصولی پیدا نشد
                </h3>

                <p className="mt-2 text-sm text-[#817770]">
                  در حال حاضر محصولی برای نمایش وجود ندارد.
                </p>
              </div>
            </div>
          )}

          {/* Products */}
          {!loading && !error && products.length > 0 && (
            <ProductGrid products={products} />
          )}
        </section>

        {/* Categories */}
        {!loading && !error && categories.length > 0 && (
          <section className="mt-6 rounded-[32px] border border-[#e7e0d9] bg-white p-6 shadow-[0_12px_40px_rgba(70,45,30,0.04)] sm:p-8 lg:p-10">

            <div className="mb-7">
              <span className="text-sm font-semibold text-[#a06b45]">
                Categories
              </span>

              <h2 className="mt-1 text-3xl font-black text-[#29211e]">
                دسته‌بندی‌ها
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="group rounded-2xl border border-[#e8e1da] bg-[#fffdfa] p-5 transition hover:-translate-y-0.5 hover:border-[#d7c3b4] hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-bold text-[#3e281f]">
                      {category.name}
                    </h3>

                    <span className="text-xl text-[#b18a73] transition group-hover:translate-x-[-3px]">
                      ←
                    </span>
                  </div>

                  {category.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-7 text-[#817770]">
                      {category.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer spacing */}
        <div className="h-8" />
      </div>
    </main>
  );
}