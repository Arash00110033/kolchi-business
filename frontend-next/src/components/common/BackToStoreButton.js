import Link from "next/link";

export default function BackToStoreButton({
  t,
  translationKey = "auth.backToStore",
  dark = false,
  className = "",
}) {
  const baseClass = dark
    ? "inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:border-[#c9a66b]/40 hover:bg-white/10"
    : "inline-flex items-center gap-2 rounded-xl border border-[var(--theme-border)] px-4 py-2.5 text-sm font-bold text-[var(--theme-primary)] transition hover:bg-[var(--theme-surface)]";

  return (
    <Link href="/" className={`${baseClass} ${className}`.trim()}>
      <span>{t(translationKey)}</span>
    </Link>
  );
}

