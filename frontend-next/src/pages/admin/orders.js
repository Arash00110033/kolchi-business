import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import useAuth from "@/hooks/useAuth";
import { useI18n } from "@/i18n";
import adminService from "@/services/admin.service";
import authService from "@/services/auth.service";

const STORE_ID = 1;

const STATUS_OPTIONS = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function getOrders(data) {
  if (Array.isArray(data)) {
    return data;
  }

  return data?.results || [];
}

function formatPrice(value) {
  if (value === null || value === undefined) {
    return "-";
  }

  return Number(value).toLocaleString("fa-IR");
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("fa-IR");
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const { t, isRTL } = useI18n();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  const statusLabel = (status) =>
    t(`orderStatus.${status}`) || status;

  async function loadOrders() {
    const token = authService.getStoredAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setError("");

      const data = await adminService.getOrders(
        STORE_ID,
        token
      );

      setOrders(getOrders(data));
    } catch (requestError) {
      if (requestError?.status === 401) {
        router.replace("/login");
        return;
      }

      if (requestError?.status === 403) {
        setError(t("adminOrders.accessDenied"));
      } else {
        setError(t("adminOrders.loadError"));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    loadOrders();
  }, [authLoading, isAuthenticated]);

  async function handleStatusChange(order, newStatus) {
    if (!newStatus || newStatus === order.status) {
      return;
    }

    const token = authService.getStoredAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setSavingId(order.id);
    setError("");

    try {
      const updatedOrder = await adminService.updateOrderStatus(
        STORE_ID,
        order.id,
        newStatus,
        token
      );

      setOrders((current) =>
        current.map((item) =>
          item.id === order.id ? updatedOrder : item
        )
      );

      setSelectedOrder((current) =>
        current?.id === order.id ? updatedOrder : current
      );
    } catch (requestError) {
      if (requestError?.status === 401) {
        router.replace("/login");
        return;
      }

      if (requestError?.status === 400) {
        setError(
          requestError?.data?.detail ||
            t("adminOrders.statusChangeDenied")
        );
      } else if (requestError?.status === 403) {
        setError(t("adminOrders.statusChangeForbidden"));
      } else {
        setError(t("adminOrders.statusChangeError"));
      }
    } finally {
      setSavingId(null);
    }
  }

  if (authLoading || loading) {
    return (
      <main
        dir={isRTL ? "rtl" : "ltr"}
        className="min-h-screen bg-[var(--theme-background)] px-5 py-10"
      >
        <div className="mx-auto max-w-6xl rounded-[28px] border border-[var(--theme-border)] bg-white p-8">
          <p className="text-sm font-semibold text-[var(--theme-muted)]">
            {t("adminOrders.loading")}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-[var(--theme-background)] px-5 py-10"
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 rounded-[28px] border border-[var(--theme-border)] bg-white p-7 shadow-[0_10px_35px_rgba(70,45,30,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[var(--theme-muted)]">
                {t("adminDashboard.dashboard")}
              </p>

              <h1 className="mt-1 text-3xl font-black text-[var(--theme-primary)]">
                {t("adminOrders.title")}
              </h1>
            </div>

            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="rounded-xl border border-[var(--theme-border)] px-4 py-2 text-sm font-semibold text-[var(--theme-muted)] transition hover:bg-[var(--theme-background)]"
            >
              {t("adminOrders.backToManagement")}
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-[28px] border border-[var(--theme-border)] bg-white p-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-black text-[var(--theme-primary)]">
              {t("adminOrders.orders")}
            </h2>

            <span className="text-sm font-semibold text-[var(--theme-muted)]">
              {orders.length} {t("adminOrders.orderCount")}
            </span>
          </div>

          {orders.length === 0 ? (
            <p className="rounded-2xl bg-[var(--theme-background)] p-5 text-sm text-[var(--theme-muted)]">
              {t("adminOrders.empty")}
            </p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-[var(--theme-border)] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedOrder(
                          selectedOrder?.id === order.id
                            ? null
                            : order
                        )
                      }
                      className="text-right"
                    >
                      <p className="font-black text-[var(--theme-primary)]">
                        {t("adminOrders.order")} #{order.id}
                      </p>

                      <p className="mt-1 text-sm text-[var(--theme-muted)]">
                        {t("adminOrders.amount")}:{" "}
                        {formatPrice(order.total)}
                      </p>

                      <p className="mt-1 text-xs text-[var(--theme-muted)]">
                        {formatDate(order.created_at)}
                      </p>
                    </button>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-[var(--theme-background)] px-3 py-2 text-xs font-semibold text-[var(--theme-muted)]">
                        {statusLabel(order.status)}
                      </span>

                      <select
                        value={order.status}
                        disabled={savingId === order.id}
                        onChange={(event) =>
                          handleStatusChange(
                            order,
                            event.target.value
                          )
                        }
                        className="rounded-xl border border-[var(--theme-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--theme-muted)] disabled:opacity-60"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {statusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedOrder?.id === order.id && (
                    <div className="mt-5 border-t border-[var(--theme-border)] pt-5">
                      <div className="grid gap-4 text-sm sm:grid-cols-2">
                        <div>
                          <span className="font-semibold text-[var(--theme-muted)]">
                            {t("adminOrders.user")}:
                          </span>{" "}
                          {order.user}
                        </div>

                        <div>
                          <span className="font-semibold text-[var(--theme-muted)]">
                            {t("adminOrders.phone")}:
                          </span>{" "}
                          {order.shipping_phone || "-"}
                        </div>

                        <div className="sm:col-span-2">
                          <span className="font-semibold text-[var(--theme-muted)]">
                            {t("adminOrders.address")}:
                          </span>{" "}
                          {order.shipping_address || "-"}
                        </div>
                      </div>

                      {order.items?.length > 0 && (
                        <div className="mt-5 space-y-2">
                          <h3 className="font-black text-[var(--theme-primary)]">
                            {t("adminOrders.items")}
                          </h3>

                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex flex-wrap justify-between gap-2 rounded-xl bg-[var(--theme-background)] px-4 py-3 text-sm"
                            >
                              <span>
                                {item.product_name} ×{" "}
                                {item.quantity}
                              </span>

                              <span className="font-semibold">
                                {formatPrice(item.subtotal)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
