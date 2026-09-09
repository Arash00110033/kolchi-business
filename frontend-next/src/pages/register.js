import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import useAuth from "@/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone_number: "",
    password: "",
    password_confirm: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password !== form.password_confirm) {
      setError("رمز عبور و تکرار آن یکسان نیست.");
      return;
    }

    setSubmitting(true);

    try {
      await register({
        username: form.username,
        email: form.email,
        phone_number: form.phone_number,
        password: form.password,
        password_confirm: form.password_confirm,
      });

      await router.push("/login");
    } catch (err) {
      const data = err?.data;

      if (data && typeof data === "object") {
        const messages = Object.values(data)
          .flat()
          .filter(Boolean)
          .join(" ");

        setError(messages || err?.message || "ثبت‌نام ناموفق بود.");
      } else {
        setError(err?.message || "ثبت‌نام ناموفق بود.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main dir="rtl" className="mx-auto max-w-md px-5 py-12">
      <div className="rounded-3xl border border-[#e7e0d9] bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-black text-[#432a22]">
          ثبت‌نام
        </h1>

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
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="ایمیل"
            autoComplete="email"
            required
            className="w-full rounded-xl border border-[#ded3ca] px-4 py-3 outline-none focus:border-[#a06b45]"
          />

          <input
            name="phone_number"
            type="tel"
            value={form.phone_number}
            onChange={handleChange}
            placeholder="شماره موبایل"
            autoComplete="tel"
            required
            className="w-full rounded-xl border border-[#ded3ca] px-4 py-3 outline-none focus:border-[#a06b45]"
          />

          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="رمز عبور"
            autoComplete="new-password"
            required
            className="w-full rounded-xl border border-[#ded3ca] px-4 py-3 outline-none focus:border-[#a06b45]"
          />

          <input
            name="password_confirm"
            type="password"
            value={form.password_confirm}
            onChange={handleChange}
            placeholder="تکرار رمز عبور"
            autoComplete="new-password"
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
            {submitting ? "در حال ثبت‌نام..." : "ثبت‌نام"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#5f514a]">
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <Link
            href="/login"
            className="font-bold text-[#a06b45]"
          >
            ورود
          </Link>
        </p>
      </div>
    </main>
  );
}
