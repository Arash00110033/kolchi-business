import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useTheme } from "@/theme/ThemeProvider";
import { DEFAULT_THEME } from "@/theme/tokens";

const PAGES = {
  home: "خانه",
  product: "محصول",
  cart: "سبد خرید",
};

const DEVICES = {
  desktop: "دسکتاپ",
  tablet: "تبلت",
  mobile: "موبایل",
};

const PRESETS = {
  coffee: {
    title: "Coffee",
    description: "گرم، صمیمی و مناسب فروشگاه‌های کلاسیک",
    colors: {
      primary: "var(--theme-primary)",
      primaryHover: "#3b241d",
      secondary: "#bd884d",
      background: "#f7f3ee",
      surface: "#ffffff",
      surfaceMuted: "#fffdfa",
      foreground: "var(--theme-foreground)",
      border: "#e6e0da",
      muted: "var(--theme-muted)",
      hero: "var(--theme-primary)",
    },
    radius: "20px",
    cardStyle: "soft",
    buttonStyle: "solid",
  },

  minimal: {
    title: "Minimal",
    description: "ساده، تمیز و مدرن با تمرکز روی محصول",
    colors: {
      primary: "#18181b",
      primaryHover: "#000000",
      secondary: "#71717a",
      background: "#f8f8f7",
      surface: "#ffffff",
      surfaceMuted: "#fafaf9",
      foreground: "#18181b",
      border: "#e4e4e7",
      muted: "#71717a",
      hero: "#18181b",
    },
    radius: "14px",
    cardStyle: "flat",
    buttonStyle: "solid",
  },

  bold: {
    title: "Bold",
    description: "جسور، پرانرژی و مناسب برندهای جوان",
    colors: {
      primary: "#b91c1c",
      primaryHover: "#991b1b",
      secondary: "#ef4444",
      background: "#fafafa",
      surface: "#ffffff",
      surfaceMuted: "#f4f4f5",
      foreground: "#18181b",
      border: "#e4e4e7",
      muted: "#71717a",
      hero: "#b91c1c",
    },
    radius: "18px",
    cardStyle: "soft",
    buttonStyle: "solid",
  },

  ocean: {
    title: "Ocean",
    description: "آبی، آرام و حرفه‌ای برای فروشگاه‌های مدرن",
    colors: {
      primary: "#0369a1",
      primaryHover: "#075985",
      secondary: "#06b6d4",
      background: "#f0f9ff",
      surface: "#ffffff",
      surfaceMuted: "#e0f2fe",
      foreground: "#082f49",
      border: "#bae6fd",
      muted: "#64748b",
      hero: "#0369a1",
    },
    radius: "18px",
    cardStyle: "soft",
    buttonStyle: "solid",
  },

  forest: {
    title: "Forest",
    description: "طبیعی، آرام و مناسب محصولات سبز و دست‌ساز",
    colors: {
      primary: "#166534",
      primaryHover: "#14532d",
      secondary: "#65a30d",
      background: "#f0fdf4",
      surface: "#ffffff",
      surfaceMuted: "#ecfdf5",
      foreground: "#14532d",
      border: "#bbf7d0",
      muted: "#64748b",
      hero: "#166534",
    },
    radius: "20px",
    cardStyle: "soft",
    buttonStyle: "solid",
  },

  sunset: {
    title: "Sunset",
    description: "گرم و چشمگیر با ترکیب نارنجی و قرمز",
    colors: {
      primary: "#ea580c",
      primaryHover: "#c2410c",
      secondary: "#f59e0b",
      background: "#fff7ed",
      surface: "#ffffff",
      surfaceMuted: "#ffedd5",
      foreground: "#431407",
      border: "#fed7aa",
      muted: "#78716c",
      hero: "#ea580c",
    },
    radius: "22px",
    cardStyle: "soft",
    buttonStyle: "solid",
  },

  lavender: {
    title: "Lavender",
    description: "نرم، متفاوت و مناسب برندهای خلاق",
    colors: {
      primary: "#7c3aed",
      primaryHover: "#6d28d9",
      secondary: "#c084fc",
      background: "#faf5ff",
      surface: "#ffffff",
      surfaceMuted: "#f3e8ff",
      foreground: "#3b0764",
      border: "#e9d5ff",
      muted: "#7c6f86",
      hero: "#7c3aed",
    },
    radius: "24px",
    cardStyle: "soft",
    buttonStyle: "solid",
  },

  midnight: {
    title: "Midnight",
    description: "تیره و لوکس برای تجربه متفاوت و حرفه‌ای",
    colors: {
      primary: "#6366f1",
      primaryHover: "#4f46e5",
      secondary: "#a78bfa",
      background: "#09090b",
      surface: "#18181b",
      surfaceMuted: "#27272a",
      foreground: "#fafafa",
      border: "#3f3f46",
      muted: "#a1a1aa",
      hero: "#18181b",
    },
    radius: "16px",
    cardStyle: "bordered",
    buttonStyle: "outline",
  },

  rose: {
    title: "Rose",
    description: "نرم و شیک برای برندهای ظریف و لوکس",
    colors: {
      primary: "#be123c",
      primaryHover: "#9f1239",
      secondary: "#fb7185",
      background: "#fff1f2",
      surface: "#ffffff",
      surfaceMuted: "#ffe4e6",
      foreground: "#4c0519",
      border: "#fecdd3",
      muted: "#78716c",
      hero: "#be123c",
    },
    radius: "24px",
    cardStyle: "soft",
    buttonStyle: "solid",
  },
};

