import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import useAuth from "@/hooks/useAuth";
import authService from "@/services/auth.service";
import orderService from "@/services/order.service";
import paymentService from "@/services/payment.service";
import { useI18n } from "@/i18n";

const STATUS_KEYS = {
  pending: "pending",
  confirmed: "confirmed",
  paid: "paid",
  shipped: "shipped",
  delivered: "delivered",
  cancelled: "cancelled",
};

const TRACKING_STEPS = [
  {
    status: "pending",
    label: "ثبت سفارش",
    icon: "🛍️",
  },
  {
    status: "confirmed",
    label: "تأیید سفارش",
    icon: "✓",
  },
  {
    status: "paid",
    label: "پرداخت",
    icon: "💳",
  },
  {
    status: "shipped",
    label: "ارسال",
    icon: "🏍️",
  },
  {
    status: "delivered",
    label: "تحویل",
    icon: "📦",
  },
];

const TRACKING_INDEX = {
  pending: 0,
  confirmed: 1,
  paid: 2,
  shipped: 3,
  delivered: 4,
};

export default function OrderDetailPage() {
  const { t, isRTL, locale } = useI18n();
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    if (authLoading || !router.isReady) return;

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function loadOrder() {
      const token = authService.getStoredAccessToken();

      if (!token || !router.query.id) {
        setLoading(false);
        return;
      }

      try {
        setError("");

        const data = await orderService.getOrder(
          token,
          router.query.id
        );

        setOrder(data);
      } catch (err) {
        setError(t("orders.detailFetchError"));
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [
    authLoading,
    isAuthenticated,
    router.isReady,
    router.query.id,
  ]);

  if (authLoading || loading) {
    return (
      <main
        dir={isRTL ? "rtl" : "ltr"}
        className="mx-auto max-w-4xl px-5 py-10"
      >
        <p className="text-[var(--theme-muted)]">
          در حال دریافت جزئیات سفارش...
        </p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main
        dir={isRTL ? "rtl" : "ltr"}
        className="mx-auto max-w-4xl px-5 py-10"
      >
        <div className="rounded-3xl border border-[var(--theme-border)] bg-white p-8 text-center shadow-sm">
          <h1 className="mb-3 text-2xl font-black text-[var(--theme-primary)]">
            جزئیات سفارش
          </h1>

          <p className="mb-6 text-[var(--theme-muted)]">
            برای مشاهده سفارش ابتدا وارد حساب کاربری شوید.
          </p>

          <Link
            href="/login"
            className="inline-block rounded-xl bg-[var(--theme-primary)] px-5 py-3 font-semibold text-white transition hover:bg-[var(--theme-primary-hover)]"
          >
            ورود
          </Link>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main
        dir={isRTL ? "rtl" : "ltr"}
        className="mx-auto max-w-4xl px-5 py-10"
      >
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-semibold text-red-700">
            {error || t("orders.notFound")}
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/orders"
              className="rounded-xl bg-[var(--theme-primary)] px-5 py-3 font-semibold text-white transition hover:bg-[var(--theme-primary-hover)]"
            >
              بازگشت به سفارش‌ها
            </Link>

            <Link
              href="/"
              className="rounded-xl border border-[var(--theme-primary)] px-5 py-3 font-semibold text-[var(--theme-primary)] transition hover:bg-[var(--theme-background)]"
            >
              ادامه خرید
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const statusLabel =
    STATUS_LABELS[order.status] ||
    order.status ||
    t("orders.unknownStatus");

  const items = order.items || [];

  const totalQuantity = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const handlePayment = async () => {
    if (!order || paymentLoading) return;

    try {
      setPaymentLoading(true);
      setPaymentError("");

      const token = authService.getStoredAccessToken();

      if (!token) {
        setPaymentError(
          "برای پرداخت ابتدا وارد حساب کاربری شوید."
        );
        return;
      }

      const payment = await paymentService.createPayment(
        token,
        order.id
      );

      await paymentService.confirmPayment(
        token,
        payment.id
      );

      const data = await orderService.getOrder(
        token,
        order.id
      );

      setOrder(data);
    } catch (err) {
      setPaymentError(
        err?.data?.detail ||
          err?.message ||
          t("orders.paymentFailed")
      );
    } finally {
      setPaymentLoading(false);
    }
  };
  const handleCancel = async () => {
    if (!order || cancelLoading) return;

    const confirmed = window.confirm(
      "آیا از لغو این سفارش مطمئن هستید؟"
    );

    if (!confirmed) return;

    try {
      setCancelLoading(true);
      setCancelError("");

      const token = authService.getStoredAccessToken();

      await orderService.cancelOrder(
        token,
        order.id
      );

      const data = await orderService.getOrder(
        token,
        order.id
      );

      setOrder(data);
    } catch (err) {
      setCancelError(
        err?.message || t("orders.cancelFailed")
      );
    } finally {
      setCancelLoading(false);
    }
  };
  const trackingIndex =
    TRACKING_INDEX[order.status] ?? -1;

  const isCancelled = order.status === "cancelled";

  const progressPercent =
    trackingIndex >= 0
      ? (trackingIndex / (TRACKING_STEPS.length - 1)) * 100
      : 0;

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className="mx-auto max-w-4xl px-5 py-10"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/orders"
          className="text-sm font-semibold text-[var(--theme-secondary)] transition hover:text-[var(--theme-primary)] hover:underline"
        >
          ← بازگشت به سفارش‌ها
        </Link>

        <Link
          href="/"
          className="rounded-xl border border-[var(--theme-border)] px-4 py-2 text-sm font-bold text-[var(--theme-primary)] transition hover:bg-[var(--theme-background)]"
        >
          ادامه خرید
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[var(--theme-border)] bg-white shadow-sm">
        {/* Order Header */}
        <div className="border-b border-[var(--theme-border)] p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--theme-muted)]">
                سفارش ثبت‌شده
              </p>

              <h1 className="mt-1 text-2xl font-black text-[var(--theme-primary)]">
                سفارش #{order.id}
              </h1>

              <p className="mt-2 text-sm text-[var(--theme-muted)]">
                {order.created_at
                  ? new Date(order.created_at).toLocaleString(
                      "fa-IR"
                    )
                  : t("orders.unknownDate")}
              </p>
            </div>

            <span className="w-fit rounded-full bg-[var(--theme-surface-muted)] px-4 py-2 text-sm font-bold text-[var(--theme-secondary)]">
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Order Tracking */}
        <div className="border-b border-[var(--theme-border)] p-6 sm:p-8">
          <div className="mb-7">
            <h2 className="text-lg font-black text-[var(--theme-primary)]">
              پیگیری سفارش
            </h2>

            <p className="mt-1 text-sm text-[var(--theme-muted)]">
              وضعیت سفارش بر اساس آخرین مرحله ثبت‌شده نمایش داده می‌شود.
            </p>
          </div>

          {isCancelled ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-xl">
                  ×
                </span>

                <div>
                  <p className="font-black text-red-700">
                    سفارش لغو شده است
                  </p>

                  <p className="mt-1 text-sm text-red-600">
                    این سفارش در مسیر ارسال قرار نگرفته است.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="relative px-2 sm:px-4">
                <div className="absolute right-6 left-6 top-6 h-1 rounded-full bg-[var(--theme-surface-muted)] sm:right-10 sm:left-10" />

                <div
                  className="absolute right-6 top-6 h-1 rounded-full bg-[var(--theme-secondary)] transition-all duration-700 sm:right-10"
                  style={{
                    width: `calc(${progressPercent}% - ${
                      progressPercent === 100 ? "0px" : "0px"
                    })`,
                  }}
                />

                <div className="relative flex items-start justify-between">
                  {TRACKING_STEPS.map((step, index) => {
                    const completed = index <= trackingIndex;
                    const active = index === trackingIndex;

                    return (
                      <div
                        key={step.status}
                        className="flex w-20 flex-col items-center text-center sm:w-24"
                      >
                        <div
                          className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white text-base shadow-sm transition-all duration-500 ${
                            completed
                              ? "bg-[var(--theme-secondary)] text-white"
                              : "bg-[var(--theme-surface-muted)] text-[var(--theme-muted)]"
                          } ${
                            active
                              ? "ring-4 ring-[#f0e5de]"
                              : ""
                          }`}
                        >
                          {step.icon}
                        </div>

                        <span
                          className={`mt-3 text-xs font-bold leading-5 sm:text-sm ${
                            completed
                              ? "text-[var(--theme-primary)]"
                              : "text-[var(--theme-muted)]"
                          }`}
                        >
                          {t(`orders.${step.labelKey}`)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Rider */}
                <div
                  className="pointer-events-none absolute top-0 z-20 -translate-x-1/2 transition-all duration-1000 ease-out"
                  style={{
                    left: `${100 - progressPercent}%`,
                  }}
                  aria-hidden="true"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-xl shadow-md ${
                      order.status === "delivered"
                        ? "bg-[var(--theme-success)]"
                        : "bg-[var(--theme-secondary)]"
                    }`}
                  >
                    {order.status === "delivered"
                      ? "✓"
                      : "🏍️"}
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-[var(--theme-surface)] px-4 py-3 text-center">
                <span className="text-sm font-semibold text-[var(--theme-muted)]">
                  وضعیت فعلی:{" "}
                </span>

                <span className="text-sm font-black text-[var(--theme-primary)]">
                  {statusLabel}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Shipping Information */}
        <div className="border-b border-[var(--theme-border)] p-6 sm:p-8">
          <h2 className="mb-4 text-lg font-black text-[var(--theme-primary)]">
            اطلاعات ارسال
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-[var(--theme-surface)] p-4">
              <p className="text-xs font-semibold text-[var(--theme-muted)]">
                شماره تماس
              </p>

              <p className="mt-2 font-bold text-[var(--theme-primary)]">
                {order.shipping_phone || t("orders.notProvided")}
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--theme-surface)] p-4">
              <p className="text-xs font-semibold text-[var(--theme-muted)]">
                آدرس ارسال
              </p>

              <p className="mt-2 leading-7 font-bold text-[var(--theme-primary)]">
                {order.shipping_address || t("orders.notProvided")}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="p-6 sm:p-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-black text-[var(--theme-primary)]">
              محصولات سفارش
            </h2>

            <span className="text-sm font-semibold text-[var(--theme-muted)]">
              {totalQuantity.toLocaleString(locale)} کالا
            </span>
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl bg-[var(--theme-surface)] p-6 text-center text-sm text-[var(--theme-muted)]">
              محصولی برای این سفارش ثبت نشده است.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-2xl bg-[var(--theme-surface)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-bold text-[var(--theme-primary)]">
                      {item.product_name}
                    </p>

                    <p className="mt-1 text-sm text-[var(--theme-muted)]">
                      تعداد:{" "}
                      {Number(item.quantity || 0).toLocaleString(
                        "fa-IR"
                      )}
                    </p>

                    <p className="mt-1 text-xs text-[var(--theme-muted)]">
                      قیمت واحد:{" "}
                      {Number(
                        item.unit_price || 0
                      ).toLocaleString(locale)}{" "}
                      تومان
                    </p>
                  </div>

                  <p className="font-black text-[var(--theme-foreground)]">
                    {Number(
                      item.subtotal || 0
                    ).toLocaleString(locale)}{" "}
                    تومان
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div className="mt-6 flex items-center justify-between border-t border-[var(--theme-border)] pt-6">
            <span className="font-semibold text-[var(--theme-muted)]">
              مبلغ کل
            </span>

            <span className="text-2xl font-black text-[var(--theme-primary)]">
              {Number(order.total || 0).toLocaleString(locale)}{" "}
              <span className="text-sm font-medium">
                تومان
              </span>
            </span>
          </div>

          {/* Order Actions */}
          {(order.status === "pending" ||
            order.status === "confirmed") && (
            <div className="mt-6 border-t border-[var(--theme-border)] pt-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  {paymentError && (
                    <p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                      {paymentError}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handlePayment}
                    disabled={paymentLoading || cancelLoading}
                    className="w-full rounded-xl bg-[var(--theme-primary)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--theme-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {paymentLoading
                      ? t("orders.paymentLoading")
                      : t("orders.payment")}
                  </button>
                </div>

                <div>
                  {cancelError && (
                    <p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                      {cancelError}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={cancelLoading || paymentLoading}
                    className="w-full rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {cancelLoading
                      ? t("orders.cancelLoading")
                      : t("orders.cancel")}
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Bottom Actions */}
          <div className="mt-6 flex flex-col gap-3 border-t border-[var(--theme-border)] pt-6 sm:flex-row">
            <Link
              href="/"
              className="flex-1 rounded-xl bg-[var(--theme-primary)] px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-[var(--theme-primary-hover)]"
            >
              ادامه خرید
            </Link>

            <Link
              href="/orders"
              className="flex-1 rounded-xl border border-[var(--theme-border)] px-5 py-3 text-center text-sm font-bold text-[var(--theme-primary)] transition hover:bg-[var(--theme-background)]"
            >
              مشاهده همه سفارش‌ها
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
