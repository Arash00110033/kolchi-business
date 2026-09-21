import { useMemo, useState } from "react";
import { THEME_PRESETS } from "@/theme/presets";

export default function useAppearanceEditor({
  liveTheme,
  DEFAULT_THEME,

  clone,
  normalizeTheme,
}) {
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

  const theme = draftTheme;
  const snapshot = useMemo(() => clone(draftTheme), [draftTheme]);

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
    const preset = THEME_PRESETS[name];
    if (!preset) return;

    const next = normalizeTheme({
      ...theme,
      colors: {
        ...theme.colors,
        ...(preset.colors || {}),
      },
      typography: {
        ...theme.typography,
        ...(preset.typography || {}),
      },
      shape: {
        ...theme.shape,
        ...(preset.shape || {}),
      },
      layout: {
        ...theme.layout,
        ...(preset.layout || {}),
      },
      components: {
        ...theme.components,
        ...(preset.components || {}),
      },
      header: {
        ...theme.header,
        ...(preset.header || {}),
      },
      hero: {
        ...theme.hero,
        ...(preset.hero || {}),
      },
      background: {
        ...theme.background,
        ...(preset.background || {}),
      },
      assets: {
        ...theme.assets,
        ...(preset.assets || {}),
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

  return {
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
  };
}