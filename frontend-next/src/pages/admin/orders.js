import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import useAuth from "@/hooks/useAuth";
import adminService from "@/services/admin.service";
import authService from "@/services/auth.service";

const STORE_ID = 1;

const STATUS_LABELS = {
  pending: "در انتظار",
  paid: "پرداخت شده",
  processing: "در حال پردازش",
  shipped: "ارسال شده",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
};

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

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

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
        setError("شما اجازه مشاهده سفارش‌های این فروشگاه را ندارید.");
      } else {
        setError("دریافت سفارش‌ها با خطا مواجه شد.");
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
            "تغییر وضعیت سفارش مجاز نیست."
        );
      } else if (requestError?.status === 403) {
        setError("شما اجازه تغییر وضعیت سفارش را ندارید.");
      } else {
        setError("تغییر وضعیت سفارش با خطا مواجه شد.");
      }
    } finally {
      setSavingId(null);
    }
  }

  if (authLoading || loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#f7f3ee] px-5 py-10"
      >
        <div className="mx-auto max-w-6xl rounded-[28px] border border-[#e7e0d9] bg-white p-8">
          <p className="text-sm font-semibold text-[#5f514a]">
            در حال دریافت سفارش‌ها...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#f7f3ee] px-5 py-10"
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 rounded-[28px] border border-[#e7e0d9] bg-white p-7 shadow-[0_10px_35px_rgba(70,45,30,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#8a7569]">
                پنل مدیریت
              </p>

              <h1 className="mt-1 text-3xl font-black text-[#432a22]">
                مدیریت سفارش‌ها
              </h1>
            </div>

            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="rounded-xl border border-[#ded3ca] px-4 py-2 text-sm font-semibold text-[#5f514a] transition hover:bg-[#f7f3ee]"
            >
              بازگشت به مدیریت
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-[28px] border border-[#e7e0d9] bg-white p-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-black text-[#432a22]">
              سفارش‌ها
            </h2>

            <span className="text-sm font-semibold text-[#8a7569]">
              {orders.length} سفارش
            </span>
          </div>

          {orders.length === 0 ? (
            <p className="rounded-2xl bg-[#f7f3ee] p-5 text-sm text-[#6b5b52]">
              سفارشی برای این فروشگاه ثبت نشده است.
            </p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-[#eee7e1] p-5"
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
                      <p className="font-black text-[#432a22]">
                        سفارش #{order.id}
                      </p>

                      <p className="mt-1 text-sm text-[#6b5b52]">
                        مبلغ: {formatPrice(order.total)}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7569]">
                        {formatDate(order.created_at)}
                      </p>
                    </button>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-[#f7f3ee] px-3 py-2 text-xs font-semibold text-[#5f514a]">
                        {STATUS_LABELS[order.status] ||
                          order.status}
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
                        className="rounded-xl border border-[#ded3ca] bg-white px-3 py-2 text-sm font-semibold text-[#5f514a] disabled:opacity-60"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedOrder?.id === order.id && (
                    <div className="mt-5 border-t border-[#eee7e1] pt-5">
                      <div className="grid gap-4 text-sm sm:grid-cols-2">
                        <div>
                          <span className="font-semibold text-[#8a7569]">
                            کاربر:
                          </span>{" "}
                          {order.user}
                        </div>

                        <div>
                          <span className="font-semibold text-[#8a7569]">
                            تلفن:
                          </span>{" "}
                          {order.shipping_phone || "-"}
                        </div>

                        <div className="sm:col-span-2">
                          <span className="font-semibold text-[#8a7569]">
                            آدرس:
                          </span>{" "}
                          {order.shipping_address || "-"}
                        </div>
                      </div>

                      {order.items?.length > 0 && (
                        <div className="mt-5 space-y-2">
                          <h3 className="font-black text-[#432a22]">
                            اقلام سفارش
                          </h3>

                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex flex-wrap justify-between gap-2 rounded-xl bg-[#f7f3ee] px-4 py-3 text-sm"
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
