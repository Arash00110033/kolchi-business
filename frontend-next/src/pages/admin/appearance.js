import { useState } from "react";
import { useRouter } from "next/router";
import { useTheme } from "@/theme/ThemeProvider";
import { DEFAULT_THEME } from "@/theme/tokens";
import { PAGES, DEVICES, PRESETS, HIGHLIGHT_MAP, COLOR_FIELDS } from '@/components/admin/appearance/config';
import Preview from "@/components/admin/appearance/Preview";
import useAppearanceEditor from "@/components/admin/appearance/hooks/useAppearanceEditor";
import PresetSelector from "@/components/admin/appearance/PresetSelector";
import StoreSettings from "@/components/admin/appearance/StoreSettings";
import DesignSettings from "@/components/admin/appearance/DesignSettings";










function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeTheme(base) {
  const theme = clone(base || DEFAULT_THEME);

  theme.colors = {
    ...DEFAULT_THEME.colors,
    ...theme.colors,
    hero: theme.colors?.hero || theme.colors?.primary || DEFAULT_THEME.colors.primary,
  };

  theme.shape = {
    ...DEFAULT_THEME.shape,
    ...theme.shape,
  };

  theme.components = {
    ...DEFAULT_THEME.components,
    ...theme.components,
  };

  theme.typography = {
    ...DEFAULT_THEME.typography,
    ...theme.typography,
  };

  theme.layout = {
    ...DEFAULT_THEME.layout,
    ...theme.layout,
  };

  return theme;
}

