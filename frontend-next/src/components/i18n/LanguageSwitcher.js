import { useI18n } from "@/i18n";

const LANGUAGE_NAMES = {
  fa: "فارسی",
  en: "English",
  es: "Español",
  it: "Italiano",
  he: "עברית",
  zh: "中文",
  ja: "日本語",
  ar: "العربية",
};

export default function LanguageSwitcher() {
  const { locale, setLocale, supportedLocales, t } = useI18n();

  function handleChange(event) {
    setLocale(event.target.value);
  }

  return (
    <label className="inline-flex items-center gap-2 rounded-xl border border-[var(--theme-border)] bg-white px-3 py-2 shadow-sm">
      <span className="text-sm font-semibold text-[var(--theme-muted)]">
        {t("common.language")}
      </span>

      <select
        value={locale}
        onChange={handleChange}
        aria-label={t("common.language")}
        className="cursor-pointer bg-transparent text-sm font-bold outline-none"
      >
        {supportedLocales.map((code) => (
          <option key={code} value={code}>
            {LANGUAGE_NAMES[code] || code}
          </option>
        ))}
      </select>
    </label>
  );
}
