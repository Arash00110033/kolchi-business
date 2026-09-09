import { useEffect, useState } from "react";
import Link from "next/link";

import useAuth from "@/hooks/useAuth";
import authService from "@/services/auth.service";
import orderService from "@/services/order.service";

const STATUS_LABELS = {
  pending: "در انتظار بررسی",
  confirmed: "تأیید شده",
  paid: "پرداخت شده",
  shipped: "ارسال شده",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
};

export default function OrdersPage() {
  const { loading: authLoading, isAuthenticated } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function loadOrders() {
      const token = authService.getStoredAccessToken();

      if (!token) {
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        setError("");

        const data = await orderService.getOrders(token);

        setOrders(
          Array.isArray(data)
            ? data
            : data?.results || []
        );
      } catch (err) {
        setError("دریافت سفارش‌ها ناموفق بود.");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [authLoading, isAuthenticated]);

  if (authLoading || loading) {
    return (
      <main
        dir="rtl"
        className="mx-auto max-w-5xl px-5 py-10"
      >
        <p className="text-[#6b5b52]">
          در حال دریافت سفارش‌ها...
        </p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main
        dir="rtl"
        className="mx-auto max-w-5xl px-5 py-10"
      >
        <div className="rounded-3xl border border-[#e7e0d9] bg-white p-8 text-center shadow-sm">
          <h1 className="mb-3 text-2xl font-black text-[#432a22]">
            سفارش‌های من
          </h1>

          <p className="mb-6 text-[#6b5b52]">
            برای مشاهده سفارش‌ها ابتدا وارد حساب کاربری شوید.
          </p>

          <Link
            href="/login"
            className="inline-block rounded-xl bg-[#432a22] px-5 py-3 font-semibold text-white"
          >
            ورود
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="mx-auto max-w-5xl px-5 py-10"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#432a22]">
          سفارش‌های من
        </h1>

        <p className="mt-2 text-sm text-[#75665d]">
          {orders.length} سفارش ثبت شده
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-[#e7e0d9] bg-white p-10 text-center shadow-sm">
          <h2 className="mb-3 text-xl font-bold text-[#432a22]">
            هنوز سفارشی ثبت نکرده‌اید
          </h2>

          <p className="mb-6 text-[#75665d]">
            محصولات مورد علاقه‌تان را انتخاب کنید و اولین سفارش خود را ثبت کنید.
          </p>

          <Link
            href="/"
            className="inline-block rounded-xl bg-[#432a22] px-5 py-3 font-semibold text-white"
          >
            بازگشت به فروشگاه
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-3xl border border-[#e7e0d9] bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 border-b border-[#eee7e1] pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-black text-[#432a22]">
                    سفارش #{order.id}
                  </h2>

                  <p className="mt-1 text-sm text-[#8a7b72]">
                    {order.created_at
                      ? new Date(order.created_at).toLocaleString(
                          "fa-IR"
                        )
                      : "تاریخ نامشخص"}
                  </p>
                </div>

                <span className="w-fit rounded-full bg-[#f4ebe4] px-4 py-2 text-sm font-bold text-[#704b3a]">
                  {STATUS_LABELS[order.status] ||
                    order.status ||
                    "نامشخص"}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {(order.items || []).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-[#faf8f5] px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-[#432a22]">
                        {item.product_name}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7b72]">
                        تعداد: {item.quantity}
                      </p>
                    </div>

                    <p className="text-sm font-bold text-[#5f4539]">
                      {Number(item.subtotal || 0).toLocaleString(
                        "fa-IR"
                      )}{" "}
                      تومان
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-4 border-t border-[#eee7e1] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center justify-between gap-4 sm:justify-start">
                  <span className="font-semibold text-[#6b5b52]">
                    مبلغ کل
                  </span>

                  <span className="text-xl font-black text-[#432a22]">
                    {Number(order.total || 0).toLocaleString(
                      "fa-IR"
                    )}{" "}
                    <span className="text-xs font-medium">
                      تومان
                    </span>
                  </span>
                </div>

                <Link
                  href={`/orders/${order.id}`}
                  className="rounded-xl bg-[#432a22] px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-[#5a382d]"
                >
                  مشاهده جزئیات
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
