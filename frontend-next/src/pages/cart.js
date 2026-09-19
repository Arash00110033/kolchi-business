import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";

import Link from "next/link";

import useAuth from "@/hooks/useAuth";

import authService from "@/services/auth.service";

import cartService from "@/services/cart.service";

import orderService from "@/services/order.service";

function isValidIranianPhone(phone) {
  return /^(09\d{9}|\+989\d{9})$/.test(phone);
}

export default function CartPage() {
  const { t, locale, isRTL } = useI18n();
  const { loading: authLoading, isAuthenticated } = useAuth();

  const [cart, setCart] = useState(null);

  const [loading, setLoading] = useState(true);

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [error, setError] = useState("");

  const [shippingAddress, setShippingAddress] = useState("");

  const [shippingPhone, setShippingPhone] = useState("");

  async function loadCart() {
    const token = authService.getStoredAccessToken();

    if (!token) {
      setCart(null);
      setLoading(false);
      return;
    }

    try {
      setError("");
      const data = await cartService.getCart(token);
      setCart(data);
    } catch (err) {
      setError(t("common.errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    loadCart();
  }, [authLoading, isAuthenticated]);

  async function updateQuantity(itemId, quantity) {
    if (quantity < 1) return;

    const token = authService.getStoredAccessToken();

    try {
      setError("");

      const data = await cartService.updateItem(
        token,
        itemId,
        quantity
      );

      setCart(data);
    } catch (err) {
      setError(
        err?.data?.detail ||
          t("common.errorGeneric")
      );
    }
  }

  async function removeItem(itemId) {
    const token = authService.getStoredAccessToken();

    try {
      setError("");

      const data = await cartService.removeItem(
        token,
        itemId
      );

      setCart(data);
    } catch (err) {
      setError(t("common.errorGeneric"));
    }
  }

  async function clearCart() {
    const token = authService.getStoredAccessToken();

    try {
      setError("");

      const data = await cartService.clearCart(token);

      setCart(data);
    } catch (err) {
      setError(t("common.errorGeneric"));
    }
  }

  async function checkout() {
    if (checkoutLoading || !cart?.items?.length) {
      return;
    }

    const address = shippingAddress.trim();
    const phone = shippingPhone.trim();

    if (!address) {
      setError(t("auth.addressRequired"));
      return;
    }

    if (address.length < 10) {
      setError(t("auth.addressTooShort"));
      return;
    }

    if (!phone) {
      setError(t("auth.phoneRequired"));
      return;
    }

    if (!isValidIranianPhone(phone)) {
      setError(
        t("auth.invalidPhone")
      );
      return;
    }

    const token = authService.getStoredAccessToken();

    if (!token) {
      setError(
        t("auth.loginToOrder")
      );
      return;
    }

    try {
      setCheckoutLoading(true);
      setError("");

      const order = await orderService.createOrder(
        token,
        {
          shipping_address: address,
          shipping_phone: phone,
        }
      );

      setCart({
        ...cart,
        items: [],
        total: 0,
      });

      setShippingAddress("");
      setShippingPhone("");

      window.location.href = `/orders/${order.id}`;
    } catch (err) {
      setError(
        err?.data?.detail ||
          t("auth.orderFailed")
      );
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <main
        dir={isRTL ? "rtl" : "ltr"}
        className="mx-auto max-w-5xl px-5 py-10"
      >
        <p className="text-[var(--theme-muted)]">
          {t("auth.loadingCart")}
        </p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main
        dir={isRTL ? "rtl" : "ltr"}
        className="mx-auto max-w-5xl px-5 py-10"
      >
        <div className="rounded-3xl border border-[var(--theme-border)] bg-white p-8 text-center shadow-sm">
          <h1 className="mb-3 text-2xl font-black text-[var(--theme-primary)]">
            {t("common.cart")}
          </h1>

          <p className="mb-6 text-[var(--theme-muted)]">
            {t("auth.loginRequired")}
          </p>

          <Link
            href="/login"
            className="inline-block rounded-xl bg-[var(--theme-primary)] px-5 py-3 font-semibold text-white"
          >
            {t("common.login")}
          </Link>
        </div>
      </main>
    );
  }

  const items = cart?.items || [];

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className="mx-auto max-w-5xl px-5 py-10"
    >
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--theme-primary)]">
            {t("common.cart")}
          </h1>

          <p className="mt-2 text-sm text-[var(--theme-muted)]">
            {t("auth.cartItemsCount").replace("{count}", items.length.toLocaleString(locale))}
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="rounded-xl border border-[var(--theme-border)] px-4 py-2 text-sm font-semibold text-[var(--theme-muted)] transition hover:bg-[var(--theme-surface-muted)]"
          >
            {t("auth.clearCart")}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-3xl border border-[var(--theme-border)] bg-white p-10 text-center shadow-sm">
          <h2 className="mb-3 text-xl font-bold text-[var(--theme-primary)]">
            {t("auth.emptyCart")}
          </h2>

          <p className="mb-6 text-[var(--theme-muted)]">
            {t("auth.emptyCartText")}
          </p>

          <Link
            href="/"
            className="inline-block rounded-xl bg-[var(--theme-primary)] px-5 py-3 font-semibold text-white"
          >
            {t("auth.backToStore")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl border border-[var(--theme-border)] bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-bold text-[var(--theme-primary)]">
                      {item.product_name}
                    </h2>

                    <p className="mt-2 text-sm text-[var(--theme-muted)]">
                      {t("auth.unitPrice")}:{" "}
                      {Number(item.unit_price).toLocaleString(
                        locale
                      )}{" "}
                      {t("common.currency")}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[var(--theme-primary)]">
                      {t("auth.subtotal")}:{" "}
                      {Number(item.subtotal).toLocaleString(
                        locale
                      )}{" "}
                      {t("common.currency")}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity - 1
                        )
                      }
                      disabled={item.quantity <= 1}
                      className="h-9 w-9 rounded-lg border border-[var(--theme-border)] disabled:opacity-40"
                    >
                      −
                    </button>

                    <span className="min-w-8 text-center font-bold">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity + 1
                        )
                      }
                      className="h-9 w-9 rounded-lg border border-[var(--theme-border)]"
                    >
                      +
                    </button>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="mr-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      {t("auth.remove")}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-3xl border border-[var(--theme-border)] bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-black text-[var(--theme-primary)]">
              {t("auth.shippingInfo")}
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="shipping-phone"
                  className="mb-2 block text-sm font-semibold text-[var(--theme-muted)]"
                >
                  {t("auth.phone")}
                </label>

                <input
                  id="shipping-phone"
                  type="tel"
                  inputMode="numeric"
                  dir="ltr"
                  value={shippingPhone}
                  onChange={(event) =>
                    setShippingPhone(event.target.value)
                  }
                  placeholder="09123456789"
                  className="w-full rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--theme-primary)]"
                />
              </div>

              <div>
                <label
                  htmlFor="shipping-address"
                  className="mb-2 block text-sm font-semibold text-[var(--theme-muted)]"
                >
                  {t("auth.address")}
                </label>

                <textarea
                  id="shipping-address"
                  value={shippingAddress}
                  onChange={(event) =>
                    setShippingAddress(event.target.value)
                  }
                  placeholder={t("auth.shippingAddress")}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--theme-primary)]"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[var(--theme-border)] pt-5">
              <span className="font-semibold text-[var(--theme-muted)]">
                {t("auth.total")}
              </span>

              <span className="text-xl font-black text-[var(--theme-primary)]">
                {Number(cart?.total || 0).toLocaleString(
                  locale
                )}{" "}
                <span className="text-xs font-medium">
                  {t("common.currency")}
                </span>
              </span>
            </div>

            <button
              type="button"
              onClick={checkout}
              disabled={checkoutLoading}
              className="mt-6 w-full rounded-xl bg-[var(--theme-primary)] px-4 py-3 font-bold text-white transition hover:bg-[var(--theme-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {checkoutLoading
                ? t("auth.placingOrder")
                : t("auth.placeOrder")}
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}
