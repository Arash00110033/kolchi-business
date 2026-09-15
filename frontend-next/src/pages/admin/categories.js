import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import useAuth from "@/hooks/useAuth";
import adminService from "@/services/admin.service";
import authService from "@/services/auth.service";

const STORE_ID = 1;

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  is_active: true,
};

function normalizeList(data) {
  if (Array.isArray(data)) {
    return data;
  }

  return data?.results || [];
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAuth();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadCategories() {
    const token = authService.getStoredAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setError("");

      const response = await adminService.getCategories(
        STORE_ID,
        token
      );

      setCategories(normalizeList(response));
    } catch (requestError) {
      if (requestError?.status === 401) {
        router.replace("/login");
        return;
      }

      if (requestError?.status === 403) {
        setError(
          "شما اجازه مدیریت دسته‌بندی‌های این فروشگاه را ندارید."
        );
      } else {
        setError("دریافت دسته‌بندی‌ها با خطا مواجه شد.");
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

    loadCategories();
  }, [authLoading, isAuthenticated]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  function startEdit(category) {
    setEditingId(category.id);

    setForm({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      is_active: Boolean(category.is_active),
    });

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const token = authService.getStoredAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    if (!form.name.trim() || !form.slug.trim()) {
      setError("نام و شناسه دسته‌بندی الزامی است.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      is_active: Boolean(form.is_active),
    };

    try {
      if (editingId) {
        await adminService.updateCategory(
          STORE_ID,
          editingId,
          payload,
          token
        );
      } else {
        await adminService.createCategory(
          STORE_ID,
          payload,
          token
        );
      }

      startCreate();
      await loadCategories();
    } catch (requestError) {
      if (requestError?.status === 401) {
        router.replace("/login");
        return;
      }

      if (requestError?.status === 403) {
        setError("شما اجازه انجام این عملیات را ندارید.");
      } else if (requestError?.status === 400) {
        const data = requestError?.data;

        setError(
          data?.detail ||
            data?.name?.[0] ||
            data?.slug?.[0] ||
            "اطلاعات دسته‌بندی معتبر نیست."
        );
      } else {
        setError("ذخیره دسته‌بندی با خطا مواجه شد.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category) {
    const token = authService.getStoredAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    const confirmed = window.confirm(
      `آیا از حذف دسته‌بندی «${category.name}» مطمئن هستید؟`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await adminService.deleteCategory(
        STORE_ID,
        category.id,
        token
      );

      if (editingId === category.id) {
        startCreate();
      }

      await loadCategories();
    } catch (requestError) {
      if (requestError?.status === 401) {
        router.replace("/login");
        return;
      }

      if (requestError?.status === 403) {
        setError("شما اجازه حذف دسته‌بندی را ندارید.");
      } else if (requestError?.status === 400) {
        setError(
          requestError?.data?.detail ||
            "حذف دسته‌بندی امکان‌پذیر نیست."
        );
      } else {
        setError("حذف دسته‌بندی با خطا مواجه شد.");
      }
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[var(--theme-background)] px-4 py-8 sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-[1400px]">

        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-5 text-sm font-bold text-[var(--theme-muted)] transition hover:text-[var(--theme-foreground)]"
          >
            ← برگشت
          </button>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold tracking-widest text-[var(--theme-muted)]">
                ADMIN / CATALOG
              </p>

              <h1 className="text-3xl font-black text-[var(--theme-foreground)]">
                مدیریت دسته‌بندی‌ها
              </h1>

              <p className="mt-2 text-sm text-[var(--theme-muted)]">
                ساخت، ویرایش و مدیریت دسته‌بندی‌های فروشگاه
              </p>
            </div>

            <button
              type="button"
              onClick={startCreate}
              className="rounded-2xl bg-[var(--theme-foreground)] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
            >
              + دسته‌بندی جدید
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">

          <section className="rounded-[28px] border border-[var(--theme-border)] bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-black">
                دسته‌بندی‌ها
              </h2>

              <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-bold">
                {categories.length} مورد
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-sm text-[var(--theme-muted)]">
                در حال دریافت اطلاعات...
              </div>
            ) : categories.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--theme-border)] py-16 text-center">
                <p className="font-bold">
                  هنوز دسته‌بندی‌ای ایجاد نشده است.
                </p>

                <button
                  type="button"
                  onClick={startCreate}
                  className="mt-3 text-sm font-bold underline"
                >
                  ایجاد اولین دسته‌بندی
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 transition ${
                      editingId === category.id
                        ? "border-black/20 bg-black/[0.025]"
                        : "border-[var(--theme-border)]"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black">
                          {category.name}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            category.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {category.is_active
                            ? "فعال"
                            : "غیرفعال"}
                        </span>
                      </div>

                      <p
                        dir="ltr"
                        className="mt-1 text-xs text-[var(--theme-muted)]"
                      >
                        /{category.slug}
                      </p>

                      {category.description && (
                        <p className="mt-2 text-sm text-[var(--theme-muted)]">
                          {category.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(category)}
                        className="rounded-xl border border-[var(--theme-border)] px-4 py-2 text-xs font-bold transition hover:bg-black/5"
                      >
                        ویرایش
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(category)}
                        className="rounded-xl border border-red-100 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-5">

            <section className="rounded-[28px] border border-[var(--theme-border)] bg-white p-6 shadow-sm">
              <div className="mb-5">
                <p className="text-xs font-bold text-[var(--theme-muted)]">
                  {editingId
                    ? "EDIT CATEGORY"
                    : "NEW CATEGORY"}
                </p>

                <h2 className="mt-1 text-xl font-black">
                  {editingId
                    ? "ویرایش دسته‌بندی"
                    : "دسته‌بندی جدید"}
                </h2>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <label className="block">
                  <span className="mb-2 block text-sm font-bold">
                    نام دسته‌بندی
                  </span>

                  <input
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    className="w-full rounded-2xl border border-[var(--theme-border)] px-4 py-3 outline-none transition focus:border-black/30"
                    placeholder="مثلاً ماگ"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold">
                    شناسه انگلیسی
                  </span>

                  <input
                    dir="ltr"
                    value={form.slug}
                    onChange={(event) =>
                      updateField("slug", event.target.value)
                    }
                    className="w-full rounded-2xl border border-[var(--theme-border)] px-4 py-3 text-left outline-none transition focus:border-black/30"
                    placeholder="mugs"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold">
                    توضیحات
                  </span>

                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateField(
                        "description",
                        event.target.value
                      )
                    }
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-[var(--theme-border)] px-4 py-3 outline-none transition focus:border-black/30"
                    placeholder="توضیح کوتاه درباره دسته‌بندی"
                  />
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-black/[0.025] p-4">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(event) =>
                      updateField(
                        "is_active",
                        event.target.checked
                      )
                    }
                    className="h-4 w-4"
                  />

                  <span className="text-sm font-bold">
                    دسته‌بندی فعال باشد
                  </span>
                </label>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-2xl bg-[var(--theme-foreground)] px-5 py-3 text-sm font-bold text-white transition disabled:opacity-50"
                  >
                    {saving
                      ? "در حال ذخیره..."
                      : editingId
                        ? "ذخیره تغییرات"
                        : "ایجاد دسته‌بندی"}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      onClick={startCreate}
                      className="rounded-2xl border border-[var(--theme-border)] px-4 py-3 text-sm font-bold"
                    >
                      انصراف
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="overflow-hidden rounded-[28px] border border-[var(--theme-border)] bg-white shadow-sm">
              <div className="border-b border-[var(--theme-border)] px-6 py-4">
                <p className="text-xs font-bold text-[var(--theme-muted)]">
                  LIVE PREVIEW
                </p>
              </div>

              <div className="p-6">
                <div className="rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-background)] p-5">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      form.is_active
                        ? "bg-white"
                        : "bg-black/5 text-[var(--theme-muted)]"
                    }`}
                  >
                    {form.is_active
                      ? "دسته‌بندی فعال"
                      : "غیرفعال"}
                  </span>

                  <h3 className="mt-4 text-xl font-black">
                    {form.name || "نام دسته‌بندی"}
                  </h3>

                  <p
                    dir="ltr"
                    className="mt-1 text-xs text-[var(--theme-muted)]"
                  >
                    /{form.slug || "category-slug"}
                  </p>

                  <p className="mt-3 text-sm leading-7 text-[var(--theme-muted)]">
                    {form.description ||
                      "پیش‌نمایش توضیحات دسته‌بندی در لحظه نمایش داده می‌شود."}
                  </p>
                </div>
              </div>
            </section>

          </aside>
        </div>
      </div>
    </main>
  );
}