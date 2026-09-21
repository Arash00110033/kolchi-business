import { DEFAULT_THEME } from "./tokens";
import { THEME_PRESETS } from "./presets";

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function deepMerge(base, override) {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return override === undefined ? base : override;
  }

  const result = {
    ...base,
  };

  Object.entries(override).forEach(([key, value]) => {
    const baseValue = result[key];

    if (isPlainObject(baseValue) && isPlainObject(value)) {
      result[key] = deepMerge(baseValue, value);
      return;
    }

    result[key] = value;
  });

  return result;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getPreset(name) {
  return THEME_PRESETS[name] || {};
}

export function resolveTheme({
  presetName,
  overrides = {},
} = {}) {
  const preset = getPreset(presetName);

  const resolved = deepMerge(
    DEFAULT_THEME,
    preset
  );

  return deepMerge(
    resolved,
    overrides
  );
}

export function createThemeOverrides(baseTheme, nextTheme) {
  if (!isPlainObject(baseTheme) || !isPlainObject(nextTheme)) {
    return {};
  }

  const overrides = {};

  Object.entries(nextTheme).forEach(([key, value]) => {
    const baseValue = baseTheme[key];

    if (isPlainObject(baseValue) && isPlainObject(value)) {
      const nested = createThemeOverrides(baseValue, value);

      if (Object.keys(nested).length > 0) {
        overrides[key] = nested;
      }

      return;
    }

    if (JSON.stringify(baseValue) !== JSON.stringify(value)) {
      overrides[key] = value;
    }
  });

  return overrides;
}

export function normalizeTheme(theme) {
  return resolveTheme({
    overrides: theme || {},
  });
}

export function getThemePreset(name) {
  return clone(getPreset(name));
}
