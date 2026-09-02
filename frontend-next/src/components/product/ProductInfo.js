/*
=========================================================
PRODUCT INFO
=========================================================

Responsibility:
- Display category
- Display product name
- Display description
- Display product price
- Display stock status
- Display quantity controls

This component contains UI only.
No API calls are performed here.

=========================================================
*/

export default function ProductInfo({
  product,
  quantity,
  onIncrease,
  onDecrease,
}) {
  if (!product) {
    return null;
  }

  const isAvailable = Boolean(product.available);
  const price = Number(product.price || 0);

  return (
    <div className="order-2 p-6 sm:p-8 lg:p-12">
      {/* Category */}

      <div className="mb-4">
        <span className="rounded-full bg-[#f3e8de] px-4 py-2 text-sm font-medium text-[#694637]">
          {product.category_name || "دسته‌بندی"}
        </span>
      </div>

      {/* Product Name */}

      <h1 className="text-3xl font-black tracking-tight text-[#2a201c] sm:text-4xl lg:text-5xl">
        {product.name}
      </h1>

      {/* Description */}

      {product.description && (
        <p className="mt-5 max-w-2xl text-base leading-8 text-[#6f625b]">
          {product.description}
        </p>
      )}

      <div className="my-7 h-px bg-[#ebe5df]" />

      {/* Stock */}

      <div
        className={`rounded-2xl border p-4 ${
          isAvailable
            ? "border-[#dcebdc] bg-[#f3f8f3]"
            : "border-red-100 bg-red-50"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-bold text-[#49332a]">
            وضعیت موجودی
          </span>

          <span
            className={`text-sm font-bold ${
              isAvailable ? "text-[#356139]" : "text-red-600"
            }`}
          >
            {isAvailable
              ? `موجود — ${product.stock} عدد`
              : "ناموجود"}
          </span>
        </div>
      </div>

      {/* Price */}

      <div className="mt-5 rounded-[24px] bg-[#f7f3ee] p-5">
        <span className="block text-sm text-[#81766f]">
          قیمت
        </span>

        <div className="mt-2 flex items-end gap-2">
          <span className="text-3xl font-black text-[#3d271f]">
            {price.toLocaleString("fa-IR")}
          </span>

          <span className="pb-1 text-sm text-[#81766f]">
            تومان
          </span>
        </div>
      </div>

      {/* Quantity */}

      {isAvailable && (
        <div className="mt-6">
          <span className="mb-3 block text-sm font-bold text-[#49332a]">
            تعداد
          </span>

          <div className="flex w-fit items-center overflow-hidden rounded-2xl border border-[#ddd3cb] bg-white">
            <button
              type="button"
              onClick={onDecrease}
              disabled={quantity <= 1}
              className="flex h-12 w-12 items-center justify-center text-xl text-[#4d3026] transition hover:bg-[#f7f3ee] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="کاهش تعداد"
            >
              −
            </button>

            <span className="flex h-12 min-w-12 items-center justify-center border-x border-[#eee8e2] text-sm font-bold text-[#2d211d]">
              {quantity}
            </span>

            <button
              type="button"
              onClick={onIncrease}
              disabled={quantity >= product.stock}
              className="flex h-12 w-12 items-center justify-center text-xl text-[#4d3026] transition hover:bg-[#f7f3ee] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="افزایش تعداد"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Add To Cart */}

      <button
        type="button"
        disabled={!isAvailable}
        className="mt-6 h-14 w-full rounded-2xl bg-[#5b382b] px-6 text-base font-bold text-white transition hover:bg-[#45291f] disabled:cursor-not-allowed disabled:bg-[#b9aea7]"
      >
        {isAvailable
          ? "افزودن به سبد خرید"
          : "محصول ناموجود است"}
      </button>
    </div>
  );
}