const HIGHLIGHT_MAP = {
  primary: {
    label: "رنگ اصلی",
    description: "دکمه‌ها و عناصر اصلی فروشگاه",
  },
  primaryHover: {
    label: "رنگ حالت Hover",
    description: "رنگ دکمه‌ها و لینک‌ها هنگام قرار گرفتن نشانگر",
  },
  secondary: {
    label: "رنگ فرعی",
    description: "نشان‌ها و عناصر تأکیدی فروشگاه",
  },
  hero: {
    label: "رنگ Hero",
    description: "بخش اصلی و برجسته صفحه فروشگاه",
  },
  background: {
    label: "پس‌زمینه",
    description: "پس‌زمینه اصلی صفحات فروشگاه",
  },
  surface: {
    label: "سطح",
    description: "Header، کارت‌ها و سطوح اصلی",
  },
  surfaceMuted: {
    label: "سطح کم‌رنگ",
    description: "بخش‌های فرعی و نواحی آرام‌تر",
  },
  foreground: {
    label: "رنگ متن",
    description: "متن اصلی فروشگاه",
  },
  border: {
    label: "حاشیه",
    description: "خطوط دور کارت‌ها و اجزای فروشگاه",
  },
  muted: {
    label: "متن کم‌رنگ",
    description: "توضیحات و متن‌های فرعی",
  },
  radius: {
    label: "گردی گوشه‌ها",
    description: "گردی گوشه کارت‌ها، دکمه‌ها و اجزای فروشگاه",
  },
  cardStyle: {
    label: "سبک کارت",
    description: "ظاهر کارت‌های محصول",
  },
  buttonStyle: {
    label: "سبک دکمه",
    description: "ظاهر دکمه‌های فروشگاه",
  },
};
const COLOR_FIELDS = [
  ["primary", "رنگ اصلی", "دکمه‌ها، لینک‌ها و عناصر مهم"],
  ["primaryHover", "رنگ Hover", "رنگ دکمه هنگام قرار گرفتن موس"],
  ["secondary", "رنگ مکمل", "Badge، تأکیدها و جزئیات"],
  ["hero", "رنگ بخش شعار", "پس‌زمینه Hero و پیام اصلی صفحه"],
  ["background", "پس‌زمینه", "فضای اصلی اطراف محتوا"],
  ["surface", "سطح کارت‌ها", "کارت، منو و پنل‌های اصلی"],
  ["surfaceMuted", "سطح ملایم", "بخش‌های فرعی و پس‌زمینه‌های نرم"],
  ["foreground", "رنگ متن", "عنوان‌ها و متن‌های اصلی"],
  ["border", "رنگ حاشیه", "خطوط و مرز کارت‌ها"],
  ["muted", "متن کم‌رنگ", "توضیحات و متن‌های فرعی"],
];

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

