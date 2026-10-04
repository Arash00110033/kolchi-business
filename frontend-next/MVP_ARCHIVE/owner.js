import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

import useAuth from "@/hooks/useAuth";
import { useI18n } from "@/i18n";
import adminService from "@/services/admin.service";
import authService from "@/services/auth.service";

import { DEFAULT_THEME } from "@/theme/tokens";
import { resolveTheme } from "@/theme/resolver";

import OwnerHero from "@/components/admin/owner/OwnerHero";
import BackToStoreButton from "@/components/common/BackToStoreButton";
import OwnerStoreSelector from "@/components/admin/owner/OwnerStoreSelector";
import OwnerStats from "@/components/admin/owner/OwnerStats";
import OwnerTeamPanel from "@/components/admin/owner/OwnerTeamPanel";
import OwnerMemberForm from "@/components/admin/owner/OwnerMemberForm";
import OwnerPermissionMatrix from "@/components/admin/owner/OwnerPermissionMatrix";
import OwnerAccessPreview from "@/components/admin/owner/OwnerAccessPreview";
import OwnerApiAccessMap from "@/components/admin/owner/OwnerApiAccessMap";
import OwnerStorePreview from "@/components/admin/owner/OwnerStorePreview";

import { getList } from "@/components/admin/owner/owner.constants";

