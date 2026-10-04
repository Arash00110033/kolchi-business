export default function OwnerStoreSelector({
  t,
  stores,
  storeId,
  onChange,
  selectedStore,
}) {
  const storeName =
    selectedStore?.name ||
    selectedStore?.title ||
    (selectedStore ? `Store #${selectedStore.id}` : "");

  return (
    <section className="rounded-[24px] border border-[#d8d1c5] bg-[#fffdfa] p-5 shadow-[0_16px_45px_rgba(60,45,30,0.07)] sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#9a8463]">
            Store Control
          </div>

          <h2 className="text-xl font-black tracking-tight text-[#211e1a]">
            {t("adminOwner.switchStore")}
          </h2>

          <p className="mt-1.5 text-sm text-[#756f66]">
            {t("adminOwner.store")}
          </p>
        </div>

        <div className="w-full lg:max-w-md">
          <select
            value={storeId}
            onChange={(event) => onChange(event.target.value)}
            className="w-full rounded-xl border border-[#d8d1c5] bg-white px-4 py-3 text-sm font-bold text-[#211e1a] outline-none transition focus:border-[#a88a5b] focus:ring-4 focus:ring-[#c9a66b]/10"
          >
            <option value="" disabled>
              {t("adminOwner.store")}
            </option>

            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name || store.title || `Store #${store.id}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedStore && (
        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-[#e4ded4] bg-[#f7f3ec] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-base font-black text-[#211e1a]">
              {storeName}
            </div>

            {selectedStore.slug && (
              <div className="mt-1 text-xs font-medium text-[#847b70]">
                /{selectedStore.slug}
              </div>
            )}
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#c9a66b]/25 bg-white px-3 py-1.5 text-xs font-bold text-[#80683f]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#9a7b45]" />
            {t("adminOwner.enabled")}
          </div>
        </div>
      )}
    </section>
  );
}
