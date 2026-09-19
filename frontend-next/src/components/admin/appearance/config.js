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

export { PAGES, DEVICES, PRESETS, HIGHLIGHT_MAP, COLOR_FIELDS };