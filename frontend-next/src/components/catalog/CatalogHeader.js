import Link from "next/link";
import { useI18n } from "@/i18n";

export default function CatalogHeader({
  categories = [],
  activeCategory = "all",
}) {
  const { t, isRTL } = useI18n();
  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="rounded-3xl border border-[var(--theme-border)] bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="flex flex-col gap-6">

        <div>
          <span className="text-sm font-medium text-[var(--theme-secondary)]">
            Kolchi Store
          </span>

          <h1 className="mt-1 text-3xl font-black text-[var(--theme-foreground)] sm:text-4xl">
            {t("common.store")}
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--theme-muted)] sm:text-base">
            {t("common.heroText")}
          </p>
        </div>

        <nav
          aria-label={t("common.categoryProducts")}
          className="flex flex-wrap gap-2"
        >
          <Link
            href="/"
            className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${
              activeCategory === "all"
                ? "border-[var(--theme-primary)] bg-[var(--theme-primary)] text-white"
                : "border-[var(--theme-border)] bg-white text-[var(--theme-primary)] hover:bg-[var(--theme-background)]"
            }`}
          >
            {t("common.allProducts")}
          </Link>

          {categories.map((category) => {
            const isActive = activeCategory === category.slug;

            return (
              <Link
                key={category.id}
                href={`/?category=${encodeURIComponent(category.slug)}`}
                className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "border-[var(--theme-primary)] bg-[var(--theme-primary)] text-white"
                    : "border-[var(--theme-border)] bg-white text-[var(--theme-primary)] hover:bg-[var(--theme-background)]"
                }`}
              >
                {category.name}
              </Link>
            );
          })}
        </nav>

      </div>
    </section>
  );
}
