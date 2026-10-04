import { PERMISSION_META } from "./owner.constants";

export default function OwnerPermissionMatrix({
  t,
  member,
  permissions,
  saving,
  onToggle,
  onSave,
}) {
  if (!member) {
    return (
      <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black">
          {t("adminOwner.permissions")}
        </h2>

        <div className="mt-4 rounded-xl bg-gray-50 p-5 text-sm text-gray-500">
          {t("adminOwner.selectMember")}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black">
            {t("adminOwner.permissions")}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {member.username || member.email || member.user_id}
          </p>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-xl bg-black px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {saving
            ? t("adminOwner.savingPermissions")
            : t("adminOwner.savePermissions")}
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {PERMISSION_META.map((permission) => {
          const enabled = permissions.includes(permission.code);

          return (
            <button
              type="button"
              key={permission.code}
              onClick={() => onToggle(permission.code)}
              className={`rounded-xl border p-4 text-left transition ${
                enabled
                  ? "border-black bg-gray-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold">
                  {t(permission.labelKey)}
                </span>

                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-black ${
                    enabled
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {enabled
                    ? t("adminOwner.permissionGranted")
                    : t("adminOwner.permissionRestricted")}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}