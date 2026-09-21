import { DEFAULT_THEME } from "./tokens";

export const THEME_PRESETS = {
  coffee: {
    ...DEFAULT_THEME,
    meta: {
      title: "Coffee",
      description:
        "Classic coffee-inspired storefront with a warm and refined visual language.",
    },
    colors: {
      ...DEFAULT_THEME.colors,
      background: "#f7f3ee",
      surface: "#ffffff",
      surfaceMuted: "#fffdfa",
      primary: "#171717",
      primaryHover: "#3b241d",
      secondary: "#bd884d",
    },
    shape: {
      ...DEFAULT_THEME.shape,
      radius: "20px",
    },
    components: {
      ...DEFAULT_THEME.components,
      cardStyle: "soft",
      buttonStyle: "solid",
    },
  },

  minimal: {
    ...DEFAULT_THEME,
    meta: {
      title: "Minimal",
      description:
        "Clean, modern and restrained storefront with a minimal visual system.",
    },
    colors: {
      ...DEFAULT_THEME.colors,
      primary: "#18181b",
      primaryHover: "#000000",
      secondary: "#71717a",
      background: "#f8f8f7",
      surface: "#ffffff",
      surfaceMuted: "#fafaf9",
      foreground: "#18181b",
      muted: "#71717a",
    },
    shape: {
      ...DEFAULT_THEME.shape,
      radius: "14px",
    },
    components: {
      ...DEFAULT_THEME.components,
      cardStyle: "flat",
      buttonStyle: "solid",
    },
  },

  bold: {
    ...DEFAULT_THEME,
    meta: {
      title: "Bold",
      description:
        "Strong and expressive storefront designed for bold brands.",
    },
    colors: {
      ...DEFAULT_THEME.colors,
      primary: "#b91c1c",
      primaryHover: "#991b1b",
      secondary: "#ef4444",
      background: "#fafafa",
      surface: "#ffffff",
      surfaceMuted: "#f4f4f5",
      foreground: "#18181b",
      muted: "#71717a",
    },
    shape: {
      ...DEFAULT_THEME.shape,
      radius: "18px",
    },
    components: {
      ...DEFAULT_THEME.components,
      cardStyle: "soft",
      buttonStyle: "solid",
    },
  },

  ocean: {
    ...DEFAULT_THEME,
    meta: {
      title: "Ocean",
      description:
        "Calm blue storefront with a fresh and contemporary visual system.",
    },
    colors: {
      ...DEFAULT_THEME.colors,
      primary: "#0369a1",
      primaryHover: "#075985",
      secondary: "#06b6d4",
      background: "#f0f9ff",
      surface: "#ffffff",
      surfaceMuted: "#e0f2fe",
      foreground: "#082f49",
      muted: "#64748b",
    },
    shape: {
      ...DEFAULT_THEME.shape,
      radius: "18px",
    },
    components: {
      ...DEFAULT_THEME.components,
      cardStyle: "soft",
      buttonStyle: "solid",
    },
  },

  forest: {
    ...DEFAULT_THEME,
    meta: {
      title: "Forest",
      description:
        "Natural green storefront suited to organic and sustainable brands.",
    },
    colors: {
      ...DEFAULT_THEME.colors,
      primary: "#166534",
      primaryHover: "#14532d",
      secondary: "#65a30d",
      background: "#f0fdf4",
      surface: "#ffffff",
      surfaceMuted: "#ecfdf5",
      foreground: "#14532d",
      muted: "#64748b",
    },
    shape: {
      ...DEFAULT_THEME.shape,
      radius: "20px",
    },
    components: {
      ...DEFAULT_THEME.components,
      cardStyle: "soft",
      buttonStyle: "solid",
    },
  },

  sunset: {
    ...DEFAULT_THEME,
    meta: {
      title: "Sunset",
      description:
        "Warm orange storefront with an energetic and welcoming visual system.",
    },
    colors: {
      ...DEFAULT_THEME.colors,
      primary: "#ea580c",
      primaryHover: "#c2410c",
      secondary: "#f59e0b",
      background: "#fff7ed",
      surface: "#ffffff",
      surfaceMuted: "#ffedd5",
      foreground: "#431407",
      muted: "#78716c",
    },
    shape: {
      ...DEFAULT_THEME.shape,
      radius: "22px",
    },
    components: {
      ...DEFAULT_THEME.components,
      cardStyle: "soft",
      buttonStyle: "solid",
    },
  },

  lavender: {
    ...DEFAULT_THEME,
    meta: {
      title: "Lavender",
      description:
        "Soft purple storefront for creative and expressive brands.",
    },
    colors: {
      ...DEFAULT_THEME.colors,
      primary: "#7c3aed",
      primaryHover: "#6d28d9",
      secondary: "#c084fc",
      background: "#faf5ff",
      surface: "#ffffff",
      surfaceMuted: "#f3e8ff",
      foreground: "#3b0764",
      muted: "#7c6f86",
    },
    shape: {
      ...DEFAULT_THEME.shape,
      radius: "24px",
    },
    components: {
      ...DEFAULT_THEME.components,
      cardStyle: "soft",
      buttonStyle: "solid",
    },
  },

  midnight: {
    ...DEFAULT_THEME,
    meta: {
      title: "Midnight",
      description:
        "Dark and luxurious storefront with a strong premium visual language.",
    },
    colors: {
      ...DEFAULT_THEME.colors,
      primary: "#6366f1",
      primaryHover: "#4f46e5",
      secondary: "#a78bfa",
      background: "#09090b",
      surface: "#18181b",
      surfaceMuted: "#27272a",
      foreground: "#fafafa",
      muted: "#a1a1aa",
    },
    shape: {
      ...DEFAULT_THEME.shape,
      radius: "16px",
    },
    components: {
      ...DEFAULT_THEME.components,
      cardStyle: "bordered",
      buttonStyle: "outline",
    },
  },

  pink: {
    ...DEFAULT_THEME,
    meta: {
      title: "Pink",
      description:
        "Vibrant pink storefront with a bold and playful visual system.",
    },
    colors: {
      ...DEFAULT_THEME.colors,
      primary: "#ff00ff",
      primaryHover: "#cc00cc",
      secondary: "#ff66ff",
      background: "#fff0ff",
      surface: "#ffffff",
      surfaceMuted: "#ffe6ff",
      foreground: "#4a004a",
      muted: "#7a527a",
    },
    shape: {
      ...DEFAULT_THEME.shape,
      radius: "22px",
    },
    components: {
      ...DEFAULT_THEME.components,
      cardStyle: "soft",
      buttonStyle: "solid",
    },
  },
  rose: {
    ...DEFAULT_THEME,
    meta: {
      title: "Rose",
      description:
        "Soft rose storefront suited to elegant and lifestyle-focused brands.",
    },
    colors: {
      ...DEFAULT_THEME.colors,
      primary: "#be123c",
      primaryHover: "#9f1239",
      secondary: "#fb7185",
      background: "#fff1f2",
      surface: "#ffffff",
      surfaceMuted: "#ffe4e6",
      foreground: "#4c0519",
      muted: "#78716c",
    },
    shape: {
      ...DEFAULT_THEME.shape,
      radius: "24px",
    },
    components: {
      ...DEFAULT_THEME.components,
      cardStyle: "soft",
      buttonStyle: "solid",
    },
  },
};
