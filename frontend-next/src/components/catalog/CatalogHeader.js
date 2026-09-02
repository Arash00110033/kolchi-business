import Link from "next/link";

export default function CatalogHeader({
  categories = [],
  activeCategory = "all",
}) {
  return (
    <section
      dir="rtl"
      className="rounded-3xl border border-[#e7e0d9] bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="flex flex-col gap-6">

        <div>
          <span className="text-sm font-medium text-[#a06b45]">
            Kolchi Store
          </span>

          <h1 className="mt-1 text-3xl font-black text-[#2d211d] sm:text-4xl">
            فروشگاه
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#817770] sm:text-base">
            محصولات مورد نیازت را پیدا کن و با خیال راحت انتخاب کن.
          </p>
        </div>

        <nav
          aria-label="دسته‌بندی محصولات"
          className="flex flex-wrap gap-2"
        >
          <Link
            href="/"
            className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${
              activeCategory === "all"
                ? "border-[#4d3026] bg-[#4d3026] text-white"
                : "border-[#ded7d0] bg-white text-[#4d3026] hover:bg-[#f7f2ed]"
            }`}
          >
            همه محصولات
          </Link>

          {categories.map((category) => {
            const isActive = activeCategory === category.slug;

            return (
              <Link
                key={category.id}
                href={`/?category=${encodeURIComponent(category.slug)}`}
                className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "border-[#4d3026] bg-[#4d3026] text-white"
                    : "border-[#ded7d0] bg-white text-[#4d3026] hover:bg-[#f7f2ed]"
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