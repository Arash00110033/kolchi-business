/*
=========================================================
PRODUCT BREADCRUMB
=========================================================

Responsibility:
- Display the product navigation path
- Provide navigation to Home and Shop

This component contains UI and navigation only.
No API calls are performed here.

=========================================================
*/

import { useRouter } from "next/router";

export default function ProductBreadcrumb({ product }) {
  const router = useRouter();

  if (!product) {
    return null;
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[#81766f]">
      {/* Home */}

      <button
        type="button"
        onClick={() => router.push("/")}
        className="transition hover:text-[#4d3026]"
      >
        خانه
      </button>

      <span>/</span>

      {/* Shop */}

      <button
        type="button"
        onClick={() => router.push("/")}
        className="transition hover:text-[#4d3026]"
      >
        فروشگاه
      </button>

      <span>/</span>

      {/* Category */}

      <span className="text-[#4c3026]">
        {product.category_name || "دسته‌بندی"}
      </span>

      <span>/</span>

      {/* Product */}

      <span className="font-medium text-[#2d211d]">
        {product.name}
      </span>
    </div>
  );
}