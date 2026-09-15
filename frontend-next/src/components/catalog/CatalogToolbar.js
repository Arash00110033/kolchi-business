import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";

export default function CatalogToolbar({
  categories = [],
  query = "",
  category = "all",
  sort = "",
  onQueryChange,
  onCategoryChange,
  onSortChange,
}) {
  const { t, isRTL } = useI18n();
  const [searchValue, setSearchValue] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      onQueryChange?.(searchValue);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchValue, onQueryChange]);

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="mb-8 rounded-2xl border border-[var(--theme-surface-muted)] bg-[var(--theme-surface)] p-4 sm:p-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder={t("common.search")}
            aria-label={t("common.searchAria")}
            className="h-12 w-full rounded-xl border border-[var(--theme-border)] bg-white px-4 text-sm text-[var(--theme-foreground)] outline-none transition placeholder:text-[var(--theme-muted)] focus:border-[var(--theme-secondary)] focus:ring-2 focus:ring-[var(--theme-secondary)]/10"
          />
        </div>

        {/* Category */}
        <select
          value={category}
          onChange={(event) =>
            onCategoryChange?.(event.target.value)
          }
          aria-label={t("common.categories")}
          className="h-12 rounded-xl border border-[var(--theme-border)] bg-white px-4 text-sm font-medium text-[var(--theme-foreground)] outline-none transition focus:border-[var(--theme-secondary)]"
        >
          <option value="all">
            {t("common.allCategories")}
          </option>

          {categories.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(event) =>
            onSortChange?.(event.target.value)
          }
          aria-label={t("common.sort")}
          className="h-12 rounded-xl border border-[var(--theme-border)] bg-white px-4 text-sm font-medium text-[var(--theme-foreground)] outline-none transition focus:border-[var(--theme-secondary)]"
        >
          <option value="">{t("common.newest")}</option>
          <option value="price_asc">{t("common.cheapest")}</option>
          <option value="price_desc">{t("common.expensive")}</option>
          <option value="name">{t("common.byName")}</option>
        </select>
      </div>
    </div>
  );
}
