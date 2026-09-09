import { useEffect, useState } from "react";
import { useRouter } from "next/router";
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

export default function OrderDetailPage() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        setError("دریافت جزئیات سفارش ناموفق بود.");
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
        dir="rtl"
        className="mx-auto max-w-4xl px-5 py-10"
      >
        <p className="text-[#6b5b52]">
          در حال دریافت جزئیات سفارش...
        </p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main
        dir="rtl"
        className="mx-auto max-w-4xl px-5 py-10"
      >
        <div className="rounded-3xl border border-[#e7e0d9] bg-white p-8 text-center shadow-sm">
          <h1 className="mb-3 text-2xl font-black text-[#432a22]">
            جزئیات سفارش
          </h1>

          <p className="mb-6 text-[#6b5b52]">
            برای مشاهده سفارش ابتدا وارد حساب کاربری شوید.
          </p>

          <Link
            href="/login"
            className="inline-block rounded-xl bg-[#432a22] px-5 py-3 font-semibold text-white transition hover:bg-[#5a382d]"
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
        dir="rtl"
        className="mx-auto max-w-4xl px-5 py-10"
      >
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-semibold text-red-700">
            {error || "سفارش پیدا نشد."}
          </p>

          <Link
            href="/orders"
            className="mt-5 inline-block rounded-xl bg-[#432a22] px-5 py-3 font-semibold text-white transition hover:bg-[#5a382d]"
          >
            بازگشت به سفارش‌ها
          </Link>
        </div>
      </main>
    );
  }

  const statusLabel =
    STATUS_LABELS[order.status] ||
    order.status ||
    "نامشخص";

  const items = order.items || [];

  const totalQuantity = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  return (
    <main
      dir="rtl"
      className="mx-auto max-w-4xl px-5 py-10"
    >
      <div className="mb-6">
        <Link
          href="/orders"
          className="text-sm font-semibold text-[#704b3a] transition hover:text-[#432a22] hover:underline"
        >
          ← بازگشت به سفارش‌ها
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[#e7e0d9] bg-white shadow-sm">
        {/* Order Header */}
        <div className="border-b border-[#eee7e1] p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#8a7b72]">
                سفارش ثبت‌شده
              </p>

              <h1 className="mt-1 text-2xl font-black text-[#432a22]">
                سفارش #{order.id}
              </h1>

              <p className="mt-2 text-sm text-[#8a7b72]">
                {order.created_at
                  ? new Date(order.created_at).toLocaleString(
                      "fa-IR"
                    )
                  : "تاریخ نامشخص"}
              </p>
            </div>

            <span className="w-fit rounded-full bg-[#f4ebe4] px-4 py-2 text-sm font-bold text-[#704b3a]">
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="border-b border-[#eee7e1] p-6 sm:p-8">
          <h2 className="mb-4 text-lg font-black text-[#432a22]">
            اطلاعات ارسال
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#faf8f5] p-4">
              <p className="text-xs font-semibold text-[#8a7b72]">
                شماره تماس
              </p>

              <p className="mt-2 font-bold text-[#432a22]">
                {order.shipping_phone || "ثبت نشده"}
              </p>
            </div>

            <div className="rounded-2xl bg-[#faf8f5] p-4">
              <p className="text-xs font-semibold text-[#8a7b72]">
                آدرس ارسال
              </p>

              <p className="mt-2 leading-7 font-bold text-[#432a22]">
                {order.shipping_address || "ثبت نشده"}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="p-6 sm:p-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-black text-[#432a22]">
              محصولات سفارش
            </h2>

            <span className="text-sm font-semibold text-[#8a7b72]">
              {totalQuantity.toLocaleString("fa-IR")} کالا
            </span>
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl bg-[#faf8f5] p-6 text-center text-sm text-[#8a7b72]">
              محصولی برای این سفارش ثبت نشده است.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-2xl bg-[#faf8f5] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-bold text-[#432a22]">
                      {item.product_name}
                    </p>

                    <p className="mt-1 text-sm text-[#8a7b72]">
                      تعداد:{" "}
                      {Number(item.quantity || 0).toLocaleString(
                        "fa-IR"
                      )}
                    </p>

                    <p className="mt-1 text-xs text-[#9a8d85]">
                      قیمت واحد:{" "}
                      {Number(
                        item.unit_price || 0
                      ).toLocaleString("fa-IR")}{" "}
                      تومان
                    </p>
                  </div>

                  <p className="font-black text-[#5f4539]">
                    {Number(
                      item.subtotal || 0
                    ).toLocaleString("fa-IR")}{" "}
                    تومان
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div className="mt-6 flex items-center justify-between border-t border-[#eee7e1] pt-6">
            <span className="font-semibold text-[#6b5b52]">
              مبلغ کل
            </span>

            <span className="text-2xl font-black text-[#432a22]">
              {Number(order.total || 0).toLocaleString("fa-IR")}{" "}
              <span className="text-sm font-medium">
                تومان
              </span>
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}