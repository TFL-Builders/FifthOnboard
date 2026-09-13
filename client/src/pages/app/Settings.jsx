import { useEffect, useState } from "react";
import { PageHeading } from "../../Components/PageHeading";
import { Select } from "../../Components/Select";
import { Button } from "../../Components/Button";
import { Avatar } from "../../Components/Avatar";
import { ErrorBanner } from "../../Components/ErrorBanner";
import { Toast } from "../../Components/Toast";
import { useAuthedApi } from "../../hooks/useAuthedApi";
import { getSettings, updateSettings } from "../../lib/settingsApi";
import { listUsers, DEPARTMENT_LABELS, departmentLabelToValue } from "../../lib/usersApi";
import { getErrorMessage } from "../../lib/getErrorMessage";

const ASSIGNMENT_LABELS = DEPARTMENT_LABELS.filter((label) => label !== "Manager");

export const Settings = () => {
  const authedApi = useAuthedApi();
  const [users, setUsers] = useState([]);
  const [departmentMap, setDepartmentMap] = useState({});
  const [managerId, setManagerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading indicator for a real fetch, not derivable state
    setLoading(true);
    setLoadError("");
    Promise.all([getSettings(authedApi), listUsers(authedApi, { status: "active" })])
      .then(([settings, activeUsers]) => {
        setUsers(activeUsers);
        const map = {};
        ASSIGNMENT_LABELS.forEach((label) => {
          const value = departmentLabelToValue(label);
          map[value] = settings.defaultDepartmentMap?.[value]?.id ?? "";
        });
        setDepartmentMap(map);
        setManagerId(settings.defaultManagerId?.id ?? "");
      })
      .catch((err) => setLoadError(getErrorMessage(err).message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(authedApi, {
        defaultDepartmentMap: departmentMap,
        defaultManagerId: managerId || null,
      });
      setToastMessage("Settings saved.");
    } catch (err) {
      setLoadError(getErrorMessage(err).message);
    } finally {
      setSaving(false);
    }
  };

  const userOptions = [{ value: "", label: "Unassigned" }, ...users.map((u) => ({ value: u.id, label: u.name }))];

  return (
    <div className="p-8">
      <PageHeading
        title="Settings"
        subtitle="Choose who each department's tasks are assigned to by default when an onboarding launches."
      />

      {!loading && <ErrorBanner message={loadError} />}

      {loading ? (
        <div className="text-[14px] text-[#64748B]">Loading...</div>
      ) : (
        <div className="flex flex-col gap-6 max-w-xl">
          <div className="border border-border rounded-2xl p-5 flex flex-col gap-4 bg-white">
            <div className="text-[16px] font-medium">Default department assignees</div>
            {ASSIGNMENT_LABELS.map((label) => {
              const value = departmentLabelToValue(label);
              const currentUserId = departmentMap[value] ?? "";
              const currentUser = users.find((u) => u.id === currentUserId);
              return (
                <div key={value} className="flex items-center gap-3">
                  <Avatar name={currentUser?.name ?? "?"} size={32} />
                  <div className="flex-1">
                    <Select
                      label={label}
                      id={`settings-dept-${value}`}
                      value={currentUserId}
                      onChange={(e) => setDepartmentMap((prev) => ({ ...prev, [value]: e.target.value }))}
                      options={userOptions}
                      noMargin
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border border-border rounded-2xl p-5 flex flex-col gap-4 bg-white">
            <div className="text-[16px] font-medium">Default supervisor</div>
            <div className="flex items-center gap-3">
              <Avatar name={users.find((u) => u.id === managerId)?.name ?? "?"} size={32} />
              <div className="flex-1">
                <Select
                  label="Manager"
                  id="settings-default-manager"
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  options={userOptions}
                  noMargin
                />
              </div>
            </div>
          </div>

          <Button variant="primary" type="button" onClick={handleSave} disabled={saving} className="w-auto px-6 self-start">
            {saving ? "Saving..." : "Save settings"}
          </Button>
        </div>
      )}

      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </div>
  );
};
