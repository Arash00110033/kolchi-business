import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import useAuth from "@/hooks/useAuth";
import adminService from "@/services/admin.service";
import authService from "@/services/auth.service";

const STORE_ID = 1;

function getInventory(data) {
  if (Array.isArray(data)) {
    return data;
  }

  return data?.results || [];
}

export default function AdminInventoryPage() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [transactionType, setTransactionType] =
    useState("restock");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadInventory() {
    const token = authService.getStoredAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setError("");

      const data = await adminService.getInventory(
        STORE_ID,
        token
      );

      setItems(getInventory(data));
    } catch (requestError) {
      if (requestError?.status === 401) {
        router.replace("/login");
        return;
      }

      if (
        requestError?.status === 403 ||
        requestError?.status === 404
      ) {
        setError(
          "شما اجازه مشاهده موجودی این فروشگاه را ندارید."
        );
      } else {
        setError("دریافت موجودی با خطا مواجه شد.");
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

    loadInventory();
  }, [authLoading, isAuthenticated]);

  function startAdjust(product) {
    setSelectedProduct(product);
    setQuantity("");
    setTransactionType("restock");
    setNote("");
    setError("");
  }

  function closeAdjust() {
    if (saving) {
      return;
    }

    setSelectedProduct(null);
    setQuantity("");
    setNote("");
  }

  async function handleAdjust(event) {
    event.preventDefault();

    const token = authService.getStoredAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    const parsedQuantity = Number(quantity);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity === 0) {
      setError("مقدار تغییر موجودی باید یک عدد صحیح غیرصفر باشد.");
      return;
    }

    if (
      transactionType === "restock" &&
      parsedQuantity < 0
    ) {
      setError("برای شارژ موجودی مقدار باید مثبت باشد.");
      return;
    }

    if (
      transactionType === "return" &&
      parsedQuantity < 0
    ) {
      setError("برای برگشت موجودی مقدار باید مثبت باشد.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await adminService.adjustInventory(
        STORE_ID,
        selectedProduct.product_id,
        {
          quantity: parsedQuantity,
          transaction_type: transactionType,
          note: note.trim(),
        },
        token
      );

      closeAdjust();
      await loadInventory();
    } catch (requestError) {
      if (requestError?.status === 401) {
        router.replace("/login");
        return;
      }

      if (requestError?.status === 403) {
        setError(
          "شما اجازه تغییر موجودی این فروشگاه را ندارید."
        );
      } else if (requestError?.status === 400) {
        setError(
          requestError?.data?.detail ||
            "تغییر موجودی معتبر نیست."
        );
      } else {
        setError("تغییر موجودی با خطا مواجه شد.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[var(--theme-background)] px-5 py-10"
      >
        <div className="mx-auto max-w-6xl rounded-[28px] border border-[var(--theme-border)] bg-white p-8">
          <p className="text-sm font-semibold text-[var(--theme-muted)]">
            در حال دریافت موجودی...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[var(--theme-background)] px-5 py-10"
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 rounded-[28px] border border-[var(--theme-border)] bg-white p-7 shadow-[0_10px_35px_rgba(70,45,30,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[var(--theme-muted)]">
                پنل مدیریت
              </p>

              <h1 className="mt-1 text-3xl font-black text-[var(--theme-primary)]">
                مدیریت موجودی
              </h1>

              <p className="mt-2 text-sm text-[var(--theme-muted)]">
                موجودی از طریق تراکنش‌های انبار مدیریت می‌شود.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="rounded-xl border border-[var(--theme-border)] px-4 py-2 text-sm font-semibold text-[var(--theme-muted)] transition hover:bg-[var(--theme-background)]"
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

        <section className="rounded-[28px] border border-[var(--theme-border)] bg-white p-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-black text-[var(--theme-primary)]">
              موجودی محصولات
            </h2>

            <span className="text-sm font-semibold text-[var(--theme-muted)]">
              {items.length} محصول
            </span>
          </div>

          {items.length === 0 ? (
            <p className="rounded-2xl bg-[var(--theme-background)] p-5 text-sm text-[var(--theme-muted)]">
              موجودی‌ای ثبت نشده است.
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-2xl border border-[var(--theme-border)] p-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <h3 className="font-black text-[var(--theme-primary)]">
                      {item.product_name}
                    </h3>

                    <p className="mt-2 text-sm text-[var(--theme-muted)]">
                      موجودی فعلی:{" "}
                      <span className="font-black text-[var(--theme-primary)]">
                        {item.quantity}
                      </span>
                    </p>

                    <p className="mt-1 text-xs text-[var(--theme-muted)]">
                      شناسه محصول: {item.product_id}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => startAdjust(item)}
                    className="rounded-xl bg-[var(--theme-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--theme-primary-hover)]"
                  >
                    تغییر موجودی
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {selectedProduct && (
          <section className="mt-6 rounded-[28px] border border-[var(--theme-border)] bg-white p-7">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-[var(--theme-primary)]">
                  تغییر موجودی
                </h2>

                <p className="mt-1 text-sm text-[var(--theme-muted)]">
                  {selectedProduct.product_name}
                </p>
              </div>

              <button
                type="button"
                onClick={closeAdjust}
                disabled={saving}
                className="rounded-xl border border-[var(--theme-border)] px-4 py-2 text-sm font-semibold text-[var(--theme-muted)]"
              >
                انصراف
              </button>
            </div>

            <form
              onSubmit={handleAdjust}
              className="grid gap-4 sm:grid-cols-2"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--theme-foreground)]">
                  نوع تراکنش
                </label>

                <select
                  value={transactionType}
                  onChange={(event) =>
                    setTransactionType(event.target.value)
                  }
                  className="w-full rounded-xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--theme-secondary)]"
                >
                  <option value="restock">
                    شارژ موجودی
                  </option>
                  <option value="return">
                    برگشت موجودی
                  </option>
                  <option value="adjustment">
                    اصلاح موجودی
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--theme-foreground)]">
                  مقدار
                </label>

                <input
                  type="number"
                  step="1"
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(event.target.value)
                  }
                  placeholder={
                    transactionType === "adjustment"
                      ? "مثلاً 5 یا -3"
                      : "مثلاً 5"
                  }
                  required
                  className="w-full rounded-xl border border-[var(--theme-border)] px-4 py-3 text-sm outline-none focus:border-[var(--theme-secondary)]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-[var(--theme-foreground)]">
                  توضیحات
                </label>

                <textarea
                  value={note}
                  onChange={(event) =>
                    setNote(event.target.value)
                  }
                  rows={3}
                  placeholder="دلیل تغییر موجودی"
                  className="w-full resize-y rounded-xl border border-[var(--theme-border)] px-4 py-3 text-sm outline-none focus:border-[var(--theme-secondary)]"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[var(--theme-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--theme-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "در حال ثبت..."
                    : "ثبت تغییر موجودی"}
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}
