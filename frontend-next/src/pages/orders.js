import { useEffect, useState } from "react";
import Link from "next/link";

import useAuth from "@/hooks/useAuth";
import authService from "@/services/auth.service";
import orderService from "@/services/order.service";
import { useI18n } from "@/i18n";

const STATUS_KEYS = {
  pending: "pending",
  confirmed: "confirmed",
  paid: "paid",
  shipped: "shipped",
  delivered: "delivered",
  cancelled: "cancelled",
};

function getStatusLabel(t, status) {
  const key = STATUS_KEYS[status];

  if (key) {
    return t(`orders.status.${key}`);
  }

  return status || t("orders.unknownStatus");
}

function canCancelOrder(status) {
  return status === "pending" || status === "confirmed";
}

export default function OrdersPage() {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const { t, isRTL, locale } = useI18n();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoadingId, setCancelLoadingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setOrders([]);
      setLoading(false);
      return;
    }

    let active = true;

    async function loadOrders() {
      const token = authService.getStoredAccessToken();

      if (!token) {
        if (active) {
          setOrders([]);
          setLoading(false);
        }
        return;
      }

      try {
        setError("");

        const data = await orderService.getOrders(token);

        const normalizedOrders = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : [];

        if (active) {
          setOrders(normalizedOrders);
        }
      } catch (err) {
        if (active) {
          setOrders([]);
          setError(
            err?.data?.detail ||
              err?.message ||
              t("orders.fetchError")
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      active = false;
    };
  }, [authLoading, isAuthenticated, t]);

  async function handleCancel(order) {
    if (
      !order ||
      cancelLoadingId !== null ||
      !canCancelOrder(order.status)
    ) {
      return;
    }

    const confirmed = window.confirm(
      t("orders.cancelConfirm").replace("{id}", order.id)
    );

    if (!confirmed) return;

    const token = authService.getStoredAccessToken();

    if (!token) {
      setError(t("orders.authRequired"));
      return;
    }

    try {
      setCancelLoadingId(order.id);
      setError("");

      const updatedOrder = await orderService.cancelOrder(
        token,
        order.id
      );

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === order.id
            ? {
                ...currentOrder,
                ...(updatedOrder || {}),
                status: updatedOrder?.status || "cancelled",
              }
            : currentOrder
        )
      );
    } catch (err) {
      setError(
        err?.data?.detail ||
          err?.message ||
          t("orders.cancelError")
      );
    } finally {
      setCancelLoadingId(null);
    }
  }

  if (authLoading || loading) {
    return (
      <main
        dir={isRTL ? "rtl" : "ltr"}
        className="mx-auto max-w-5xl px-5 py-10"
      >
        <p className="text-[var(--theme-muted)]">
          {t("orders.loading")}
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
            {t("orders.unauthTitle")}
          </h1>

          <p className="mb-6 text-[var(--theme-muted)]">
            {t("orders.unauthMessage")}
          </p>

          <Link
            href="/login"
            className="inline-block rounded-xl bg-[var(--theme-primary)] px-5 py-3 font-semibold text-white transition hover:bg-[var(--theme-primary-hover)]"
          >
            {t("orders.login")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className="mx-auto max-w-5xl px-5 py-10"
    >
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-[var(--theme-primary)]">
            {t("orders.title")}
          </h1>

          <p className="mt-2 text-sm text-[var(--theme-muted)]">
            {t("orders.count").replace(
              "{count}",
              orders.length.toLocaleString(locale)
            )}
          </p>
        </div>

        <Link
          href="/"
          className="w-fit rounded-xl border border-[var(--theme-border)] px-4 py-2.5 text-sm font-bold text-[var(--theme-primary)] transition hover:bg-[var(--theme-surface)]"
        >
          {t("orders.backToStore")}
        </Link>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-[var(--theme-border)] bg-white p-10 text-center shadow-sm">
          <h2 className="mb-3 text-xl font-bold text-[var(--theme-primary)]">
            {t("orders.emptyTitle")}
          </h2>

          <p className="mb-6 text-[var(--theme-muted)]">
            {t("orders.emptyMessage")}
          </p>

          <Link
            href="/"
            className="inline-block rounded-xl bg-[var(--theme-primary)] px-5 py-3 font-semibold text-white transition hover:bg-[var(--theme-primary-hover)]"
          >
            {t("orders.backToStore")}
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const canCancel = canCancelOrder(order.status);
            const isCancelling = cancelLoadingId === order.id;

            return (
              <article
                key={order.id}
                className="rounded-3xl border border-[var(--theme-border)] bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 border-b border-[var(--theme-border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-black text-[var(--theme-primary)]">
                      {t("orders.order")} #{order.id}
                    </h2>

                    <p className="mt-1 text-sm text-[var(--theme-muted)]">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleString(locale)
                        : t("orders.unknownDate")}
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-[var(--theme-surface-muted)] px-4 py-2 text-sm font-bold text-[var(--theme-primary)]">
                    {getStatusLabel(t, order.status)}
                  </span>
                </div>

                {Array.isArray(order.items) &&
                  order.items.length > 0 && (
                    <div className="mt-5 space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-4 rounded-2xl bg-[var(--theme-surface)] px-4 py-3"
                        >
                          <div>
                            <p className="font-semibold text-[var(--theme-primary)]">
                              {item.product_name || t("orders.product")}
                            </p>

                            <p className="mt-1 text-xs text-[var(--theme-muted)]">
                              {t("orders.quantity")}:{" "}
                              {Number(item.quantity || 0).toLocaleString(locale)}
                            </p>
                          </div>

                          <p className="text-sm font-bold text-[var(--theme-foreground)]">
                            {Number(item.subtotal || 0).toLocaleString(locale)}{" "}
                            {t("orders.currency")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                <div className="mt-5 flex flex-col gap-3 border-t border-[var(--theme-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center justify-between gap-4 sm:justify-start">
                    <span className="font-semibold text-[var(--theme-muted)]">
                      {t("orders.total")}
                    </span>

                    <span className="text-xl font-black text-[var(--theme-primary)]">
                      {Number(order.total || 0).toLocaleString(locale)}{" "}
                      <span className="text-xs font-medium">
                        {t("orders.currency")}
                      </span>
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Link
                      href={`/orders/${order.id}`}
                      className="rounded-xl bg-[var(--theme-primary)] px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-[var(--theme-primary-hover)]"
                    >
                      {t("orders.viewDetails")}
                    </Link>

                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => handleCancel(order)}
                        disabled={isCancelling}
                        className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isCancelling
                          ? t("orders.cancelling")
                          : t("orders.cancel")}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
