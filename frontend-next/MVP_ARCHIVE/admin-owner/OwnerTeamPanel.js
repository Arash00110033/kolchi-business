import { getInitials } from "./owner.constants";

export default function OwnerTeamPanel({
  t,
  members,
  selectedMemberId,
  onSelectMember,
  onRoleChange,
  onDeleteMember,
}) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-black">
          {t("adminOwner.team")}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {t("adminOwner.addTeamMemberDescription")}
        </p>
      </div>

      <div className="space-y-3">
        {members.length === 0 ? (
          <div className="rounded-xl bg-gray-50 p-5 text-sm text-gray-500">
            {t("adminOwner.people")}
          </div>
        ) : (
          members.map((member) => {
            const id = String(member.id ?? member.user_id);
            const selected = String(selectedMemberId) === id;

            return (
              <div
                key={id}
                className={`rounded-xl border p-4 transition ${
                  selected
                    ? "border-black bg-gray-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <button
                    type="button"
                    onClick={() => onSelectMember(member)}
                    className="flex min-w-0 items-center gap-3 text-left"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-sm font-black text-white">
                      {getInitials(member)}
                    </div>

                    <div className="min-w-0">
                      <div className="truncate font-bold">
                        {member.username ||
                          member.email ||
                          String(member.user_id)}
                      </div>

                      {member.email && (
                        <div className="truncate text-xs text-gray-500">
                          {member.email}
                        </div>
                      )}
                    </div>
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={member.role || "editor"}
                      onChange={(event) =>
                        onRoleChange(member, event.target.value)
                      }
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold"
                    >
                      <option value="editor">{t("adminOwner.roleEditor")}</option>
                      <option value="viewer">{t("adminOwner.roleViewer")}</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => onDeleteMember(member)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600"
                    >
                      {t("adminOwner.removeMember")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}