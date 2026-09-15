import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import useAuth from "@/hooks/useAuth";
import { useI18n } from "@/i18n";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const { t, isRTL } = useI18n();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return (
      <main dir={isRTL ? "rtl" : "ltr"} className="mx-auto max-w-md px-5 py-12">
        <div className="rounded-3xl border border-[var(--theme-border)] bg-white p-8 text-center shadow-sm">          <div className="mb-6 flex justify-end">
<LanguageSwitcher />
          </div>
          <h1 className="text-2xl font-black text-[var(--theme-primary)]">{t("auth.alreadyLoggedIn")}</h1>
          <Link href="/" className="mt-5 inline-block font-semibold text-[var(--theme-secondary)]">
            {t("auth.backToStore")}
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
      setError(err?.message || t("auth.loginFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main dir={isRTL ? "rtl" : "ltr"} className="mx-auto max-w-md px-5 py-12">
      <div className="rounded-3xl border border-[var(--theme-border)] bg-white p-8 shadow-sm">        <div className="mb-5 flex justify-end">
<LanguageSwitcher />
        </div>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-black text-[var(--theme-primary)]">{t("auth.login")}</h1>

          <Link
            href="/"
            className="text-sm font-bold text-[var(--theme-secondary)] hover:underline"
          >
            ← {t("auth.backToStore")}
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder={t("auth.username")}
            autoComplete="username"
            required
            className="w-full rounded-xl border border-[var(--theme-border)] px-4 py-3 outline-none focus:border-[var(--theme-secondary)]"
          />

          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder={t("auth.password")}
            autoComplete="current-password"
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
            {submitting ? t("auth.loggingIn") : t("auth.login")}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--theme-muted)]">
          {t("auth.noAccount")}{" "}
          <Link href="/register" className="font-bold text-[var(--theme-secondary)]">
            {t("auth.register")}
          </Link>
        </p>
      </div>
    </main>
  );
}
