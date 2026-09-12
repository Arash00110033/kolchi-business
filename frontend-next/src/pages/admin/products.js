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
  price: "",
  stock: "",
  category: "",
  is_active: true,
};

function getProducts(data) {
  if (Array.isArray(data)) {
    return data;
  }

  return data?.results || [];
}

export default function AdminProductsPage() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    const token = authService.getStoredAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setError("");

      const [productsResponse, categoriesResponse] =
        await Promise.all([
          adminService.getProducts(STORE_ID, token),
          adminService.getCategories(STORE_ID, token),
        ]);

      setProducts(getProducts(productsResponse));
      setCategories(getProducts(categoriesResponse));
    } catch (requestError) {
      if (requestError?.status === 401) {
        router.replace("/login");
        return;
      }

      if (requestError?.status === 403) {
        setError("شما اجازه مدیریت محصولات این فروشگاه را ندارید.");
      } else {
        setError("دریافت اطلاعات محصولات با خطا مواجه شد.");
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

    loadData();
  }, [authLoading, isAuthenticated]);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  function startEdit(product) {
    setEditingId(product.id);

    setForm({
      name: product.name || "",
      slug: product.slug || "",
      description: product.description || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      category: product.category ?? "",
      is_active: Boolean(product.is_active),
    });

    setError("");
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleInvalid(event) {
    const messages = {
      name: "لطفاً نام محصول را وارد کنید.",
      slug: "لطفاً شناسه انگلیسی محصول را وارد کنید.",
      price: "لطفاً قیمت محصول را وارد کنید.",
      stock: "لطفاً موجودی محصول را وارد کنید.",
    };

    const field = event.currentTarget;

    if (messages[field.name]) {
      field.setCustomValidity(messages[field.name]);
    }
  }

  function handleInput(event) {
    event.currentTarget.setCustomValidity("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const token = authService.getStoredAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        price: form.price,
        stock: Number(form.stock),
        is_active: form.is_active,
      };

      if (form.category !== "") {
        payload.category = Number(form.category);
      } else {
        payload.category = null;
      }

      if (editingId) {
        await adminService.updateProduct(
          STORE_ID,
          editingId,
          payload,
          token
        );
      } else {
        await adminService.createProduct(
          STORE_ID,
          payload,
          token
        );
      }

      startCreate();
      await loadData();
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
            data?.price?.[0] ||
            data?.stock?.[0] ||
            "اطلاعات محصول معتبر نیست."
        );
      } else {
        setError("ذخیره محصول با خطا مواجه شد.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(product) {
    const token = authService.getStoredAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setError("");

      await adminService.updateProduct(
        STORE_ID,
        product.id,
        {
          is_active: !product.is_active,
        },
        token
      );

      await loadData();
    } catch (requestError) {
      if (requestError?.status === 401) {
        router.replace("/login");
        return;
      }

      setError("تغییر وضعیت محصول با خطا مواجه شد.");
    }
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `محصول «${product.name}» حذف شود؟`
    );

    if (!confirmed) {
      return;
    }

    const token = authService.getStoredAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setError("");

      await adminService.deleteProduct(
        STORE_ID,
        product.id,
        token
      );

      if (editingId === product.id) {
        startCreate();
      }

      await loadData();
    } catch (requestError) {
      if (requestError?.status === 401) {
        router.replace("/login");
        return;
      }

      setError("حذف محصول با خطا مواجه شد.");
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
            در حال دریافت محصولات...
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
                مدیریت محصولات
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

        <section className="mb-6 rounded-[28px] border border-[#e7e0d9] bg-white p-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[#432a22]">
                {editingId ? "ویرایش محصول" : "محصول جدید"}
              </h2>

              <p className="mt-1 text-sm text-[#6b5b52]">
                اطلاعات عمومی و موجودی محصول
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={startCreate}
                className="rounded-xl border border-[#ded3ca] px-4 py-2 text-sm font-semibold text-[#5f514a]"
              >
                انصراف
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#4b3b34]">
                نام محصول
              </label>

              <input
                name="name"
                value={form.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                placeholder="مثلاً قهوه اتیوپی"
                required
                onInvalid={handleInvalid}
                onInput={handleInput}
                className="w-full rounded-xl border border-[#ded3ca] px-4 py-3 text-sm outline-none focus:border-[#a06b45]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#4b3b34]">
                Slug
              </label>

              <input
                name="slug"
                value={form.slug}
                onChange={(event) =>
                  updateField("slug", event.target.value)
                }
                placeholder="مثلاً ethiopian-coffee"
                required
                onInvalid={handleInvalid}
                onInput={handleInput}
                className="w-full rounded-xl border border-[#ded3ca] px-4 py-3 text-sm outline-none focus:border-[#a06b45]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#4b3b34]">
                قیمت
              </label>

              <input
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={(event) =>
                  updateField("price", event.target.value)
                }
                placeholder="مثلاً 450000"
                required
                onInvalid={handleInvalid}
                onInput={handleInput}
                className="w-full rounded-xl border border-[#ded3ca] px-4 py-3 text-sm outline-none focus:border-[#a06b45]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#4b3b34]">
                موجودی
              </label>

              <input
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(event) =>
                  updateField("stock", event.target.value)
                }
                placeholder="مثلاً 10"
                required
                onInvalid={handleInvalid}
                onInput={handleInput}
                className="w-full rounded-xl border border-[#ded3ca] px-4 py-3 text-sm outline-none focus:border-[#a06b45]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#4b3b34]">
                دسته‌بندی
              </label>

              <select
                value={form.category}
                onChange={(event) =>
                  updateField("category", event.target.value)
                }
                className="w-full rounded-xl border border-[#ded3ca] bg-white px-4 py-3 text-sm outline-none focus:border-[#a06b45]"
              >
                <option value="">مثلاً قهوه را انتخاب کنید</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-3 self-end pb-3 text-sm font-semibold text-[#4b3b34]">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  updateField(
                    "is_active",
                    event.target.checked
                  )
                }
              />

              محصول فعال باشد
            </label>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-[#4b3b34]">
                توضیحات
              </label>

              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value
                  )
                }
                placeholder="مثلاً قهوه اتیوپی با عطر و طعم میوه‌ای و اسیدیته متعادل"

                rows={4}
                className="w-full resize-y rounded-xl border border-[#ded3ca] px-4 py-3 text-sm outline-none focus:border-[#a06b45]"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#432a22] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5a382d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "در حال ذخیره..."
                  : editingId
                    ? "ذخیره تغییرات"
                    : "ایجاد محصول"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-[28px] border border-[#e7e0d9] bg-white p-7">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-black text-[#432a22]">
              محصولات
            </h2>

            <span className="text-sm font-semibold text-[#8a7569]">
              {products.length} محصول
            </span>
          </div>

          {products.length === 0 ? (
            <p className="rounded-2xl bg-[#f7f3ee] p-5 text-sm text-[#6b5b52]">
              محصولی ثبت نشده است.
            </p>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col gap-4 rounded-2xl border border-[#eee7e1] p-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-[#432a22]">
                        {product.name}
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          product.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.is_active
                          ? "فعال"
                          : "غیرفعال"}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-[#6b5b52]">
                      قیمت: {product.price} — موجودی:{" "}
                      {product.stock}
                    </p>

                    <p className="mt-1 text-xs text-[#8a7569]">
                      slug: {product.slug}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(product)}
                      className="rounded-xl border border-[#ded3ca] px-3 py-2 text-sm font-semibold text-[#5f514a] transition hover:bg-[#f7f3ee]"
                    >
                      ویرایش
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleActive(product)}
                      className="rounded-xl border border-[#ded3ca] px-3 py-2 text-sm font-semibold text-[#5f514a] transition hover:bg-[#f7f3ee]"
                    >
                      {product.is_active
                        ? "غیرفعال کردن"
                        : "فعال کردن"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(product)}
                      className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}





