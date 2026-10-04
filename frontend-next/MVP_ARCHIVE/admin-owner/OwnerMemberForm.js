export default function OwnerMemberForm({
  t,
  userId,
  role,
  saving,
  onUserIdChange,
  onRoleChange,
  onSubmit,
}) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black">
        {t("adminOwner.addTeamMember")}
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        {t("adminOwner.addTeamMemberDescription")}
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-5 grid gap-3 md:grid-cols-[1fr_180px_auto]"
      >
        <input
          value={userId}
          onChange={(event) => onUserIdChange(event.target.value)}
          placeholder="User ID"
          inputMode="numeric"
          className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black"
        />

        <select
          value={role}
          onChange={(event) => onRoleChange(event.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold"
        >
          <option value="editor">{t("adminOwner.roleEditor")}</option>
          <option value="viewer">{t("adminOwner.roleViewer")}</option>
        </select>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-black px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? t("adminOwner.addingMember")
            : t("adminOwner.addTeamMember")}
        </button>
      </form>
    </section>
  );
}