export default function OwnerPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useI18n();

  const [loading, setLoading] = useState(true);
  const [savingMember, setSavingMember] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);

  const [stores, setStores] = useState([]);
  const [storeId, setStoreId] = useState("");

  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const [previewStore, setPreviewStore] = useState(null);
  const [previewTheme, setPreviewTheme] = useState(DEFAULT_THEME);

  const [newUserId, setNewUserId] = useState("");
  const [newRole, setNewRole] = useState("editor");

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const token = useMemo(() => {
    try {
      return authService.getStoredAccessToken?.() || null;
    } catch {
      return null;
    }
  }, []);

  const selectedMember = useMemo(
    () =>
      members.find(
        (member) =>
          String(member.id ?? member.user_id) ===
          String(selectedMemberId)
      ) || null,
    [members, selectedMemberId]
  );

  const selectedStore = useMemo(
    () =>
      stores.find(
        (store) => String(store.id) === String(storeId)
      ) || null,
    [stores, storeId]
  );

  const clearMessages = () => {
    setError("");
    setNotice("");
  };

  const loadMembers = async (activeStoreId) => {
    if (!activeStoreId) {
      setMembers([]);
      return;
    }

    try {
      const response = await adminService.getMembers(
        activeStoreId,
        token
      );

      setMembers(getList(response));
    } catch {
      setMembers([]);
      setError(t("adminOwner.loadMembersError"));
    }
  };

  const loadPreviewStore = async (activeStoreId) => {
    if (!activeStoreId) {
      setPreviewStore(null);
      setPreviewTheme(DEFAULT_THEME);
      return;
    }

    try {
      const response = await adminService.getStore(
        activeStoreId,
        token
      );

      const store = response?.data || response;

      setPreviewStore(store);

      const resolved = resolveTheme(
        store?.theme_preset,
        store?.theme_overrides
      );

      setPreviewTheme(resolved || DEFAULT_THEME);
    } catch {
      setPreviewStore(null);
      setPreviewTheme(DEFAULT_THEME);
    }
  };

  useEffect(() => {
    let active = true;

    async function load() {
      clearMessages();
      setLoading(true);

      try {
        const response =
          await adminService.getAccessibleStores(token);

        const accessible = getList(response);

        const ownerStores = accessible.filter(
          (store) =>
            String(store.role || "").toLowerCase() === "owner"
        );

        if (!active) return;

        setStores(ownerStores);

        if (ownerStores.length === 0) {
          setStoreId("");
          setMembers([]);
          return;
        }

        const initialStore =
          ownerStores.find(
            (store) => String(store.id) === String(storeId)
          ) || ownerStores[0];

        setStoreId(String(initialStore.id));

        await Promise.all([
          loadMembers(initialStore.id),
          loadPreviewStore(initialStore.id),
        ]);
      } catch {
        if (!active) return;
        setError(t("adminOwner.loadError"));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [token]);

  const handleStoreChange = async (nextStoreId) => {
    clearMessages();

    setStoreId(String(nextStoreId));
    setSelectedMemberId(null);
    setSelectedPermissions([]);

    await Promise.all([
      loadMembers(nextStoreId),
      loadPreviewStore(nextStoreId),
    ]);
  };

  const handleSelectMember = async (member) => {
    clearMessages();

    const memberId = member.id ?? member.user_id;

    setSelectedMemberId(memberId);
    setSelectedPermissions([]);

    try {
      const response =
        await adminService.getMemberPermissions(
          storeId,
          memberId,
          token
        );

      const permissions =
        response?.permissions ||
        response?.data?.permissions ||
        response?.results ||
        [];

      setSelectedPermissions(
        Array.isArray(permissions)
          ? permissions
          : []
      );
    } catch {
      setError(t("adminOwner.permissionsLoadError"));
    }
  };

  const togglePermission = (permission) => {
    setSelectedPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedMember) return;

    clearMessages();
    setSavingPermissions(true);

    try {
      const memberId =
        selectedMember.id ?? selectedMember.user_id;

      await adminService.updateMemberPermissions(
        storeId,
        memberId,
        selectedPermissions,
        token
      );

      setNotice(t("adminOwner.permissionsSaved"));
    } catch {
      setError(t("adminOwner.permissionsSaveError"));
    } finally {
      setSavingPermissions(false);
    }
  };

  const handleCreateMember = async (event) => {
    event.preventDefault();

    if (!storeId || !newUserId.trim()) {
      return;
    }

    clearMessages();
    setSavingMember(true);

    try {
      await adminService.createMember(
        storeId,
        {
          user_id: Number(newUserId.trim()),
          role: newRole,
        },
        token
      );

      setNewUserId("");
      setNewRole("editor");

      await loadMembers(storeId);

      setNotice(t("adminOwner.memberAdded"));
    } catch {
      setError(t("adminOwner.memberAddError"));
    } finally {
      setSavingMember(false);
    }
  };

  const handleRoleChange = async (member, role) => {
    clearMessages();

    try {
      const memberId = member.id ?? member.user_id;

      await adminService.updateMember(
        storeId,
        memberId,
        { role },
        token
      );

      await loadMembers(storeId);

      setNotice(t("adminOwner.roleSaved"));
    } catch {
      setError(t("adminOwner.roleSaveError"));
    }
  };

  const handleDeleteMember = async (member) => {
    const confirmed = window.confirm(
      `${t("adminMembers.remove")} ?`
    );

    if (!confirmed) return;

    clearMessages();

    try {
      const memberId = member.id ?? member.user_id;

      await adminService.deleteMember(
        storeId,
        memberId,
        token
      );

      if (
        String(selectedMemberId) ===
        String(memberId)
      ) {
        setSelectedMemberId(null);
        setSelectedPermissions([]);
      }

      await loadMembers(storeId);

      setNotice(t("adminOwner.memberRemoved"));
    } catch {
      setError(t("adminOwner.memberRemoveError"));
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl p-6">
        <div className="animate-pulse space-y-5">
          <div className="h-44 rounded-3xl bg-gray-200" />
          <div className="h-24 rounded-2xl bg-gray-200" />
          <div className="h-64 rounded-2xl bg-gray-200" />
        </div>
      </main>
    );
  }

  if (stores.length === 0) {
    return (
      <main className="mx-auto max-w-7xl p-6">
        <section className="rounded-3xl border border-black/10 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black">
            {t("adminOwner.accessDenied")}
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-gray-500">
            {t("adminOwner.ownerOnly")}
          </p>

          <div className="mt-6">
            <BackToStoreButton
              t={t}
              translationKey="adminDashboard.backToStore"
            />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <OwnerHero t={t} />

      {(error || notice) && (
        <section
          className={`rounded-2xl border p-4 text-sm font-bold ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {error || notice}
        </section>
      )}

      <OwnerStoreSelector
        t={t}
        stores={stores}
        storeId={storeId}
        selectedStore={selectedStore}
        onChange={handleStoreChange}
      />

      <OwnerStats
        t={t}
        store={selectedStore}
        members={members}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <OwnerTeamPanel
          t={t}
          members={members}
          selectedMemberId={selectedMemberId}
          onSelectMember={handleSelectMember}
          onRoleChange={handleRoleChange}
          onDeleteMember={handleDeleteMember}
        />

        <OwnerMemberForm
          t={t}
          userId={newUserId}
          role={newRole}
          saving={savingMember}
          onUserIdChange={setNewUserId}
          onRoleChange={setNewRole}
          onSubmit={handleCreateMember}
        />
      </div>

      <OwnerPermissionMatrix
        t={t}
        member={selectedMember}
        permissions={selectedPermissions}
        saving={savingPermissions}
        onToggle={togglePermission}
        onSave={handleSavePermissions}
      />

      <OwnerAccessPreview
        t={t}
        member={selectedMember}
        permissions={selectedPermissions}
      />

      <OwnerApiAccessMap t={t} />

      <OwnerStorePreview
        t={t}
        store={previewStore || selectedStore}
        theme={previewTheme}
      />
    </main>
  );
}
