export default function OwnerAccessPreview({ t, member, permissions }) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black">
        {t("adminOwner.accessPreview")}
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        {t("adminOwner.accessModelDescription")}
      </p>

      <div className="mt-5 rounded-xl bg-gray-50 p-5">
        <div className="text-sm font-bold">
          {member
            ? member.username || member.email || member.user_id
            : t("adminOwner.selectMember")}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {permissions.length === 0 ? (
            <span className="text-sm text-gray-500">
              {t("adminOwner.permissionRestricted")}
            </span>
          ) : (
            permissions.map((permission) => (
              <span
                key={permission}
                className="rounded-full bg-black px-3 py-1 text-xs font-bold text-white"
              >
                {permission}
              </span>
            ))
          )}
        </div>
      </div>
    </section>
  );
}