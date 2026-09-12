import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import useAuth from "@/hooks/useAuth";
import adminService from "@/services/admin.service";
import authService from "@/services/auth.service";

const STORE_ID = 1;

export default function AdminMembersPage() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAuth();

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
        setError("شما اجازه مدیریت اعضای این فروشگاه را ندارید.");
      } else {
        setError("دریافت اعضای فروشگاه با خطا مواجه شد.");
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
      setError("شناسه کاربر را وارد کنید.");
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
        setError("شما اجازه افزودن عضو را ندارید.");
      } else if (requestError?.status === 400) {
        const data = requestError?.data;

        setError(
          data?.user_id?.[0] ||
            data?.detail ||
            "اطلاعات عضو معتبر نیست."
        );
      } else {
        setError("افزودن عضو با خطا مواجه شد.");
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
        setError("شما اجازه تغییر نقش اعضا را ندارید.");
      } else {
        setError("تغییر نقش با خطا مواجه شد.");
      }
    }
  }

  async function handleDelete(member) {
    const confirmed = window.confirm(
      `عضو ${member.username || member.email || member.user_id} حذف شود؟`
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
        setError("شما اجازه حذف اعضا را ندارید.");
      } else {
        setError("حذف عضو با خطا مواجه شد.");
      }
    }
  }

  if (authLoading || loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-[#f7f3ee] px-5 py-10"
      >
        <div className="mx-auto max-w-5xl rounded-[28px] border border-[#e7e0d9] bg-white p-8">
          <p className="text-sm font-semibold text-[#5f514a]">
            در حال دریافت اعضا...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#f7f3ee] px-5 py-10"
    >
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 rounded-[28px] border border-[#e7e0d9] bg-white p-7 shadow-[0_10px_35px_rgba(70,45,30,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#8a7569]">
                پنل مدیریت
              </p>

              <h1 className="mt-1 text-3xl font-black text-[#432a22]">
                اعضای فروشگاه
              </h1>
            </div>

            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="rounded-xl border border-[#ded3ca] px-4 py-2 text-sm font-semibold text-[#5f514a] transition hover:bg-[#f7f3ee]"
            >
              بازگشت به مدیریت
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <section className="mb-6 rounded-[28px] border border-[#e7e0d9] bg-white p-7">
          <h2 className="text-xl font-black text-[#432a22]">
            افزودن عضو
          </h2>

          <form
            onSubmit={handleCreate}
            className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <label
                htmlFor="user-id"
                className="mb-2 block text-sm font-semibold text-[#4b3b34]"
              >
                شناسه کاربر
              </label>

              <input
                id="user-id"
                type="number"
                min="1"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                placeholder="مثلاً 2"
                className="w-full rounded-xl border border-[#ded3ca] px-4 py-3 text-sm outline-none focus:border-[#a06b45]"
              />
            </div>

            <div>
              <label
                htmlFor="member-role"
                className="mb-2 block text-sm font-semibold text-[#4b3b34]"
              >
                نقش
              </label>

              <select
                id="member-role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="w-full rounded-xl border border-[#ded3ca] bg-white px-4 py-3 text-sm outline-none focus:border-[#a06b45]"
              >
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#432a22] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5a382d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "در حال افزودن..." : "افزودن عضو"}
            </button>
          </form>
        </section>

        <section className="rounded-[28px] border border-[#e7e0d9] bg-white p-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-black text-[#432a22]">
              اعضای فعلی
            </h2>

            <span className="text-sm font-semibold text-[#8a7569]">
              {members.length} عضو
            </span>
          </div>

          {members.length === 0 ? (
            <p className="rounded-2xl bg-[#f7f3ee] p-5 text-sm text-[#6b5b52]">
              هنوز عضوی برای این فروشگاه ثبت نشده است.
            </p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-4 rounded-2xl border border-[#eee7e1] p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-black text-[#432a22]">
                      {member.username || `کاربر ${member.user_id}`}
                    </p>

                    {member.email && (
                      <p className="mt-1 text-sm text-[#6b5b52]">
                        {member.email}
                      </p>
                    )}

                    <p className="mt-1 text-xs text-[#8a7569]">
                      شناسه: {member.user_id}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={member.role}
                      onChange={(event) =>
                        handleRoleChange(
                          member,
                          event.target.value
                        )
                      }
                      className="rounded-xl border border-[#ded3ca] bg-white px-3 py-2 text-sm font-semibold text-[#5f514a]"
                    >
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleDelete(member)}
                      className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      حذف
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