function Preview({ theme, storeName, slogan, page, device, activeHighlight }) {
  const width =
    device === "mobile"
      ? "390px"
      : device === "tablet"
      ? "760px"
      : "100%";

  const cardStyle = theme.components?.cardStyle || "soft";
  const buttonStyle = theme.components?.buttonStyle || "solid";

  const cardClass =
    cardStyle === "flat"
      ? "border-transparent shadow-none"
      : cardStyle === "bordered"
      ? "border border-[var(--theme-border)] shadow-none"
      : "border border-[var(--theme-border)] shadow-md";

  const buttonClass =
    buttonStyle === "outline"
      ? "border-2 border-[var(--theme-primary)] bg-transparent text-[var(--theme-primary)]"
      : "bg-[var(--theme-primary)] text-white";

  const Product = ({ name, price }) => (
    <div
      className={`relative overflow-hidden ${cardClass}`}
      style={{
        borderRadius: theme.shape.radius,
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        outline:
          activeHighlight === "cardStyle" || activeHighlight === "radius"
            ? `3px solid ${theme.colors.primary}`
            : undefined,
        outlineOffset:
          activeHighlight === "cardStyle" || activeHighlight === "radius"
            ? "3px"
            : undefined,
        boxShadow:
          activeHighlight === "cardStyle" || activeHighlight === "radius"
            ? `0 0 0 7px ${theme.colors.primary}22`
            : undefined,
      }}
    >
      {(activeHighlight === "cardStyle" || activeHighlight === "radius") && (
        <span
          className="absolute right-3 top-3 z-20 rounded-full px-2 py-1 text-[10px] font-black shadow-md"
          style={{
            backgroundColor: theme.colors.primary,
            color: "#fff",
          }}
        >
          🎯 {activeHighlight === "cardStyle" ? "سبک کارت" : "Radius"}
        </span>
      )}

      <div
        className="h-32"
        style={{ backgroundColor: `${theme.colors.primary}18` }}
      />

      <div className="p-4">
        <div className="font-bold">{name}</div>

        <div
          className="mt-2 text-sm"
          style={{ color: theme.colors.muted }}
        >
          {price}
        </div>

        <button
          type="button"
          className={`mt-4 w-full rounded-[var(--theme-radius-small)] px-3 py-2 text-sm font-bold transition ${buttonClass}`}
          style={{
            backgroundColor:
              buttonStyle === "outline"
                ? "transparent"
                : theme.colors.primary,
            color:
              buttonStyle === "outline"
                ? theme.colors.primary
                : "#fff",
            borderColor: theme.colors.primary,
          }}
        >
          افزودن به سبد
        </button>
      </div>
    </div>
  );

  const previewStyle = {
    "--theme-primary": theme.colors.primary,
    "--theme-primary-hover": theme.colors.primaryHover,
    "--theme-secondary": theme.colors.secondary,
    "--theme-background": theme.colors.background,
    "--theme-surface": theme.colors.surface,
    "--theme-surface-muted": theme.colors.surfaceMuted,
    "--theme-foreground": theme.colors.foreground,
    "--theme-border": theme.colors.border,
    "--theme-muted": theme.colors.muted,
    "--theme-radius": theme.shape.radius,
    "--theme-radius-small": theme.shape.radiusSmall,
    "--theme-radius-large": theme.shape.radiusLarge,
    "--theme-max-width": theme.layout?.maxWidth || "1540px",
  };

  const previewButtonStyle = (keys = []) => ({
    backgroundColor:
      buttonStyle === "outline"
        ? "transparent"
        : theme.colors.primary,
    color:
      buttonStyle === "outline"
        ? theme.colors.primary
        : "#ffffff",
    border: `2px solid ${theme.colors.primary}`,
    borderRadius: theme.shape.radiusSmall,
    ...(keys.includes(activeHighlight)
      ? {
          outline: `3px solid ${theme.colors.secondary}`,
          outlineOffset: "4px",
          boxShadow: `0 0 0 8px ${theme.colors.secondary}26`,
        }
      : {}),
  });

  return (
    <div
      className="flex min-h-[680px] justify-center p-3"
      style={{ backgroundColor: "#e5e7eb" }}
    >
      <div
        className="min-h-[640px] overflow-hidden border shadow-xl transition-all"
        style={{
          ...previewStyle,
          width,
          maxWidth: "100%",
          borderRadius: theme.shape.radiusLarge,
          backgroundColor: theme.colors.background,
          color: theme.colors.foreground,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        {/* HEADER */}
        <div
          className="border-b px-5 py-4"
          style={{
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-lg font-black">{storeName}</div>
              <div
                className="text-xs"
                style={{ color: theme.colors.muted }}
              >
                {slogan}
              </div>
            </div>

            <div
              className="hidden gap-4 text-sm md:flex"
              style={{ color: theme.colors.muted }}
            >
              <span>خانه</span>
              <span>محصولات</span>
              <span>دسته‌بندی</span>
              <span>سبد 🛒</span>
            </div>
          </div>
        </div>

        {/* HOME */}
        {page === "home" && (
          <div className="p-5">
            <div
              className="p-8 text-white"
              style={{
                backgroundColor: theme.colors.hero,
                borderRadius: theme.shape.radiusLarge,
              }}
            >
              <div className="mb-2 text-xs opacity-75">
                فروشگاه شما • Preview
              </div>

              <h1 className="text-3xl font-black">
                تجربه‌ای که مشتری یادش می‌ماند
              </h1>

              <p className="mt-3 max-w-xl text-sm opacity-85">
                این بخش با رنگ «بخش شعار» کنترل می‌شود.
              </p>

              <button
                type="button"
                className="mt-6 px-5 py-3 font-bold transition"
                style={previewButtonStyle(["primary", "buttonStyle"])}
              >
                مشاهده محصولات
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Product name="محصول اول" price="۱,۲۵۰,۰۰۰ تومان" />
              <Product name="محصول دوم" price="۸۹۰,۰۰۰ تومان" />
              <Product name="محصول سوم" price="۲,۴۰۰,۰۰۰ تومان" />
            </div>

            <div
              className="mt-6 rounded-[var(--theme-radius)] p-5 text-center"
              style={{
                backgroundColor: theme.colors.surfaceMuted,
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              <div className="font-bold">یک بخش محتوایی نمونه</div>
              <div
                className="mt-2 text-sm"
                style={{ color: theme.colors.muted }}
              >
                برای نمایش تفاوت Surface و Surface Muted
              </div>
            </div>
          </div>
        )}

        {/* PRODUCT */}
        {page === "product" && (
          <div className="grid gap-6 p-5 md:grid-cols-2">
            <div
              className="min-h-80"
              style={{
                backgroundColor: `${theme.colors.primary}18`,
                borderRadius: theme.shape.radiusLarge,
              }}
            />

            <div className="self-center">
              <span
                className="inline-block rounded-full px-3 py-1 text-xs font-bold"
                style={{
                  backgroundColor: `${theme.colors.secondary}25`,
                  color: theme.colors.foreground,
                }}
              >
                موجود
              </span>

              <h1 className="mt-4 text-3xl font-black">
                نام محصول نمونه
              </h1>

              <p
                className="mt-3 text-sm"
                style={{ color: theme.colors.muted }}
              >
                توضیحات محصول، ویژگی‌ها و اطلاعات مورد نیاز مشتری.
              </p>

              <div className="mt-5 text-2xl font-black">
                ۱,۸۹۰,۰۰۰ تومان
              </div>

              <button
                type="button"
                className="mt-6 w-full px-5 py-3 font-bold transition"
                style={previewButtonStyle(["primary", "buttonStyle"])}
              >
                افزودن به سبد خرید
              </button>
            </div>
          </div>
        )}

        {/* CART */}
        {page === "cart" && (
          <div className="mx-auto max-w-3xl p-5">
            <h1 className="text-2xl font-black">سبد خرید</h1>

            <div
              className={`mt-5 p-5 ${cardClass}`}
              style={{
                borderRadius: theme.shape.radius,
                backgroundColor: theme.colors.surface,
              }}
            >
              <div
                className="flex items-center justify-between pb-4"
                style={{
                  borderBottom: `1px solid ${theme.colors.border}`,
                }}
              >
                <span className="font-bold">محصول نمونه</span>
                <span>۱,۸۹۰,۰۰۰ تومان</span>
              </div>

              <div className="mt-5 flex items-center justify-between font-black">
                <span>مجموع</span>
                <span>۱,۸۹۰,۰۰۰ تومان</span>
              </div>

              <button
                type="button"
                className="mt-5 w-full px-5 py-3 font-bold transition"
                style={previewButtonStyle(["primary", "buttonStyle"])}
              >
                ادامه پرداخت
              </button>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div
          className="mt-5 border-t px-5 py-5 text-center text-xs"
          style={{
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surfaceMuted,
            color: theme.colors.muted,
          }}
        >
          {storeName} • همه حقوق محفوظ است
        </div>
      </div>
    </div>
  );
}

export default function Appearance() {
  const router = useRouter();
  const { theme: liveTheme } = useTheme();

  const [draftTheme, setDraftTheme] = useState(() =>
    normalizeTheme(liveTheme)
  );

  const [storeName, setStoreName] = useState("فروشگاه من");
  const [slogan, setSlogan] = useState("فروشگاهی که برای شما ساخته شده");

  const [page, setPage] = useState("home");
  const [device, setDevice] = useState("desktop");
  const [panel, setPanel] = useState("design");

  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [presetName, setPresetName] = useState("custom");
  const [activeHighlight, setActiveHighlight] = useState(null);
  function showHighlight(key) {
    setActiveHighlight(key);

    window.setTimeout(() => {
      setActiveHighlight((current) =>
        current === key ? null : current
      );
    }, 2200);
  }

  const theme = draftTheme;

  const snapshot = useMemo(
    () => clone(draftTheme),
    [draftTheme]
  );

  function updateTheme(next) {
    setHistory((items) => [...items.slice(-19), snapshot]);
    setFuture([]);
    setDraftTheme(normalizeTheme(next));
    setPresetName("custom");
  }

  function changeColor(key, value) {
    if (!/^#[0-9a-fA-F]{6}$/.test(value)) return;

    updateTheme({
      ...theme,
      colors: {
        ...theme.colors,
        [key]: value,
      },
    });
  }

  function changeShape(key, value) {
    updateTheme({
      ...theme,
      shape: {
        ...theme.shape,
        [key]: value,
      },
    });
  }

  function changeComponent(key, value) {
    updateTheme({
      ...theme,
      components: {
        ...theme.components,
        [key]: value,
      },
    });
  }

  function changeTypography(value) {
    updateTheme({
      ...theme,
      typography: {
        ...theme.typography,
        fontFamily: value,
      },
    });
  }

  function changeWidth(value) {
    updateTheme({
      ...theme,
      layout: {
        ...theme.layout,
        maxWidth: value,
      },
    });
  }

  function undo() {
    if (!history.length) return;

    const previous = history[history.length - 1];

    setFuture((items) => [snapshot, ...items]);
    setHistory((items) => items.slice(0, -1));
    setDraftTheme(previous);
    setPresetName("custom");
  }

  function redo() {
    if (!future.length) return;

    const next = future[0];

    setHistory((items) => [...items, snapshot]);
    setFuture((items) => items.slice(1));
    setDraftTheme(next);
    setPresetName("custom");
  }

  function applyPreset(name) {
    const preset = PRESETS[name];

    const next = normalizeTheme({
      ...theme,
      colors: {
        ...theme.colors,
        ...preset.colors,
      },
      shape: {
        ...theme.shape,
        radius: preset.radius,
      },
      components: {
        ...theme.components,
        cardStyle: preset.cardStyle,
        buttonStyle: preset.buttonStyle,
      },
    });

    setHistory((items) => [...items.slice(-19), snapshot]);
    setFuture([]);
    setDraftTheme(next);
    setPresetName(name);
  }

  function reset() {
    updateTheme(clone(DEFAULT_THEME));
    setStoreName("فروشگاه من");
    setSlogan("فروشگاهی که برای شما ساخته شده");
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
            <>
              <Section
                title="اطلاعات فروشگاه"
                description="نام و شعار در Header فروشگاه Preview نمایش داده می‌شوند."
              >
                <label className="block text-sm font-bold">
                  نام فروشگاه
                </label>

                <input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="mt-2 w-full rounded-xl border bg-transparent px-3 py-2 outline-none"
                  maxLength={80}
                />

                <label className="mt-4 block text-sm font-bold">
                  شعار فروشگاه
                </label>

                <input
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="mt-2 w-full rounded-xl border bg-transparent px-3 py-2 outline-none"
                  maxLength={120}
                />
              </Section>

              <Section
                title="عرض محتوا"
                description="مشخص می‌کند فروشگاه روی نمایشگرهای بزرگ چقدر کشیده شود."
              >
                <div className="space-y-2">
                  {[
                    ["1180px", "Compact", "جمع‌وجور"],
                    ["1340px", "Balanced", "متعادل"],
                    ["1540px", "Wide", "پهن و مدرن"],
                  ].map(([value, title, desc]) => (
                    <Choice
                      key={value}
                      title={title}
                      description={desc}
                      active={theme.layout.maxWidth === value}
                      onClick={() => changeWidth(value)}
                    />
                  ))}
                </div>
              </Section>

              <Section
                title="فونت"
                description="فونت تمام Preview را کنترل می‌کند."
              >
                <select
                  value={theme.typography.fontFamily}
                  onChange={(e) => changeTypography(e.target.value)}
                  className="w-full rounded-xl border bg-transparent px-3 py-3"
                >
                  <option value="Arial, Helvetica, sans-serif">
                    Arial
                  </option>
                  <option value="Tahoma, Arial, sans-serif">
                    Tahoma
                  </option>
                  <option value="Verdana, Arial, sans-serif">
                    Verdana
                  </option>
                  <option value="Georgia, serif">
                    Georgia
                  </option>
                </select>
              </Section>
            </>
          )}

          {panel === "presets" && (
            <Section
              title="قالب‌های آماده"
              description="قالب فقط یک نقطه شروع است؛ بعد از انتخاب می‌توانی همه جزئیاتش را تغییر بدهی."
            >
              <div className="space-y-2">
                {Object.entries(PRESETS).map(([id, preset]) => (
                  <Choice
                    key={id}
                    title={preset.title}
                    description={preset.description}
                    active={presetName === id}
                    onClick={() => applyPreset(id)}
                  >
                    <div className="mt-3 flex gap-1">
                      <span
                        className="h-6 flex-1 rounded-md"
                        style={{
                          backgroundColor: preset.colors.primary,
                        }}
                      />
                      <span
                        className="h-6 w-8 rounded-md"
                        style={{
                          backgroundColor: preset.colors.secondary,
                        }}
                      />
                      <span
                        className="h-6 w-8 rounded-md border"
                        style={{
                          backgroundColor: preset.colors.background,
                        }}
                      />
                    </div>
                  </Choice>
                ))}

                <Choice
                  title="Custom"
                  description="تنظیمات دستی فعلی شما"
                  active={presetName === "custom"}
                  onClick={() => setPresetName("custom")}
                />
              </div>
            </Section>
          )}

          {panel === "design" && (
            <>
              <Section
                title="رنگ‌ها"
                description="هر رنگ دقیقاً یک کاربرد مشخص دارد. تغییر را هم‌زمان در Preview ببین."
              >
                <div className="space-y-4">
                  {COLOR_FIELDS.map(([key, title, description]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold">
                            {title}
                          </div>
                          <div className="text-[10px] leading-5 text-[var(--theme-muted)]">
                            {description}
                          </div>
                        </div>

                        <input
                          type="color"
                          value={theme.colors[key]}
                          onFocus={() => showHighlight(key)}
                          onChange={(e) =>
                            changeColor(key, e.target.value)
                          }
                          className="h-10 w-10 cursor-pointer rounded-lg border p-0"
                        />
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <div
                          className="h-8 w-8 rounded-lg border"
                          style={{
                            backgroundColor: theme.colors[key],
                          }}
                        />

                        <input
                          value={theme.colors[key]}
                          onChange={(e) =>
                            changeColor(key, e.target.value)
                          }
                          className="w-full rounded-lg border bg-transparent px-3 py-2 font-mono text-xs uppercase"
                          maxLength={7}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              <Section
                title="گردی گوشه‌ها"
                description="هرچه بیشتر باشد، ظاهر نرم‌تر و دوستانه‌تر می‌شود."
              >
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["8px", "Sharp", "تیز و رسمی"],
                    ["14px", "Modern", "مدرن"],
                    ["20px", "Soft", "نرم"],
                    ["28px", "Round", "گرد و دوستانه"],
                  ].map(([value, title, desc]) => (
                    <Choice
                      key={value}
                      title={title}
                      description={desc}
                      active={theme.shape.radius === value}
                      onClick={() => changeShape("radius", value)}
                    >
                      <div
                        className="mt-3 h-8 border-2 border-[var(--theme-primary)]"
                        style={{ borderRadius: value }}
                      />
                    </Choice>
                  ))}
                </div>
              </Section>

              <Section
                title="کارت محصول"
                description="نحوه نمایش قاب و سایه محصولات."
              >
                <div className="space-y-2">
                  <Choice
                    title="Soft"
                    description="سایه نرم و ظاهر فروشگاهی"
                    active={theme.components.cardStyle === "soft"}
                    onClick={() => changeComponent("cardStyle", "soft")}
                  />
                  <Choice
                    title="Flat"
                    description="بدون سایه، سبک و مینیمال"
                    active={theme.components.cardStyle === "flat"}
                    onClick={() => changeComponent("cardStyle", "flat")}
                  />
                  <Choice
                    title="Bordered"
                    description="حاشیه مشخص و رسمی"
                    active={theme.components.cardStyle === "bordered"}
                    onClick={() =>
                      changeComponent("cardStyle", "bordered")
                    }
                  />
                </div>
              </Section>

              <Section
                title="دکمه‌ها"
                description="ظاهر دکمه‌های اصلی مثل افزودن به سبد و پرداخت."
              >
                <div className="space-y-2">
                  <Choice
                    title="Solid"
                    description="پررنگ و واضح"
                    active={theme.components.buttonStyle === "solid"}
                    onClick={() => {
                      changeComponent("buttonStyle", "solid");
                      showHighlight("buttonStyle");
                    }}
                  />
                  <Choice
                    title="Outline"
                    description="سبک‌تر و مینیمال"
                    active={theme.components.buttonStyle === "outline"}
                    onClick={() => {
                      changeComponent("buttonStyle", "outline");
                      showHighlight("buttonStyle");
                    }}
                  />
                </div>
              </Section>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
