export const DEFAULT_STORE_ID = 1;

export function normalizeStoreId(value) {
  const numericId = Number(value);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    return null;
  }

  return numericId;
}
