import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import useAuth from "@/hooks/useAuth";
import adminService from "@/services/admin.service";
import authService from "@/services/auth.service";
import { useI18n } from "@/i18n";

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
  const { t, isRTL } = useI18n();

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
        setError(t("adminProducts.accessDenied"));
      } else {
        setError(t("adminProducts.loadError"));
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
      name: t("adminProducts.nameRequired"),
      slug: t("adminProducts.slugRequired"),
      price: t("adminProducts.priceRequired"),
      stock: t("adminProducts.stockRequired"),
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
        setError(t("adminProducts.operationDenied"));
      } else if (requestError?.status === 400) {
        const data = requestError?.data;

        setError(
          data?.detail ||
            data?.name?.[0] ||
            data?.slug?.[0] ||
            data?.price?.[0] ||
            data?.stock?.[0] ||
            t("adminProducts.invalidProduct")
        );
      } else {
        setError(t("adminProducts.saveError"));
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

      setError(t("adminProducts.toggleError"));
    }
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(
      t("adminProducts.deleteConfirm").replace("{name}", product.name)
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

      setError(t("adminProducts.deleteError"));
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
            {t("adminProducts.loading")}
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
                {t("adminProducts.managementPanel")}
              </p>

              <h1 className="mt-1 text-3xl font-black text-[var(--theme-primary)]">
                {t("adminProducts.title")}
              </h1>
            </div>

            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="rounded-xl border border-[var(--theme-border)] px-4 py-2 text-sm font-semibold text-[var(--theme-muted)] transition hover:bg-[var(--theme-background)]"
            >
              {t("adminProducts.backToManagement")}
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <section className="mb-6 rounded-[28px] border border-[var(--theme-border)] bg-white p-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[var(--theme-primary)]">
                {editingId
                  ? t("adminProducts.editProduct")
                  : t("adminProducts.newProduct")}
              </h2>

              <p className="mt-1 text-sm text-[var(--theme-muted)]">
                {t("adminProducts.generalAndInventory")}
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={startCreate}
                className="rounded-xl border border-[var(--theme-border)] px-4 py-2 text-sm font-semibold text-[var(--theme-muted)]"
              >
                {t("adminProducts.cancel")}
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--theme-foreground)]">
                {t("adminProducts.productName")}
              </label>

              <input
                name="name"
                value={form.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                placeholder={t("adminProducts.namePlaceholder")}
                required
                onInvalid={handleInvalid}
                onInput={handleInput}
                className="w-full rounded-xl border border-[var(--theme-border)] px-4 py-3 text-sm outline-none focus:border-[var(--theme-secondary)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--theme-foreground)]">
                Slug
              </label>

              <input
                name="slug"
                value={form.slug}
                onChange={(event) =>
                  updateField("slug", event.target.value)
                }
                placeholder={t("adminProducts.slugPlaceholder")}
                required
                onInvalid={handleInvalid}
                onInput={handleInput}
                className="w-full rounded-xl border border-[var(--theme-border)] px-4 py-3 text-sm outline-none focus:border-[var(--theme-secondary)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--theme-foreground)]">
                {t("adminProducts.price")}
              </label>

              <input
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={(event) =>
                  updateField("price", event.target.value)
                }
                placeholder={t("adminProducts.pricePlaceholder")}
                required
                onInvalid={handleInvalid}
                onInput={handleInput}
                className="w-full rounded-xl border border-[var(--theme-border)] px-4 py-3 text-sm outline-none focus:border-[var(--theme-secondary)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--theme-foreground)]">
                {t("adminProducts.stock")}
              </label>

              <input
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(event) =>
                  updateField("stock", event.target.value)
                }
                placeholder={t("adminProducts.stockPlaceholder")}
                required
                onInvalid={handleInvalid}
                onInput={handleInput}
                className="w-full rounded-xl border border-[var(--theme-border)] px-4 py-3 text-sm outline-none focus:border-[var(--theme-secondary)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--theme-foreground)]">
                {t("adminProducts.category")}
              </label>

              <select
                value={form.category}
                onChange={(event) =>
                  updateField("category", event.target.value)
                }
                className="w-full rounded-xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--theme-secondary)]"
              >
                <option value="">
                  {t("adminProducts.categoryPlaceholder")}
                </option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-3 self-end pb-3 text-sm font-semibold text-[var(--theme-foreground)]">
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

              {t("adminProducts.activeProduct")}
            </label>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-[var(--theme-foreground)]">
                {t("adminProducts.description")}
              </label>

              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value
                  )
                }
                placeholder={t("adminProducts.descriptionPlaceholder")}
                rows={4}
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
                  ? t("adminProducts.saving")
                  : editingId
                    ? t("adminProducts.saveChanges")
                    : t("adminProducts.createProduct")}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-[28px] border border-[var(--theme-border)] bg-white p-7">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-black text-[var(--theme-primary)]">
              {t("adminProducts.products")}
            </h2>

            <span className="text-sm font-semibold text-[var(--theme-muted)]">
              {products.length} {t("adminProducts.productCount")}
            </span>
          </div>

          {products.length === 0 ? (
            <p className="rounded-2xl bg-[var(--theme-background)] p-5 text-sm text-[var(--theme-muted)]">
              {t("adminProducts.empty")}
            </p>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col gap-4 rounded-2xl border border-[var(--theme-border)] p-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-[var(--theme-primary)]">
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
                          ? t("adminProducts.active")
                          : t("adminProducts.inactive")}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-[var(--theme-muted)]">
                      {t("adminProducts.priceLabel")}: {product.price} —{" "}
                      {t("adminProducts.stockLabel")}: {product.stock}
                    </p>

                    <p className="mt-1 text-xs text-[var(--theme-muted)]">
                      slug: {product.slug}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(product)}
                      className="rounded-xl border border-[var(--theme-border)] px-3 py-2 text-sm font-semibold text-[var(--theme-muted)] transition hover:bg-[var(--theme-background)]"
                    >
                      {t("adminProducts.edit")}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleActive(product)}
                      className="rounded-xl border border-[var(--theme-border)] px-3 py-2 text-sm font-semibold text-[var(--theme-muted)] transition hover:bg-[var(--theme-background)]"
                    >
                      {product.is_active
                        ? t("adminProducts.deactivate")
                        : t("adminProducts.activate")}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(product)}
                      className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      {t("adminProducts.delete")}
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
