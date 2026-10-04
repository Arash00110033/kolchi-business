import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { useStore } from "@/context/StoreContext";
import useAuth from "@/hooks/useAuth";
import adminService from "@/services/admin.service";
import authService from "@/services/auth.service";
import { useI18n } from "@/i18n";

export default function InventoryPage() {
  const router = useRouter();
  const { storeId } = useStore();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const { t, isRTL } = useI18n();

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [transactionType, setTransactionType] = useState("restock");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const getInventory = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    return Array.isArray(data?.results) ? data.results : [];
  };

  const loadInventory = async () => {
    const token = authService.getStoredAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await adminService.getInventory(storeId, token);
      setInventory(getInventory(response));
    } catch (err) {
      if (err?.response?.status === 401) {
        router.replace("/login");
        return;
      }

      if ([403, 404].includes(err?.response?.status)) {
        setError(t("adminInventory.accessDenied"));
      } else {
        setError(t("adminInventory.loadError"));
      }
    } finally {
      setLoading(false);
    }
  };

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

    loadInventory();
  }, [authLoading, isAuthenticated, storeId]);

  const startAdjust = (product) => {
    setSelectedProduct(product);
    setQuantity("");
    setTransactionType("restock");
    setNote("");
    setError("");
  };

  const closeAdjust = () => {
    if (saving) {
      return;
    }

    setSelectedProduct(null);
    setQuantity("");
    setNote("");
  };

  const handleAdjust = async (event) => {
    event.preventDefault();

    const token = authService.getStoredAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    const parsedQuantity = Number.parseInt(quantity, 10);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity === 0) {
      setError(t("adminInventory.invalidQuantity"));
      return;
    }

    if (
      transactionType === "restock" &&
      parsedQuantity < 0
    ) {
      setError(t("adminInventory.positiveRestock"));
      return;
    }

    if (
      transactionType === "return" &&
      parsedQuantity < 0
    ) {
      setError(t("adminInventory.positiveReturn"));
      return;
    }

    if (!selectedProduct?.product_id) {
      setError(t("adminInventory.invalidAdjustment"));
      return;
    }

    setSaving(true);
    setError("");

    try {
      await adminService.adjustInventory(
        storeId,
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
    } catch (err) {
      if (err?.response?.status === 401) {
        router.replace("/login");
        return;
      }

      if ([403, 404].includes(err?.response?.status)) {
        setError(t("adminInventory.updateAccessDenied"));
      } else if (err?.response?.status === 400) {
        setError(t("adminInventory.invalidAdjustment"));
      } else {
        setError(t("adminInventory.updateError"));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-slate-50 px-4 py-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-500">
              {t("adminInventory.managementPanel")}
            </p>

            <h1 className="text-3xl font-bold text-slate-900">
              {t("adminInventory.title")}
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              {t("adminInventory.description")}
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {t("adminInventory.backToManagement")}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {t("adminInventory.inventory")}
                </h2>

                <p className="text-sm text-slate-500">
                  {t("adminInventory.productCount", {
                    count: inventory.length,
                  })}
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              {t("adminInventory.loading")}
            </div>
          ) : inventory.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              {t("adminInventory.empty")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-semibold text-slate-500">
                      {t("adminProducts.name")}
                    </th>

                    <th className="px-6 py-3 text-start text-xs font-semibold text-slate-500">
                      {t("adminInventory.currentStock")}
                    </th>

                    <th className="px-6 py-3 text-start text-xs font-semibold text-slate-500">
                      {t("adminInventory.productId")}
                    </th>

                    <th className="px-6 py-3 text-end text-xs font-semibold text-slate-500">
                      {t("adminInventory.adjustInventory")}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {inventory.map((item) => (
                    <tr key={item.product_id}>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {item.product_name ||
                          item.name ||
                          t("adminProducts.unknownProduct")}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {item.quantity ?? item.stock ?? 0}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        #{item.product_id}
                      </td>

                      <td className="px-6 py-4 text-end">
                        <button
                          type="button"
                          onClick={() => startAdjust(item)}
                          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                        >
                          {t("adminInventory.adjustInventory")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {t("adminInventory.adjustInventory")}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {selectedProduct.product_name ||
                  selectedProduct.name ||
                  t("adminProducts.unknownProduct")}
              </p>
            </div>

            <form onSubmit={handleAdjust} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("adminInventory.transactionType")}
                </label>

                <select
                  value={transactionType}
                  onChange={(event) =>
                    setTransactionType(event.target.value)
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                >
                  <option value="restock">
                    {t("adminInventory.restock")}
                  </option>

                  <option value="return">
                    {t("adminInventory.return")}
                  </option>

                  <option value="adjustment">
                    {t("adminInventory.adjustment")}
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("adminInventory.quantity")}
                </label>

                <input
                  type="number"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  disabled={saving}
                  placeholder={
                    transactionType === "adjustment"
                      ? t("adminInventory.positiveOrNegativeExample")
                      : t("adminInventory.positiveExample")
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("adminInventory.note")}
                </label>

                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  disabled={saving}
                  rows={3}
                  placeholder={t("adminInventory.notePlaceholder")}
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeAdjust}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  {t("adminInventory.cancel")}
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? t("adminInventory.saving")
                    : t("adminInventory.submitAdjustment")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
