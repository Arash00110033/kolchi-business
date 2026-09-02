import Link from "next/link";

export default function ProductCard({ product }) {
  if (!product) {
    return null;
  }

  const price = Number(product.price || 0);

  return (
    <article
      dir="rtl"
      className="group overflow-hidden rounded-[28px] border border-[#e9e1da] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#d8c6b8] hover:shadow-[0_20px_50px_rgba(62,40,31,0.10)]"
    >
      {/* Product Image */}
      <Link
        href={`/product?slug=${encodeURIComponent(product.slug)}`}
        className="block"
      >
        <div className="relative aspect-square overflow-hidden bg-[#f7f3ee] p-6">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[#a49a93]">
              تصویر محصول
            </div>
          )}

          {/* Stock badge */}
          <div className="absolute right-4 top-4">
            {product.stock > 0 ? (
              <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-[#356139] shadow-sm backdrop-blur">
                موجود
              </span>
            ) : (
              <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-red-600 shadow-sm backdrop-blur">
                ناموجود
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        <div className="mb-3">
          <span className="inline-flex rounded-full bg-[#f4ebe4] px-3 py-1 text-xs font-semibold text-[#704b3a]">
            {product.category_name || "محصول"}
          </span>
        </div>

        {/* Name */}
        <Link
          href={`/product?slug=${encodeURIComponent(product.slug)}`}
          className="block"
        >
          <h3 className="line-clamp-1 text-xl font-black text-[#2d211d] transition group-hover:text-[#6b4030]">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="mt-2 min-h-[48px] line-clamp-2 text-sm leading-7 text-[#756961]">
          {product.description || "اطلاعاتی برای این محصول ثبت نشده است."}
        </p>

        {/* Bottom */}
        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <div className="text-xs text-[#95877e]">قیمت</div>

            <div className="mt-1">
              <span className="text-xl font-black text-[#3e281f]">
                {price.toLocaleString("fa-IR")}
              </span>

              <span className="mr-1 text-xs font-medium text-[#796b63]">
                تومان
              </span>
            </div>
          </div>

          <Link
            href={`/product?slug=${encodeURIComponent(product.slug)}`}
            className="rounded-xl bg-[#4d3026] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#3b241d]"
          >
            مشاهده
          </Link>
        </div>
      </div>
    </article>
  );
}