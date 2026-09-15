import { useRouter } from "next/router";

export default function ProductBreadcrumb({ product }) {
  const router = useRouter();

  if (!product) {
    return null;
  }

  return (
    <nav
      aria-label="مسیر صفحه"
      className="mb-7 flex min-w-0 items-center gap-1.5 overflow-hidden text-sm"
    >
      <button
        type="button"
        onClick={() => router.push("/")}
        className="shrink-0 rounded-lg px-2 py-1.5 font-medium text-[var(--theme-muted)] transition-all duration-200 hover:bg-[var(--theme-background)] hover:text-[var(--theme-primary)]"
      >
        خانه
      </button>

      <span
        className="shrink-0 px-0.5 text-[var(--theme-border)]"
        aria-hidden="true"
      >
        /
      </span>

      <button
        type="button"
        onClick={() => router.push("/")}
        className="shrink-0 rounded-lg px-2 py-1.5 font-medium text-[var(--theme-muted)] transition-all duration-200 hover:bg-[var(--theme-background)] hover:text-[var(--theme-primary)]"
      >
        فروشگاه
      </button>

      <span
        className="shrink-0 px-0.5 text-[var(--theme-border)]"
        aria-hidden="true"
      >
        /
      </span>

      <span className="min-w-0 truncate rounded-lg px-2 py-1.5 text-[var(--theme-muted)]">
        {product.category_name || "دسته‌بندی"}
      </span>

      <span
        className="shrink-0 px-0.5 text-[var(--theme-border)]"
        aria-hidden="true"
      >
        /
      </span>

      <span
        className="min-w-0 truncate rounded-xl bg-[var(--theme-surface-muted)] px-3 py-1.5 font-semibold text-[var(--theme-foreground)] shadow-sm"
        aria-current="page"
        title={product.name}
      >
        {product.name}
      </span>
    </nav>
  );
}
