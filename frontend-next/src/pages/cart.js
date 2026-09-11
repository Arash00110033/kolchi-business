import { useEffect, useState } from "react";

import Link from "next/link";

import useAuth from "@/hooks/useAuth";
import authService from "@/services/auth.service";
import cartService from "@/services/cart.service";
import orderService from "@/services/order.service";
import paymentService from "@/services/payment.service";

function isValidIranianPhone(phone) {
  return /^(09\d{9}|\+989\d{9})$/.test(phone);
}

export default function CartPage() {
  const { loading: authLoading, isAuthenticated } = useAuth();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdOrder, setCreatedOrder] = useState(null);
  const [createdPayment, setCreatedPayment] = useState(null);

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
      setError("دریافت سبد خرید ناموفق بود.");
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
          "تغییر تعداد ناموفق بود."
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
      setError("حذف محصول ناموفق بود.");
    }
  }

  async function clearCart() {
    const token = authService.getStoredAccessToken();

    try {
      setError("");

      const data = await cartService.clearCart(token);

      setCart(data);
    } catch (err) {
      setError("پاک کردن سبد خرید ناموفق بود.");
    }
  }

  async function checkout() {
    if (checkoutLoading || !cart?.items?.length) {
      return;
    }

    const address = shippingAddress.trim();
    const phone = shippingPhone.trim();

    if (!address) {
      setError("لطفاً آدرس ارسال را وارد کنید.");
      return;
    }

    if (address.length < 10) {
      setError("آدرس ارسال باید حداقل ۱۰ کاراکتر باشد.");
      return;
    }

    if (!phone) {
      setError("لطفاً شماره تماس را وارد کنید.");
      return;
    }

    if (!isValidIranianPhone(phone)) {
      setError(
        "شماره تماس معتبر نیست. نمونه صحیح: 09123456789"
      );
      return;
    }

    const token = authService.getStoredAccessToken();

    if (!token) {
      setError(
        "برای ثبت سفارش ابتدا وارد حساب کاربری شوید."
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

      const payment = await paymentService.createPayment(
        token,
        order.id
      );

      const confirmedPayment =
        await paymentService.confirmPayment(
          token,
          payment.id
        );

      setCreatedOrder({
        ...order,
        status: "paid",
      });

      setCreatedPayment(confirmedPayment);

      setCart({
        ...cart,
        items: [],
        total: 0,
      });

      setShippingAddress("");
      setShippingPhone("");
    } catch (err) {
      setError(
        err?.data?.detail ||
          "ثبت سفارش یا پرداخت ناموفق بود."
      );
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <main
        dir="rtl"
        className="mx-auto max-w-5xl px-5 py-10"
      >
        <p className="text-[#6b5b52]">
          در حال دریافت سبد خرید...
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
            سبد خرید
          </h1>

          <p className="mb-6 text-[#6b5b52]">
            برای مشاهده سبد خرید ابتدا وارد حساب کاربری شوید.
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

  if (createdOrder && createdPayment) {
    return (
      <main
        dir="rtl"
        className="mx-auto max-w-3xl px-5 py-10"
      >
        <div className="rounded-3xl border border-green-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
            ✓
          </div>

          <h1 className="text-3xl font-black text-[#432a22]">
            پرداخت با موفقیت انجام شد
          </h1>

          <p className="mt-3 text-[#75665d]">
            سفارش شما با موفقیت ثبت و پرداخت شد.
          </p>

          <div className="mt-8 space-y-3 rounded-2xl bg-[#faf8f5] p-5 text-right">
            <div className="flex justify-between gap-4">
              <span className="text-[#75665d]">
                شماره سفارش
              </span>

              <strong className="text-[#432a22]">
                #{createdOrder.id}
              </strong>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-[#75665d]">
                مبلغ سفارش
              </span>

              <strong className="text-[#432a22]">
                {Number(createdOrder.total || 0).toLocaleString(
                  "fa-IR"
                )}{" "}
                تومان
              </strong>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-[#75665d]">
                وضعیت سفارش
              </span>

              <strong className="text-green-700">
                پرداخت شده
              </strong>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-[#75665d]">
                شماره پرداخت
              </span>

              <strong className="text-[#432a22]">
                #{createdPayment.id}
              </strong>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-[#75665d]">
                شناسه تراکنش
              </span>

              <strong className="break-all text-xs text-[#432a22]">
                {createdPayment.transaction_id}
              </strong>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/orders/${createdOrder.id}`}
              className="flex-1 rounded-xl bg-[#432a22] px-5 py-3 font-bold text-white transition hover:bg-[#5a382d]"
            >
              مشاهده سفارش
            </Link>

            <Link
              href="/"
              className="flex-1 rounded-xl border border-[#ded3ca] px-5 py-3 font-bold text-[#432a22] transition hover:bg-[#f7f3ee]"
            >
              بازگشت به فروشگاه
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const items = cart?.items || [];

  return (
    <main
      dir="rtl"
      className="mx-auto max-w-5xl px-5 py-10"
    >
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#432a22]">
            سبد خرید
          </h1>

          <p className="mt-2 text-sm text-[#75665d]">
            {items.length} محصول در سبد خرید
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="rounded-xl border border-[#ded3ca] px-4 py-2 text-sm font-semibold text-[#6b5b52] transition hover:bg-[#f7f3ee]"
          >
            پاک کردن سبد
          </button>
        )}
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-3xl border border-[#e7e0d9] bg-white p-10 text-center shadow-sm">
          <h2 className="mb-3 text-xl font-bold text-[#432a22]">
            سبد خرید خالی است
          </h2>

          <p className="mb-6 text-[#75665d]">
            هنوز محصولی به سبد خرید اضافه نکرده‌اید.
          </p>

          <Link
            href="/"
            className="inline-block rounded-xl bg-[#432a22] px-5 py-3 font-semibold text-white"
          >
            بازگشت به فروشگاه
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl border border-[#e7e0d9] bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-bold text-[#432a22]">
                      {item.product_name}
                    </h2>

                    <p className="mt-2 text-sm text-[#75665d]">
                      قیمت واحد:{" "}
                      {Number(item.unit_price).toLocaleString(
                        "fa-IR"
                      )}{" "}
                      تومان
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#432a22]">
                      جمع:{" "}
                      {Number(item.subtotal).toLocaleString(
                        "fa-IR"
                      )}{" "}
                      تومان
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
                      className="h-9 w-9 rounded-lg border border-[#ded3ca] disabled:opacity-40"
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
                      className="h-9 w-9 rounded-lg border border-[#ded3ca]"
                    >
                      +
                    </button>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="mr-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-3xl border border-[#e7e0d9] bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-black text-[#432a22]">
              اطلاعات ارسال
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="shipping-phone"
                  className="mb-2 block text-sm font-semibold text-[#6b5b52]"
                >
                  شماره تماس
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
                  className="w-full rounded-xl border border-[#ded3ca] bg-[#faf8f5] px-4 py-3 text-sm outline-none transition focus:border-[#8d6855]"
                />
              </div>

              <div>
                <label
                  htmlFor="shipping-address"
                  className="mb-2 block text-sm font-semibold text-[#6b5b52]"
                >
                  آدرس ارسال
                </label>

                <textarea
                  id="shipping-address"
                  value={shippingAddress}
                  onChange={(event) =>
                    setShippingAddress(event.target.value)
                  }
                  placeholder="آدرس کامل محل تحویل"
                  rows={4}
                  className="w-full resize-none rounded-xl border border-[#ded3ca] bg-[#faf8f5] px-4 py-3 text-sm outline-none transition focus:border-[#8d6855]"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[#eee7e1] pt-5">
              <span className="font-semibold text-[#6b5b52]">
                مجموع
              </span>

              <span className="text-xl font-black text-[#432a22]">
                {Number(cart?.total || 0).toLocaleString(
                  "fa-IR"
                )}{" "}
                <span className="text-xs font-medium">
                  تومان
                </span>
              </span>
            </div>

            <button
              type="button"
              onClick={checkout}
              disabled={checkoutLoading}
              className="mt-6 w-full rounded-xl bg-[#432a22] px-4 py-3 font-bold text-white transition hover:bg-[#5a382d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {checkoutLoading
                ? "در حال پردازش پرداخت..."
                : "ثبت سفارش و پرداخت"}
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}
