import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import useAuth from "@/hooks/useAuth";
import { useI18n } from "@/i18n";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { t, isRTL } = useI18n();

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
      setError(t("registerPage.passwordMismatch"));
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

        setError(
          messages || err?.message || t("registerPage.error")
        );
      } else {
        setError(err?.message || t("registerPage.error"));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      dir={isRTL ? "rtl" : "ltr"}
      className="mx-auto max-w-md px-5 py-12"
    >
      <div className="rounded-3xl border border-[var(--theme-border)] bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-black text-[var(--theme-primary)]">
          {t("registerPage.title")}
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder={t("registerPage.username")}
            autoComplete="username"
            required
            className="w-full rounded-xl border border-[var(--theme-border)] px-4 py-3 outline-none focus:border-[var(--theme-secondary)]"
          />

          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder={t("registerPage.email")}
            autoComplete="email"
            required
            className="w-full rounded-xl border border-[var(--theme-border)] px-4 py-3 outline-none focus:border-[var(--theme-secondary)]"
          />

          <input
            name="phone_number"
            type="tel"
            value={form.phone_number}
            onChange={handleChange}
            placeholder={t("registerPage.phone")}
            autoComplete="tel"
            required
            className="w-full rounded-xl border border-[var(--theme-border)] px-4 py-3 outline-none focus:border-[var(--theme-secondary)]"
          />

          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder={t("registerPage.password")}
            autoComplete="new-password"
            required
            className="w-full rounded-xl border border-[var(--theme-border)] px-4 py-3 outline-none focus:border-[var(--theme-secondary)]"
          />

          <input
            name="password_confirm"
            type="password"
            value={form.password_confirm}
            onChange={handleChange}
            placeholder={t("registerPage.passwordConfirm")}
            autoComplete="new-password"
            required
            className="w-full rounded-xl border border-[var(--theme-border)] px-4 py-3 outline-none focus:border-[var(--theme-secondary)]"
          />

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[var(--theme-primary)] px-4 py-3 font-bold text-white disabled:opacity-60"
          >
            {submitting
              ? t("registerPage.submitting")
              : t("registerPage.submit")}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--theme-muted)]">
          {t("registerPage.alreadyRegistered")}{" "}
          <Link
            href="/login"
            className="font-bold text-[var(--theme-secondary)]"
          >
            {t("registerPage.login")}
          </Link>
        </p>
      </div>
    </main>
  );
}
