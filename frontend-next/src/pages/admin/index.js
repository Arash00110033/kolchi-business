import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import useAuth from "@/hooks/useAuth";
import adminService from "@/services/admin.service";
import authService from "@/services/auth.service";

const STORE_ID = 1;

function getList(data) {
  if (Array.isArray(data)) {
    return data;
  }

  return data?.results || [];
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const [checking, setChecking] = useState(true);
  const [store, setStore] = useState(null);
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    members: 0,
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    let mounted = true;

    async function loadDashboard() {
      try {
        const token = authService.getStoredAccessToken();

        if (!token) {
          router.replace("/login");
          return;
        }

        const [storeData, productsData, ordersData, membersData] =
          await Promise.all([
            adminService.getStore(STORE_ID, token),
            adminService.getProducts(STORE_ID, token),
            adminService.getOrders(STORE_ID, token),
            adminService.getMembers(STORE_ID, token),
          ]);

        if (!mounted) {
          return;
        }

        setStore(storeData);

        setForm({
          name: storeData?.name || "",
          description: storeData?.description || "",
          is_active: Boolean(storeData?.is_active),
        });

        setStats({
          products: getList(productsData).length,
          orders: getList(ordersData).length,
          members: getList(membersData).length,
        });

        setError("");
      } catch (requestError) {
        if (!mounted) {
          return;
        }

        if (requestError?.status === 401) {
          router.replace("/login");
          return;
        }

        if (
          requestError?.status === 403 ||
          requestError?.status === 404
        ) {
          setError("شما دسترسی مدیریت این فروشگاه را ندارید.");
        } else {
          setError("دریافت اطلاعات پنل مدیریت با خطا مواجه شد.");
        }
      } finally {
        if (mounted) {
          setChecking(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [authLoading, isAuthenticated, router]);

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const token = authService.getStoredAccessToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      const updatedStore = await adminService.updateStore(
        STORE_ID,
        form,
        token
      );

      setStore(updatedStore);

      setForm({
        name: updatedStore?.name || "",
        description: updatedStore?.description || "",
        is_active: Boolean(updatedStore?.is_active),
      });

      setSaved(true);
    } catch (requestError) {
      if (requestError?.status === 401) {
        router.replace("/login");
        return;
      }

      if (requestError?.status === 403) {
        setError("شما اجازه ویرایش این فروشگاه را ندارید.");
      } else {
        setError("ذخیره اطلاعات فروشگاه با خطا مواجه شد.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || checking) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#f7f3ee] px-5 py-10"
      >
        <div className="mx-auto max-w-6xl rounded-[28px] border border-[#e7e0d9] bg-white p-8">
          <p className="text-sm font-semibold text-[#5f514a]">
            در حال بارگذاری پنل مدیریت...
          </p>
        </div>
      </main>
    );
  }

  if (error && !store) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#f7f3ee] px-5 py-10"
      >
        <div className="mx-auto max-w-6xl rounded-[28px] border border-[#e7e0d9] bg-white p-8">
          <h1 className="text-2xl font-black text-[#432a22]">
            پنل مدیریت
          </h1>

          <p className="mt-4 text-sm font-semibold text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-6 rounded-xl bg-[#432a22] px-4 py-2 text-sm font-semibold text-white"
          >
            بازگشت به فروشگاه
          </button>
        </div>
      </main>
    );
  }

  const managementCards = [
    {
      title: "محصولات",
      description: "ایجاد، ویرایش، فعال‌سازی و مدیریت موجودی محصولات",
      value: stats.products,
      href: "/admin/products",
      label: "مدیریت محصولات",
    },
    {
      title: "سفارش‌ها",
      description: "مشاهده سفارش‌ها و مدیریت وضعیت سفارش",
      value: stats.orders,
      href: "/admin/orders",
      label: "مدیریت سفارش‌ها",
    },
    {
      title: "اعضا و نقش‌ها",
      description: "مدیریت اعضای فروشگاه و سطح دسترسی آن‌ها",
      value: stats.members,
      href: "/admin/members",
      label: "مدیریت اعضا",
    },
  ];

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#f7f3ee] px-5 py-10"
    >
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 rounded-[28px] border border-[#e7e0d9] bg-white p-7 shadow-[0_10px_35px_rgba(70,45,30,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-sm font-semibold text-[#8a7569]">
                داشبورد مدیریت فروشگاه
              </p>

              <h1 className="mt-1 text-3xl font-black text-[#432a22]">
                {store?.name || "فروشگاه"}
              </h1>

              <p className="mt-2 text-sm text-[#6b5b52]">
                {user?.username || user?.email || "کاربر"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="rounded-xl border border-[#ded3ca] px-4 py-2 text-sm font-semibold text-[#5f514a] transition hover:bg-[#f7f3ee]"
              >
                فروشگاه
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          {managementCards.map((card) => (
            <button
              key={card.href}
              type="button"
              onClick={() => router.push(card.href)}
              className="rounded-[24px] border border-[#e7e0d9] bg-white p-6 text-right shadow-[0_10px_35px_rgba(70,45,30,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(70,45,30,0.09)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-black text-[#432a22]">
                    {card.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#6b5b52]">
                    {card.description}
                  </p>
                </div>

                <span className="text-3xl font-black text-[#a06b45]">
                  {card.value}
                </span>
              </div>

              <p className="mt-5 text-sm font-bold text-[#a06b45]">
                {card.label} ←
              </p>
            </button>
          ))}
        </section>

        <section className="mb-6 rounded-[28px] border border-[#e7e0d9] bg-white p-7 shadow-[0_10px_35px_rgba(70,45,30,0.06)]">
          <div className="mb-6">
            <h2 className="text-xl font-black text-[#432a22]">
              وضعیت فروشگاه
            </h2>

            <p className="mt-1 text-sm text-[#6b5b52]">
              وضعیت فعلی فروشگاه و اطلاعات مدیریتی
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                store?.is_active
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {store?.is_active
                ? "فروشگاه فعال"
                : "فروشگاه غیرفعال"}
            </span>

            <span className="rounded-full bg-[#f7f3ee] px-4 py-2 text-sm font-semibold text-[#5f514a]">
              شناسه فروشگاه: {STORE_ID}
            </span>

            {store?.slug && (
              <span className="rounded-full bg-[#f7f3ee] px-4 py-2 text-sm font-semibold text-[#5f514a]">
                slug: {store.slug}
              </span>
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-[#e7e0d9] bg-white p-7 shadow-[0_10px_35px_rgba(70,45,30,0.06)]">
          <div className="mb-6">
            <h2 className="text-xl font-black text-[#432a22]">
              تنظیمات فروشگاه
            </h2>

            <p className="mt-1 text-sm text-[#6b5b52]">
              اطلاعات اصلی فروشگاه را مدیریت کنید.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="store-name"
                className="mb-2 block text-sm font-semibold text-[#4b3b34]"
              >
                نام فروشگاه
              </label>

              <input
                id="store-name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                required
                maxLength={150}
                className="w-full rounded-xl border border-[#ded3ca] px-4 py-3 text-sm outline-none focus:border-[#a06b45]"
              />
            </div>

            <div>
              <label
                htmlFor="store-description"
                className="mb-2 block text-sm font-semibold text-[#4b3b34]"
              >
                توضیحات
              </label>

              <textarea
                id="store-description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows={5}
                className="w-full resize-y rounded-xl border border-[#ded3ca] px-4 py-3 text-sm outline-none focus:border-[#a06b45]"
              />
            </div>

            <label className="flex items-center gap-3 text-sm font-semibold text-[#4b3b34]">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    is_active: event.target.checked,
                  }))
                }
              />

              فروشگاه فعال باشد
            </label>

            {saved && (
              <p className="text-sm font-semibold text-green-700">
                اطلاعات فروشگاه با موفقیت ذخیره شد.
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#432a22] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5a382d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
