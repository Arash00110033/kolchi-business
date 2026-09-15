import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import useAuth from "@/hooks/useAuth";
import { useI18n } from "@/i18n";
import adminService from "@/services/admin.service";
import authService from "@/services/auth.service";

const STORE_ID = 1;

export default function AdminMembersPage() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const { t, isRTL } = useI18n();

  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");

  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("editor");
  const [saving, setSaving] = useState(false);

  async function loadMembers() {
    const token = authService.getStoredAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setError("");

      const data = await adminService.getMembers(STORE_ID, token);

      setMembers(Array.isArray(data) ? data : data?.results || []);
    } catch (requestError) {
      if (requestError?.status === 401) {
        router.replace("/login");
        return;
      }

      if (requestError?.status === 403) {
        setError(t("adminMembers.accessDenied"));
      } else {
        setError(t("adminMembers.loadError"));
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

    loadMembers();
  }, [authLoading, isAuthenticated]);

  async function handleCreate(event) {
    event.preventDefault();

    if (!userId.trim()) {
      setError(t("adminMembers.userIdRequired"));
      return;
    }

    setSaving(true);
    setError("");

    try {
      const token = authService.getStoredAccessToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      await adminService.createMember(
        STORE_ID,
        {
          user_id: Number(userId),
          role,
        },
        token
      );

      setUserId("");
      setRole("editor");

      await loadMembers();
    } catch (requestError) {
      if (requestError?.status === 401) {
        router.replace("/login");
        return;
      }

      if (requestError?.status === 403) {
        setError(t("adminMembers.createDenied"));
      } else if (requestError?.status === 400) {
        const data = requestError?.data;

        setError(
          data?.user_id?.[0] ||
            data?.detail ||
            t("adminMembers.invalidMember")
        );
      } else {
        setError(t("adminMembers.createError"));
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleRoleChange(member, newRole) {
    const token = authService.getStoredAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setError("");

      await adminService.updateMember(
        STORE_ID,
        member.id,
        { role: newRole },
        token
      );

      await loadMembers();
    } catch (requestError) {
      if (requestError?.status === 401) {
        router.replace("/login");
        return;
      }

      if (requestError?.status === 403) {
        setError(t("adminMembers.roleChangeDenied"));
      } else {
        setError(t("adminMembers.roleChangeError"));
      }
    }
  }

  async function handleDelete(member) {
    const memberName =
      member.username || member.email || member.user_id;

    const confirmed = window.confirm(
      `${t("adminMembers.userWithId")} ${memberName} ${t(
        "adminMembers.deleteConfirm"
      )}`
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

      await adminService.deleteMember(
        STORE_ID,
        member.id,
        token
      );

      await loadMembers();
    } catch (requestError) {
      if (requestError?.status === 401) {
        router.replace("/login");
        return;
      }

      if (requestError?.status === 403) {
        setError(t("adminMembers.deleteDenied"));
      } else {
        setError(t("adminMembers.deleteError"));
      }
    }
  }

  if (authLoading || loading) {
    return (
      <main
        dir={isRTL ? "rtl" : "ltr"}
        className="min-h-screen bg-[var(--theme-background)] px-5 py-10"
      >
        <div className="mx-auto max-w-5xl rounded-[28px] border border-[var(--theme-border)] bg-white p-8">
          <p className="text-sm font-semibold text-[var(--theme-muted)]">
            {t("adminMembers.loading")}
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
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 rounded-[28px] border border-[var(--theme-border)] bg-white p-7 shadow-[0_10px_35px_rgba(70,45,30,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[var(--theme-muted)]">
                {t("adminDashboard.dashboard")}
              </p>

              <h1 className="mt-1 text-3xl font-black text-[var(--theme-primary)]">
                {t("adminMembers.title")}
              </h1>
            </div>

            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="rounded-xl border border-[var(--theme-border)] px-4 py-2 text-sm font-semibold text-[var(--theme-muted)] transition hover:bg-[var(--theme-background)]"
            >
              {t("adminDashboard.backToStore")}
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <section className="mb-6 rounded-[28px] border border-[var(--theme-border)] bg-white p-7">
          <h2 className="text-xl font-black text-[var(--theme-primary)]">
            {t("adminMembers.addMember")}
          </h2>

          <form
            onSubmit={handleCreate}
            className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <label
                htmlFor="user-id"
                className="mb-2 block text-sm font-semibold text-[var(--theme-foreground)]"
              >
                {t("adminMembers.userId")}
              </label>

              <input
                id="user-id"
                type="number"
                min="1"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                placeholder={t("adminMembers.userIdPlaceholder")}
                className="w-full rounded-xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--theme-primary)]"
              />
            </div>

            <div className="sm:w-48">
              <label
                htmlFor="member-role"
                className="mb-2 block text-sm font-semibold text-[var(--theme-foreground)]"
              >
                {t("adminMembers.role")}
              </label>

              <select
                id="member-role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="w-full rounded-xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--theme-primary)]"
              >
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[var(--theme-primary)] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? t("adminMembers.adding")
                : t("adminMembers.addMember")}
            </button>
          </form>
        </section>

        <section className="rounded-[28px] border border-[var(--theme-border)] bg-white p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black text-[var(--theme-primary)]">
              {t("adminMembers.currentMembers")}
            </h2>

            <span className="rounded-full bg-[var(--theme-background)] px-3 py-1 text-sm font-semibold text-[var(--theme-muted)]">
              {t("adminMembers.memberCount")}: {members.length}
            </span>
          </div>

          {members.length === 0 ? (
            <p className="py-8 text-center text-sm font-semibold text-[var(--theme-muted)]">
              {t("adminMembers.empty")}
            </p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-4 rounded-2xl border border-[var(--theme-border)] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-bold text-[var(--theme-foreground)]">
                      {member.username ||
                        member.email ||
                        `${t("adminMembers.userWithId")} ${member.user_id}`}
                    </p>

                    <p className="mt-1 text-xs text-[var(--theme-muted)]">
                      {t("adminMembers.userIdLabel")}: {member.user_id}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={member.role}
                      onChange={(event) =>
                        handleRoleChange(member, event.target.value)
                      }
                      className="rounded-xl border border-[var(--theme-border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--theme-primary)]"
                    >
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleDelete(member)}
                      className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      {t("adminMembers.delete")}
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
