import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import useAuth from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return (
      <main dir="rtl" className="mx-auto max-w-md px-5 py-12">
        <div className="rounded-3xl border border-[#e7e0d9] bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-[#432a22]">شما وارد شده‌اید</h1>
          <Link href="/" className="mt-5 inline-block font-semibold text-[#a06b45]">
            بازگشت به فروشگاه
          </Link>
        </div>
      </main>
    );
  }

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(form);
      await router.push("/");
    } catch (err) {
      setError(err?.message || "ورود ناموفق بود.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main dir="rtl" className="mx-auto max-w-md px-5 py-12">
      <div className="rounded-3xl border border-[#e7e0d9] bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-black text-[#432a22]">ورود</h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="نام کاربری"
            autoComplete="username"
            required
            className="w-full rounded-xl border border-[#ded3ca] px-4 py-3 outline-none focus:border-[#a06b45]"
          />

          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="رمز عبور"
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-[#ded3ca] px-4 py-3 outline-none focus:border-[#a06b45]"
          />

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#432a22] px-4 py-3 font-bold text-white disabled:opacity-60"
          >
            {submitting ? "در حال ورود..." : "ورود"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#5f514a]">
          حساب ندارید؟{" "}
          <Link href="/register" className="font-bold text-[#a06b45]">
            ثبت‌نام
          </Link>
        </p>
      </div>
    </main>
  );
}
