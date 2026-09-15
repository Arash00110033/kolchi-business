import { useRouter } from "next/router";
import { useI18n } from "@/i18n";

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
  const { t, locale, isRTL } = useI18n();

  if (!product) {
    return null;
  }

  const isAvailable = Boolean(product.available);
  const price = Number(product.price || 0);

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="order-2 p-6 sm:p-8 lg:p-12">
      <div className="mb-4">
        <span className="rounded-full bg-[color-mix(in srgb, var(--theme-secondary) 14%, white)] px-4 py-2 text-sm font-medium text-[var(--theme-primary)]">
          {product.category_name || t("common.category")}
        </span>
      </div>

      <h1 className="text-3xl font-black tracking-tight text-[var(--theme-foreground)] sm:text-4xl lg:text-5xl">
        {product.name}
      </h1>

      {product.description && (
        <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--theme-muted)]">
          {product.description}
        </p>
      )}

      <div className="my-7 h-px bg-[var(--theme-border)]" />

      <div
        className={`rounded-2xl border p-4 ${
          isAvailable
            ? "border-[color-mix(in srgb, var(--theme-success) 18%, white)] bg-[color-mix(in srgb, var(--theme-success) 8%, white)]"
            : "border-red-100 bg-red-50"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-bold text-[var(--theme-foreground)]">
            {t("common.stock")}
          </span>

          <span
            className={`text-sm font-bold ${
              isAvailable ? "text-[var(--theme-success)]" : "text-red-600"
            }`}
          >
            {isAvailable
              ? `${t("common.available")} — ${product.stock} ${t("common.productsCount")}`
              : t("common.unavailable") }
          </span>
        </div>
      </div>

      <div className="mt-5 rounded-[24px] bg-[var(--theme-background)] p-5">
        <span className="block text-sm text-[var(--theme-muted)]">
          {t("common.price")}
        </span>

        <div className="mt-2 flex items-end gap-2">
          <span className="text-3xl font-black text-[var(--theme-primary)]">
            {price.toLocaleString(locale)}
          </span>

          <span className="pb-1 text-sm text-[var(--theme-muted)]">
            {t("common.currency")}
          </span>
        </div>
      </div>

      {isAvailable && (
        <div className="mt-6">
          <span className="mb-3 block text-sm font-bold text-[var(--theme-foreground)]">
            {t("common.quantity")}
          </span>

          <div className="flex w-fit items-center overflow-hidden rounded-2xl border border-[var(--theme-border)] bg-white">
            <button
              type="button"
              onClick={onDecrease}
              disabled={quantity <= 1 || addingToCart}
              className="flex h-12 w-12 items-center justify-center text-xl text-[var(--theme-primary)] transition hover:bg-[var(--theme-background)] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={t("common.decrease")}
            >
              −
            </button>

            <span className="flex h-12 min-w-12 items-center justify-center border-x border-[var(--theme-border)] text-sm font-bold text-[var(--theme-foreground)]">
              {quantity}
            </span>

            <button
              type="button"
              onClick={onIncrease}
              disabled={
                quantity >= product.stock || addingToCart
              }
              className="flex h-12 w-12 items-center justify-center text-xl text-[var(--theme-primary)] transition hover:bg-[var(--theme-background)] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={t("common.increase")}
            >
              +
            </button>
          </div>
        </div>
      )}

      {cartMessage && (
        <>
          <div className="mt-5 rounded-2xl border border-[color-mix(in srgb, var(--theme-success) 20%, white)] bg-[color-mix(in srgb, var(--theme-success) 8%, white)] px-4 py-3 text-sm font-semibold text-[var(--theme-success)]">
            {cartMessage}
          </div>

          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/cart")}
              className="flex-1 rounded-xl bg-[var(--theme-primary)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--theme-primary-hover)]"
            >
              {t("common.viewCart")}
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex-1 rounded-xl border border-[var(--theme-primary)] px-4 py-3 text-sm font-bold text-[var(--theme-primary)] transition hover:bg-[var(--theme-background)]"
            >
              {t("common.continueShopping")}
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
            className="mt-3 w-full rounded-xl bg-[var(--theme-primary)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--theme-primary-hover)]"
          >
            {t("common.login")}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={onAddToCart}
        disabled={!isAvailable || addingToCart}
        className="mt-6 h-14 w-full rounded-2xl bg-[var(--theme-primary)] px-6 text-base font-bold text-white transition hover:bg-[var(--theme-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--theme-muted)]"
      >
        {addingToCart
          ? t("common.adding")
          : isAvailable
            ? t("common.addToCart")
            : t("common.unavailableProduct")}
      </button>
    </div>
  );
}
