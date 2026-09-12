import { useRouter } from "next/router";

export default function ProductInfo({
  product,
  quantity,
  onIncrease,
  onDecrease,
  onAddToCart,
  addingToCart,
  cartMessage,
  cartError,
  requiresLogin,
}) {
  const router = useRouter();

  if (!product) {
    return null;
  }

  const isAvailable = Boolean(product.available);
  const price = Number(product.price || 0);

  return (
    <div className="order-2 p-6 sm:p-8 lg:p-12">
      <div className="mb-4">
        <span className="rounded-full bg-[#f3e8de] px-4 py-2 text-sm font-medium text-[#694637]">
          {product.category_name || "دسته‌بندی"}
        </span>
      </div>

      <h1 className="text-3xl font-black tracking-tight text-[#2a201c] sm:text-4xl lg:text-5xl">
        {product.name}
      </h1>

      {product.description && (
        <p className="mt-5 max-w-2xl text-base leading-8 text-[#6f625b]">
          {product.description}
        </p>
      )}

      <div className="my-7 h-px bg-[#ebe5df]" />

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

      {isAvailable && (
        <div className="mt-6">
          <span className="mb-3 block text-sm font-bold text-[#49332a]">
            تعداد
          </span>

          <div className="flex w-fit items-center overflow-hidden rounded-2xl border border-[#ddd3cb] bg-white">
            <button
              type="button"
              onClick={onDecrease}
              disabled={quantity <= 1 || addingToCart}
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
              disabled={
                quantity >= product.stock || addingToCart
              }
              className="flex h-12 w-12 items-center justify-center text-xl text-[#4d3026] transition hover:bg-[#f7f3ee] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="افزایش تعداد"
            >
              +
            </button>
          </div>
        </div>
      )}

      {cartMessage && (
        <>
          <div className="mt-5 rounded-2xl border border-[#cfe4d0] bg-[#f1f8f1] px-4 py-3 text-sm font-semibold text-[#356139]">
            {cartMessage}
          </div>

          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/cart")}
              className="flex-1 rounded-xl bg-[#5b382b] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#45291f]"
            >
              مشاهده سبد خرید
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex-1 rounded-xl border border-[#5b382b] px-4 py-3 text-sm font-bold text-[#5b382b] transition hover:bg-[#f8f1ec]"
            >
              ادامه خرید
            </button>
          </div>
        </>
      )}

      {cartError && (
        <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {cartError}

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-3 w-full rounded-xl bg-[#5b382b] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#45291f]"
          >
            &#1608;&#1585;&#1608;&#1583; &#1576;&#1607; &#1581;&#1587;&#1575;&#1576;
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={onAddToCart}
        disabled={!isAvailable || addingToCart}
        className="mt-6 h-14 w-full rounded-2xl bg-[#5b382b] px-6 text-base font-bold text-white transition hover:bg-[#45291f] disabled:cursor-not-allowed disabled:bg-[#b9aea7]"
      >
        {addingToCart
          ? "در حال افزودن..."
          : isAvailable
            ? "افزودن به سبد خرید"
            : "محصول ناموجود است"}
      </button>
    </div>
  );
}
