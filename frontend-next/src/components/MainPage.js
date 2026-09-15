import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import catalogService from "@/services/catalog.service";
import StoreHeader from "@/components/layout/StoreHeader";
import CatalogHeader from "@/components/catalog/CatalogHeader";
import ProductGrid from "@/components/catalog/ProductGrid";
import CatalogToolbar from "@/components/catalog/CatalogToolbar";

export default function MainPage() {
  const { t, locale, isRTL } = useI18n();
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

        setError(t("common.error"));
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
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-[var(--theme-background)] px-4 py-5 sm:px-6 lg:px-10"
    >
      <div
        className="mx-auto"
        style={{ maxWidth: "var(--theme-max-width)" }}
      >
        <StoreHeader />

        <CatalogHeader categories={categories} />

        {/* Storefront Hero */}
        <section className="relative mt-6 overflow-hidden rounded-[var(--theme-radius-large)] bg-[var(--theme-primary)] px-7 py-12 text-white shadow-[0_18px_50px_rgba(70,45,30,0.12)] sm:px-10 sm:py-14 lg:px-16 lg:py-16">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              {t("common.storeLabel")}
            </span>

            <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl lg:text-7xl">
              {t("common.heroTitle")}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
              {t("common.heroText")}
            </p>
          </div>

          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-32 right-1/3 h-72 w-72 rounded-full bg-black/5" />
        </section>
        {/* Products */}
        <section className="mt-6 rounded-[var(--theme-radius-large)] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 shadow-[0_12px_40px_rgba(70,45,30,0.05)] sm:p-8 lg:p-10">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-sm font-semibold text-[var(--theme-secondary)]">
                {t("common.collection")}
              </span>

              <h2 className="mt-1 text-3xl font-black text-[var(--theme-foreground)]">
                {t("common.featured")}
              </h2>
            </div>

            <span className="text-sm text-[var(--theme-muted)]">
              {loading
                ? t("common.loadingProducts")
                : `${products.length.toLocaleString(locale)} ${t("common.productsCount")}`
              }
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

          {loading && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-[var(--theme-radius-large)] border border-[var(--theme-border)] bg-[var(--theme-surface-muted)]"
                >
                  <div className="aspect-square animate-pulse bg-[var(--theme-border)]" />

                  <div className="space-y-3 p-5">
                    <div className="h-4 w-20 animate-pulse rounded-full bg-[var(--theme-border)]" />
                    <div className="h-6 w-2/3 animate-pulse rounded bg-[var(--theme-border)]" />
                    <div className="h-10 animate-pulse rounded bg-[var(--theme-surface-muted)]" />
                    <div className="h-10 animate-pulse rounded-[var(--theme-radius-small)] bg-[var(--theme-border)]" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="flex min-h-[280px] items-center justify-center rounded-[var(--theme-radius-large)] border border-red-200 bg-red-50 px-6 text-center">
              <div>
                <h3 className="text-lg font-bold text-red-800">
                  {t("common.errorTitle")}
                </h3>
                <p className="mt-2 text-sm text-red-700">
                  {t(error)}
                </p>
              </div>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="flex min-h-[280px] items-center justify-center rounded-[var(--theme-radius-large)] border border-dashed border-[var(--theme-border)] bg-[var(--theme-surface-muted)] text-center">
              <div>
                <h3 className="text-xl font-bold text-[var(--theme-foreground)]">
                  {t("common.emptyTitle")}
                </h3>
                <p className="mt-2 text-sm text-[var(--theme-muted)]">
                  {t("common.empty")}
                </p>
              </div>
            </div>
          )}
          {!loading && !error && products.length > 0 && (
            <ProductGrid products={products} />
          )}
        </section>

        {/* Categories */}
        {!loading && !error && categories.length > 0 && (
          <section className="mt-6 rounded-[var(--theme-radius-large)] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 shadow-[0_12px_40px_rgba(70,45,30,0.04)] sm:p-8 lg:p-10">
            <div className="mb-7">
              <span className="text-sm font-semibold text-[var(--theme-secondary)]">
                {t("common.categories")}
              </span>

              <h2 className="mt-1 text-3xl font-black text-[var(--theme-foreground)]">
                {t("common.categoryProducts")}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="group rounded-[var(--theme-radius)] border border-[var(--theme-border)] bg-[var(--theme-surface-muted)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--theme-secondary)] hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-bold text-[var(--theme-foreground)]">
                      {category.name}
                    </h3>

                    <span className="text-xl text-[var(--theme-secondary)] transition group-hover:translate-x-[-3px]">
                      →
                    </span>
                  </div>

                  {category.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-7 text-[var(--theme-muted)]">
                      {category.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
        <div className="h-8" />
      </div>
    </main>
  );
}