function Section({ title, description, children }) {
  return (
    <section className="mb-4 rounded-[var(--theme-radius)] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4 shadow-sm">
      <h3 className="font-bold">{title}</h3>
      {description && (
        <p className="mt-1 text-[11px] leading-5 text-[var(--theme-muted)]">
          {description}
        </p>
      )}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Choice({ active, title, description, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border p-3 text-right transition ${
        active
          ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/5 ring-2 ring-[var(--theme-primary)]/15"
          : "border-[var(--theme-border)] hover:bg-[var(--theme-background)]"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold">{title}</span>
        {active && (
          <span className="rounded-full bg-[var(--theme-primary)] px-2 py-0.5 text-[10px] font-bold text-white">
            انتخاب شد
          </span>
        )}
      </div>

      {description && (
        <div className="mt-1 text-[11px] text-[var(--theme-muted)]">
          {description}
        </div>
      )}

      {children}
    </button>
  );
}

export default function Appearance() {
  const router = useRouter();
  const { theme: liveTheme } = useTheme();

  const editor = useAppearanceEditor({
    liveTheme,
    DEFAULT_THEME,
    PRESETS,
    clone,
    normalizeTheme,
  });

  const {
    draftTheme,
    setDraftTheme,
    storeName,
    setStoreName,
    slogan,
    setSlogan,
    page,
    setPage,
    device,
    setDevice,
    panel,
    setPanel,
    history,
    future,
    presetName,
    setPresetName,
    activeHighlight,
    setActiveHighlight,
    theme,
    snapshot,
    updateTheme,
    changeColor,
    changeShape,
    changeComponent,
    changeTypography,
    changeWidth,
    undo,
    redo,
    applyPreset,
    reset,
  } = editor;

  function showHighlight(key) {
    setActiveHighlight(key);

    window.setTimeout(() => {
      setActiveHighlight((current) =>
        current === key ? null : current
      );
    }, 2200);
  }
  function confirmDesign() {
    window.alert(
      "طراحی فعلاً فقط به‌صورت Draft در Preview است و هنوز روی فروشگاه اصلی اعمال نشده است."
    );
  }

  return (
    <main className="min-h-screen bg-[var(--theme-background)] text-[var(--theme-foreground)]">
      <header className="sticky top-0 z-30 border-b border-[var(--theme-border)] bg-[var(--theme-surface)]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[var(--theme-max-width)] items-center justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="text-sm text-[var(--theme-muted)]"
            >
              ← مدیریت فروشگاه
            </button>

            <div className="flex items-center gap-2">
              <h1 className="mt-1 text-xl font-black">
                طراح بصری فروشگاه
              </h1>

              <span className="rounded-full border px-2.5 py-1 text-[10px] font-black tracking-wide" style={{ borderColor: "var(--theme-secondary)", color: "var(--theme-secondary)", backgroundColor: "var(--theme-surface-muted)" }}>
                DRAFT
              </span>
            </div>

            <p className="mt-1 text-[11px] text-[var(--theme-muted)]">
              تغییرات فقط در Preview هستند و هنوز روی فروشگاه اصلی اعمال نشده‌اند.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={undo}
              disabled={!history.length}
              title="برگرداندن آخرین تغییر"
              className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
            >
              ↶
            </button>

            <button
              type="button"
              onClick={redo}
              disabled={!future.length}
              title="انجام دوباره تغییر"
              className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
            >
              ↷
            </button>

            <button
              type="button"
              onClick={reset}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              بازگردانی
            </button>

            <button
              type="button"
              onClick={confirmDesign}
              className="rounded-lg bg-[var(--theme-primary)] px-4 py-2 text-sm font-bold text-white"
            >
              تأیید طراحی
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[var(--theme-max-width)] grid-cols-1 gap-4 p-4 lg:grid-cols-[220px_minmax(0,1fr)_330px]">
        {/* LEFT TOOLS */}
        <aside className="order-2 lg:order-1">
          <div className="sticky top-28 rounded-[var(--theme-radius)] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
            <div className="mb-3 text-xs font-bold text-[var(--theme-muted)]">
              ابزارهای طراحی
            </div>

            {[
              ["design", "🎨 ظاهر"],
              ["store", "🏪 فروشگاه"],
              ["presets", "✨ قالب‌ها"],
            ].map(([id, title]) => (
              <button
                key={id}
                type="button"
                onClick={() => setPanel(id)}
                className={`mb-2 w-full rounded-xl px-3 py-3 text-right text-sm font-bold ${
                  panel === id
                    ? "bg-[var(--theme-primary)] text-white"
                    : "hover:bg-[var(--theme-background)]"
                }`}
              >
                {title}
              </button>
            ))}

            <div className="my-4 border-t border-[var(--theme-border)]" />

            <div className="text-[11px] leading-6 text-[var(--theme-muted)]">
              این صفحه یک آزمایشگاه طراحی است. تغییرات تا زمان Publish
              روی فروشگاه اصلی اعمال نمی‌شوند.
            </div>
          </div>
        </aside>

        {/* PREVIEW */}
        <section className="order-1 min-w-0 lg:order-2">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-[var(--theme-radius)] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-3">
            <div>
              <div className="text-xs text-[var(--theme-muted)]">
                صفحه Preview
              </div>

              <div className="mt-1 flex flex-wrap gap-2">
                {Object.entries(PAGES).map(([id, title]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPage(id)}
                    className={`rounded-lg px-4 py-2 text-sm font-bold ${
                      page === id
                        ? "bg-[var(--theme-primary)] text-white"
                        : "border border-[var(--theme-border)]"
                    }`}
                  >
                    {title}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1 text-xs text-[var(--theme-muted)]">
                اندازه نمایش
              </div>

              <div className="flex gap-1 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-background)] p-1">
                {Object.entries(DEVICES).map(([id, title]) => (
                  <button
                    key={id}
                    type="button"
                    title={title}
                    onClick={() => setDevice(id)}
                    className={`rounded-md px-3 py-2 text-sm ${
                      device === id
                        ? "bg-[var(--theme-surface)] shadow"
                        : ""
                    }`}
                  >
                    {id === "desktop"
                      ? "🖥"
                      : id === "tablet"
                      ? "💻"
                      : "📱"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[var(--theme-radius-large)] border border-[var(--theme-border)]">
            <Preview
              theme={theme}
              storeName={storeName}
              slogan={slogan}
              page={page}
              device={device}
              activeHighlight={activeHighlight}
            />
          </div>
        </section>

        {/* SETTINGS */}
        <aside className="order-3">
                    {panel === "store" && (
            <StoreSettings
              Section={Section}
              Choice={Choice}
              storeName={storeName}
              setStoreName={setStoreName}
              slogan={slogan}
              setSlogan={setSlogan}
              theme={theme}
              changeWidth={changeWidth}
              changeTypography={changeTypography}
            />
          )}
          {panel === "design" && (
            <DesignSettings
              Section={Section}
              Choice={Choice}
              COLOR_FIELDS={COLOR_FIELDS}
              theme={theme}
              changeColor={changeColor}
              changeShape={changeShape}
              changeComponent={changeComponent}
              showHighlight={showHighlight}
            />
          )}
        </aside>
      </div>
    </main>
  );
}
