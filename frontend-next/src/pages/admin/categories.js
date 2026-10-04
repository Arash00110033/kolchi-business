import { useStore } from "@/context/StoreContext";
import { useI18n } from "@/i18n";
import { getLocalizedErrorMessage } from "@/utils/errorMessage";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import useAuth from "@/hooks/useAuth";
import adminService from "@/services/admin.service";
import authService from "@/services/auth.service";

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
  const { storeId } = useStore();
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const { t, isRTL } = useI18n();

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
        storeId,
        token
      );

      setCategories(normalizeList(response));
    } catch (requestError) {
      if (requestError?.status === 401) {
        router.replace("/login");
        return;
      }

      if (requestError?.status === 403) {
        setError(t("adminCategories.accessDenied"));
      } else {
        setError(t("adminCategories.loadError"));
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

    if (!storeId) {
      setLoading(false);
      return;
    }

    loadCategories();
  }, [authLoading, isAuthenticated, storeId]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function startCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });
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

  function toggleActive() {
    setForm((current) => ({
      ...current,
      is_active: !current.is_active,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const token = authService.getStoredAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    if (!form.name.trim()) {
      setError(t("adminCategories.nameRequired"));
      return;
    }

    if (!form.slug.trim()) {
      setError(t("adminCategories.slugRequired"));
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
          storeId,
          editingId,
          payload,
          token
        );
      } else {
        await adminService.createCategory(
          storeId,
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
        setError(t("adminCategories.operationDenied"));
      } else if (requestError?.status === 400) {
        const data = requestError?.data;

        setError(
          data?.detail ||
            data?.name?.[0] ||
            data?.slug?.[0] ||
            t("adminCategories.invalidCategory")
        );
      } else {
        setError(t("adminCategories.saveError"));
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
      t("adminCategories.deleteConfirm", {
        name: category.name,
      })
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await adminService.deleteCategory(
        storeId,
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
        setError(t("adminCategories.operationDenied"));
      } else if (requestError?.status === 400) {
        setError(
          getLocalizedErrorMessage(
            requestError,
            t,
            "adminCategories.deleteError"
          )
        );
      }
  }
  }

  if (authLoading || loading) {
    // KOLCHI_LUXURY_CATEGORY_UI_V2
    return (
      <main
        dir={isRTL ? "rtl" : "ltr"}
        className="min-h-screen bg-[var(--theme-background)] px-4 py-6 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <section className="relative mb-8 overflow-hidden rounded-[32px] border border-[var(--theme-border)] bg-[var(--theme-background)] shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[var(--theme-primary)] opacity-[0.07] blur-3xl" />
              <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[var(--theme-secondary)] opacity-[0.07] blur-3xl" />
            </div>

            <div className="relative px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

                <div className="max-w-3xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--theme-border)] bg-[var(--theme-background)] px-3 py-1.5 text-xs font-bold text-[var(--theme-muted)] shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-[var(--theme-primary)]" />
                    {t("adminCategories.categories")}
                  </div>

                  <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                    {t("adminCategories.title")}
                  </h1>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--theme-muted)] sm:text-base">
                    {t("adminCategories.description")}
                  </p>
                </div>

                <div className="shrink-0 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-background)] px-6 py-4 text-center shadow-sm">
                  <div className="text-3xl font-black">
                    {categories.length}
                  </div>

                  <div className="mt-1 text-xs font-semibold text-[var(--theme-muted)]">
                    {t("adminCategories.categoryCount")}
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="rounded-[28px] border border-[var(--theme-border)] bg-[var(--theme-background)] p-12 text-center shadow-sm">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[var(--theme-border)] border-t-[var(--theme-primary)]" />

              <p className="mt-4 text-sm text-[var(--theme-muted)]">
                {t("adminCategories.loading")}
              </p>
            </div>
          ) : (

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">

              {/* Form */}
              <section className="overflow-hidden rounded-[28px] border border-[var(--theme-border)] bg-[var(--theme-background)] shadow-sm">

                <div className="flex flex-col gap-4 border-b border-[var(--theme-border)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-black">
                      {editingId
                        ? t("adminCategories.editCategory")
                        : t("adminCategories.createCategory")}
                    </h2>

                    <p className="mt-1 text-xs leading-6 text-[var(--theme-muted)]">
                      {t("adminCategories.formDescription")}
                    </p>
                  </div>

                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-xl border border-[var(--theme-border)] px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5 hover:border-[var(--theme-primary)]"
                    >
                      {t("adminCategories.cancel")}
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 p-6">

                  <div className="grid gap-5 sm:grid-cols-2">

                    <label className="block">
                      <span className="mb-2 block text-sm font-bold">
                        {t("adminCategories.name")}
                      </span>

                      <input
                        value={form.name}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-[var(--theme-border)] bg-transparent px-4 py-3.5 text-sm outline-none transition focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/10"
                        placeholder={t("adminCategories.namePlaceholder")}
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-bold">
                        {t("adminCategories.slug")}
                      </span>

                      <input
                        dir="ltr"
                        value={form.slug}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            slug: event.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-[var(--theme-border)] bg-transparent px-4 py-3.5 text-sm outline-none transition focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/10"
                        placeholder="category-slug"
                      />
                    </label>

                  </div>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold">
                      {t("adminCategories.descriptionLabel")}
                    </span>

                    <textarea
                      rows={5}
                      value={form.description}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      className="w-full resize-none rounded-2xl border border-[var(--theme-border)] bg-transparent px-4 py-3.5 text-sm leading-7 outline-none transition focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/10"
                      placeholder={t("adminCategories.descriptionPlaceholder")}
                    />
                  </label>

                  <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-[var(--theme-border)] px-4 py-4 transition hover:border-[var(--theme-primary)]">
                    <div>
                      <div className="text-sm font-bold">
                        {t("adminCategories.active")}
                      </div>

                      <div className="mt-1 text-xs text-[var(--theme-muted)]">
                        {t("adminCategories.activeDescription")}
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={Boolean(form.is_active)}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          is_active: event.target.checked,
                        }))
                      }
                      className="h-5 w-5"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-2xl bg-[var(--theme-primary)] px-5 py-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? t("adminCategories.saving")
                      : editingId
                        ? t("adminCategories.saveChanges")
                        : t("adminCategories.createCategory")}
                  </button>

                </form>
              </section>

              {/* Right Panel */}
              <aside className="space-y-6">

                {/* Preview */}
                <section className="overflow-hidden rounded-[28px] border border-[var(--theme-border)] bg-[var(--theme-background)] shadow-sm">

                  <div className="border-b border-[var(--theme-border)] px-6 py-5">
                    <div className="text-[10px] font-black tracking-[0.2em] text-[var(--theme-muted)]">
                      LIVE PREVIEW
                    </div>

                    <h2 className="mt-2 text-lg font-black">
                      {t("adminCategories.previewTitle")}
                    </h2>
                  </div>

                  <div className="p-6">
                    <div className="rounded-[24px] border border-[var(--theme-border)] p-6 shadow-inner">

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-[var(--theme-muted)]">
                          {t("adminCategories.previewCategory")}
                        </span>

                        <span
                          className={
                            form.is_active
                              ? "rounded-full bg-[var(--theme-primary)] px-3 py-1 text-xs font-bold text-white"
                              : "rounded-full bg-black/5 px-3 py-1 text-xs font-bold text-[var(--theme-muted)]"
                          }
                        >
                          {form.is_active
                            ? t("adminCategories.previewActive")
                            : t("adminCategories.previewInactive")}
                        </span>
                      </div>

                      <h3 className="mt-6 break-words text-2xl font-black">
                        {form.name || t("adminCategories.previewName")}
                      </h3>

                      <p
                        dir="ltr"
                        className="mt-2 break-all text-xs text-[var(--theme-muted)]"
                      >
                        /{form.slug || "category-slug"}
                      </p>

                      <p className="mt-5 break-words text-sm leading-7 text-[var(--theme-muted)]">
                        {form.description ||
                          t("adminCategories.previewDescription")}
                      </p>

                    </div>
                  </div>
                </section>

                {/* Category List */}
                <section className="rounded-[28px] border border-[var(--theme-border)] bg-[var(--theme-background)] p-6 shadow-sm">

                  <div className="mb-5 flex items-center justify-between gap-3">
                    <h2 className="text-lg font-black">
                      {t("adminCategories.listTitle")}
                    </h2>

                    <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-bold text-[var(--theme-muted)]">
                      {categories.length}
                    </span>
                  </div>

                  {categories.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[var(--theme-border)] p-6 text-center">
                      <p className="text-sm font-bold">
                        {t("adminCategories.empty")}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">

                      {categories.slice(0, 6).map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--theme-border)] p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm font-bold">
                              {category.name}
                            </div>

                            <div
                              dir="ltr"
                              className="mt-1 truncate text-xs text-[var(--theme-muted)]"
                            >
                              /{category.slug}
                            </div>
                          </div>

                          <span
                            className={
                              category.is_active
                                ? "h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--theme-primary)]"
                                : "h-2.5 w-2.5 shrink-0 rounded-full bg-black/20"
                            }
                          />
                        </div>
                      ))}

                    </div>
                  )}

                </section>

              </aside>

            </div>
          )}

        </div>
      </main>
    );
  }

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-[var(--theme-background)] px-4 py-8 sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-5 text-sm font-bold text-[var(--theme-muted)] transition hover:text-[var(--theme-foreground)]"
          >
            {isRTL ? "←" : "→"} {t("adminCategories.backToManagement")}
          </button>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold tracking-widest text-[var(--theme-muted)]">
                ADMIN / CATALOG
              </p>

              <h1 className="text-3xl font-black text-[var(--theme-foreground)]">
                {t("adminCategories.title")}
              </h1>

              <p className="mt-2 text-sm text-[var(--theme-muted)]">
                {t("adminCategories.managementPanel")}
              </p>
            </div>

            <button
              type="button"
              onClick={startCreate}
              className="rounded-2xl bg-[var(--theme-foreground)] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-md"
            >
              + {t("adminCategories.newCategory")}
            </button>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-700"
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
          <section className="rounded-[28px] border border-[var(--theme-border)] bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-lg font-black text-[var(--theme-foreground)]">
                {t("adminCategories.categories")}
              </h2>

              <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-bold text-[var(--theme-muted)]">
                {categories.length} {t("adminCategories.categoryCount")}
              </span>
            </div>

            {categories.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--theme-border)] py-16 text-center">
                <p className="font-bold text-[var(--theme-foreground)]">
                  {t("adminCategories.empty")}
                </p>

                <button
                  type="button"
                  onClick={startCreate}
                  className="mt-3 text-sm font-bold underline underline-offset-4"
                >
                  {t("adminCategories.newCategory")}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 transition ${
                      editingId === category.id
                        ? "border-black/20 bg-black/[0.025] shadow-sm"
                        : "border-[var(--theme-border)] hover:bg-black/[0.015]"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-[var(--theme-foreground)]">
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
                            ? t("adminCategories.active")
                            : t("adminCategories.inactive")}
                        </span>
                      </div>

                      <p
                        dir="ltr"
                        className="mt-1 text-xs text-[var(--theme-muted)]"
                      >
                        /{category.slug}
                      </p>

                      {category.description && (
                        <p className="mt-2 text-sm leading-6 text-[var(--theme-muted)]">
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
                        {t("adminCategories.edit")}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(category)}
                        className="rounded-xl border border-red-100 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                      >
                        {t("adminCategories.delete")}
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
                <p className="text-xs font-bold tracking-widest text-[var(--theme-muted)]">
                  {editingId ? "EDIT CATEGORY" : "NEW CATEGORY"}
                </p>

                <h2 className="mt-1 text-xl font-black text-[var(--theme-foreground)]">
                  {editingId
                    ? t("adminCategories.editCategory")
                    : t("adminCategories.newCategory")}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold">
                    {t("adminCategories.categoryName")}
                  </span>

                  <input
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    className="w-full rounded-2xl border border-[var(--theme-border)] px-4 py-3 outline-none transition focus:border-black/30 focus:ring-2 focus:ring-black/5"
                    placeholder={t("adminCategories.namePlaceholder")}
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold">
                    Slug
                  </span>

                  <input
                    dir="ltr"
                    value={form.slug}
                    onChange={(event) =>
                      updateField("slug", event.target.value)
                    }
                    className="w-full rounded-2xl border border-[var(--theme-border)] px-4 py-3 text-left outline-none transition focus:border-black/30 focus:ring-2 focus:ring-black/5"
                    placeholder={t("adminCategories.slugPlaceholder")}
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold">
                    {t("adminCategories.description")}
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
                    className="w-full resize-none rounded-2xl border border-[var(--theme-border)] px-4 py-3 outline-none transition focus:border-black/30 focus:ring-2 focus:ring-black/5"
                    placeholder={t(
                      "adminCategories.descriptionPlaceholder"
                    )}
                  />
                </label>

                <button
                  type="button"
                  onClick={toggleActive}
                  className={`flex w-full items-center justify-between rounded-2xl p-4 text-right transition ${
                    form.is_active
                      ? "bg-emerald-50"
                      : "bg-black/[0.025]"
                  }`}
                >
                  <span>
                    <span className="block text-sm font-bold">
                      {t("adminCategories.activeCategory")}
                    </span>

                    <span className="mt-1 block text-xs text-[var(--theme-muted)]">
                      {form.is_active
                        ? t("adminCategories.active")
                        : t("adminCategories.inactive")}
                    </span>
                  </span>

                  <span
                    className={`relative h-6 w-11 rounded-full transition ${
                      form.is_active
                        ? "bg-emerald-500"
                        : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                        form.is_active
                          ? "right-1"
                          : "right-6"
                      }`}
                    />
                  </span>
                </button>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-2xl bg-[var(--theme-foreground)] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? t("adminCategories.saving")
                      : editingId
                        ? t("adminCategories.saveChanges")
                        : t("adminCategories.createCategory")}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      onClick={startCreate}
                      className="rounded-2xl border border-[var(--theme-border)] px-4 py-3 text-sm font-bold transition hover:bg-black/5"
                    >
                      {t("adminCategories.cancel")}
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="overflow-hidden rounded-[28px] border border-[var(--theme-border)] bg-white shadow-sm">
              <div className="border-b border-[var(--theme-border)] px-6 py-4">
                <p className="text-xs font-bold tracking-widest text-[var(--theme-muted)]">
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
                      ? t("adminCategories.previewActive")
                      : t("adminCategories.previewInactive")}
                  </span>

                  <h3 className="mt-4 text-xl font-black">
                    {form.name || t("adminCategories.previewName")}
                  </h3>

                  <p
                    dir="ltr"
                    className="mt-1 text-xs text-[var(--theme-muted)]"
                  >
                    /{form.slug || "category-slug"}
                  </p>

                  <p className="mt-3 text-sm leading-7 text-[var(--theme-muted)]">
                    {form.description ||
                      t("adminCategories.previewDescription")}
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
