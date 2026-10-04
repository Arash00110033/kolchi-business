import { API_ACCESS_META } from "./owner.constants";

export default function OwnerApiAccessMap({ t }) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black">
        {t("adminOwner.apiMapTitle")}
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        {t("adminOwner.apiMapDescription")}
      </p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[620px] text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
              <th className="px-3 py-3 font-bold">{t("adminOwner.apiMapModule")}</th>
              <th className="px-3 py-3 font-bold">{t("adminOwner.apiMapOperations")}</th>
              <th className="px-3 py-3 font-bold">{t("adminOwner.apiMapDescriptionColumn")}</th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(API_ACCESS_META).map(
              ([code, item]) => (
                <tr
                  key={code}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-3 py-3 font-bold">
                    {t(item.labelKey)}
                  </td>

                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      {item.operations.map((operation) => (
                        <span
                          key={operation}
                          className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-bold text-gray-600"
                        >
                          {operation}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="px-3 py-3 text-xs leading-6 text-gray-500">
                    {code === "store_settings"
                      ? t("adminOwner.apiMapStoreSettingsDescription")
                      : "—"}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}