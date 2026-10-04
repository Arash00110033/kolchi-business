import Preview from "@/components/admin/appearance/Preview";

export default function OwnerStorePreview({
  t,
  store,
  theme,
}) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-black">
          {t("adminOwner.storePreview")}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {t("adminOwner.storePreviewDescription")}
        </p>
      </div>

      {store && theme ? (
        <Preview
          theme={theme}
          storeName={store.name || store.title || ""}
          slogan={store.slogan || ""}
          page="home"
          device="desktop"
        />
      ) : (
        <div className="rounded-xl bg-gray-50 p-6 text-sm text-gray-500">
          {t("adminOwner.store")}
        </div>
      )}
    </section>
  );
}