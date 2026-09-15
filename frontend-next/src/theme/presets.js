import { DEFAULT_THEME } from "./tokens";

export const THEME_PRESETS = {
  coffee: {
    ...DEFAULT_THEME,
    colors: {
      ...DEFAULT_THEME.colors,
      background: "#f7f3ee",
      surface: "#ffffff",
      surfaceMuted: "#fffdfa",
      foreground: "#171717",
      primary: "#171717",
      primaryHover: "#000000",
      secondary: "#bd884d",
    },
  },

  minimal: {
    ...DEFAULT_THEME,
    colors: {
      ...DEFAULT_THEME.colors,
      background: "#f8f8f7",
      surface: "#ffffff",
      surfaceMuted: "#fafaf9",
      foreground: "#18181b",
      primary: "#18181b",
      primaryHover: "#000000",
      secondary: "#71717a",
    },
    shape: {
      ...DEFAULT_THEME.shape,
      radius: "14px",
      radiusSmall: "8px",
      radiusLarge: "20px",
    },
  },

  bold: {
    ...DEFAULT_THEME,
    colors: {
      ...DEFAULT_THEME.colors,
      background: "#fafafa",
      surface: "#ffffff",
      surfaceMuted: "#f4f4f5",
      foreground: "#18181b",
      primary: "#b91c1c",
      primaryHover: "#991b1b",
      secondary: "#ef4444",
    },
    shape: {
      ...DEFAULT_THEME.shape,
      radius: "18px",
      radiusSmall: "10px",
      radiusLarge: "26px",
    },
  },
};



