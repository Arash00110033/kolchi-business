export const API_ACCESS_META = {
  products: {
    labelKey: "adminOwner.permissionProducts",
    operations: ["list", "create", "update", "delete"],
  },
  categories: {
    labelKey: "adminOwner.permissionCategories",
    operations: ["list", "create", "update", "delete"],
  },
  inventory: {
    labelKey: "adminOwner.permissionInventory",
    operations: ["list", "view"],
  },
  orders: {
    labelKey: "adminOwner.permissionOrders",
    operations: ["list", "view", "update"],
  },
  members: {
    labelKey: "adminOwner.permissionMembers",
    operations: ["list", "manage"],
  },
  appearance: {
    labelKey: "adminOwner.permissionAppearance",
    operations: ["view", "update"],
  },
  store_settings: {
    labelKey: "adminOwner.permissionStoreSettings",
    operations: ["view", "update"],
  },
};

export const PERMISSION_META = [
  {
    code: "products",
    label: "Products",
    labelKey: "adminOwner.permissionProducts",
  },
  {
    code: "categories",
    label: "Categories",
    labelKey: "adminOwner.permissionCategories",
  },
  {
    code: "inventory",
    label: "Inventory",
    labelKey: "adminOwner.permissionInventory",
  },
  {
    code: "orders",
    label: "Orders",
    labelKey: "adminOwner.permissionOrders",
  },
  {
    code: "members",
    label: "Members",
    labelKey: "adminOwner.permissionMembers",
  },
  {
    code: "appearance",
    label: "Appearance",
    labelKey: "adminOwner.permissionAppearance",
  },
  {
    code: "store_settings",
    label: "Store Settings",
    labelKey: "adminOwner.permissionStoreSettings",
  },
];

export function getList(data) {
  if (Array.isArray(data)) {
    return data;
  }

  return data?.results || [];
}

export function getInitials(member) {
  const value =
    member?.username ||
    member?.email ||
    String(member?.user_id || "?");

  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}