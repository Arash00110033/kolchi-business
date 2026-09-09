import { useEffect, useState } from "react";

export default function CatalogToolbar({
  categories = [],
  query = "",
  category = "all",
  sort = "",
  onQueryChange,
  onCategoryChange,
  onSortChange,
}) {
  const [searchValue, setSearchValue] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      onQueryChange?.(searchValue);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchValue, onQueryChange]);

  return (
    <div
      dir="rtl"
      className="mb-8 rounded-2xl border border-[#e9e1da] bg-[#faf8f5] p-4 sm:p-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="جستجوی محصول..."
            aria-label="جستجوی محصول"
            className="h-12 w-full rounded-xl border border-[#ded5ce] bg-white px-4 text-sm text-[#2d211d] outline-none transition placeholder:text-[#a49a93] focus:border-[#8d6856] focus:ring-2 focus:ring-[#8d6856]/10"
          />
        </div>

        {/* Category */}
        <select
          value={category}
          onChange={(event) =>
            onCategoryChange?.(event.target.value)
          }
          aria-label="فیلتر دسته‌بندی"
          className="h-12 rounded-xl border border-[#ded5ce] bg-white px-4 text-sm font-medium text-[#49332a] outline-none transition focus:border-[#8d6856]"
        >
          <option value="all">
            همه دسته‌بندی‌ها
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
          aria-label="مرتب‌سازی محصولات"
          className="h-12 rounded-xl border border-[#ded5ce] bg-white px-4 text-sm font-medium text-[#49332a] outline-none transition focus:border-[#8d6856]"
        >
          <option value="">جدیدترین</option>
          <option value="price_asc">ارزان‌ترین</option>
          <option value="price_desc">گران‌ترین</option>
          <option value="name">بر اساس نام</option>
        </select>
      </div>
    </div>
  );
}
