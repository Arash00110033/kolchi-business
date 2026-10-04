function containsPersian(value) {
  return typeof value === "string" && /[\u0600-\u06FF]/.test(value);
}

function flattenErrorValue(value) {
  if (Array.isArray(value)) {
    return value.flatMap(flattenErrorValue);
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap(flattenErrorValue);
  }

  return typeof value === "string" ? [value] : [];
}

export function getLocalizedErrorMessage(error, t, fallbackKey) {
  const data = error?.data;

  const candidates = [
    ...(containsPersian(data?.detail) ? [data.detail] : []),
    ...(containsPersian(data) ? [data] : []),
    ...flattenErrorValue(data)
      .filter((value) => containsPersian(value)),
    ...(containsPersian(error?.message) ? [error.message] : []),
  ];

  const message = candidates.find(
    (value) => typeof value === "string" && value.trim()
  );

  return message?.trim() || t(fallbackKey);
}