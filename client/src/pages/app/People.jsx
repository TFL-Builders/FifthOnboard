import { useEffect, useState } from "react";
import { UserX, Ban } from "lucide-react";
import { useAuthedApi } from "../../hooks/useAuthedApi";
import { useAuth } from "../../context/AuthContext";
import { listUsers, deleteUser, ROLE_LABELS, departmentValueToLabel } from "../../lib/usersApi";
import { listInvites, deleteInvite } from "../../lib/invitesApi";
import { getErrorMessage } from "../../lib/getErrorMessage";
import { ErrorBanner } from "../../Components/ErrorBanner";
import { ConfirmDialog } from "../../Components/ConfirmDialog";
import { Select } from "../../Components/Select";
import { Toast } from "../../Components/Toast";
import { InviteTeammate } from "../../Components/InviteTeammate";

const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));
const departmentSelectOptions = [
  { value: "hr", label: "HR" },
  { value: "manager", label: "Manager" },
  { value: "it", label: "IT" },
  { value: "finance", label: "Finance" },
  { value: "custom", label: "Custom" },
];

const avatarColors = ["bg-emerald-600", "bg-amber-700", "bg-fuchsia-700", "bg-sky-700", "bg-rose-700"];
const getAvatarColor = (name) => avatarColors[name.charCodeAt(0) % avatarColors.length];
const getInitials = (name) => {
  const parts = name.trim().split(" ");
  return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 1).toUpperCase();
};

const roleStyles = {
  admin: "bg-red-500/15 text-red-400",
  hr: "bg-sky-500/15 text-sky-400",
  manager: "bg-violet-500/15 text-violet-400",
  employee: "bg-teal-500/15 text-teal-400",
  task_owner: "bg-amber-500/15 text-amber-400",
};

const statusStyles = {
  active: "bg-emerald-500/15 text-emerald-400",
  disabled: "bg-red-500/15 text-red-400",
};

export const People = () => {
  const authedApi = useAuthedApi();
  const { user } = useAuth();
  const canManage = user?.role === "hr" || user?.role === "admin";
  const canInvite = canManage || user?.role === "manager";

  const [selected, setSelected] = useState("member");
  const [inviteModal, setInviteModal] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [status, setStatus] = useState("active");

  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const [disableTarget, setDisableTarget] = useState(null);
  const [reassignTo, setReassignTo] = useState("");
  const [disabling, setDisabling] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revoking, setRevoking] = useState(false);

  const loadMembers = () => {
    setLoading(true);
    setError("");
    listUsers(authedApi, {
      status,
      ...(selectedRole && { role: selectedRole }),
      ...(selectedDepartment && { department: selectedDepartment }),
    })
      .then(setMembers)
      .catch((err) => setError(getErrorMessage(err).message))
      .finally(() => setLoading(false));
  };

  const loadInvites = () => {
    setLoading(true);
    setError("");
    listInvites(authedApi)
      .then(setInvites)
      .catch((err) => setError(getErrorMessage(err).message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading indicator for a real fetch, not derivable state
    if (selected === "invite") loadInvites();
    else loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, status, selectedRole, selectedDepartment]);

  const filteredMembers = members.filter((member) => member.name.toLowerCase().includes(query.trim().toLowerCase()));
  const filteredInvites = invites.filter((invite) => invite.email.toLowerCase().includes(query.trim().toLowerCase()));

  const reassignCandidates = members.filter((m) => m.id !== disableTarget?.id && m.status !== "disabled");

  const handleDisable = async () => {
    if (!disableTarget) return;
    setDisabling(true);
    try {
      await deleteUser(authedApi, disableTarget.id, reassignTo || undefined);
      setToast(`${disableTarget.name} has been disabled.`);
      setDisableTarget(null);
      setReassignTo("");
      loadMembers();
    } catch (err) {
      setError(getErrorMessage(err).message);
    } finally {
      setDisabling(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setRevoking(true);
    try {
      await deleteInvite(authedApi, revokeTarget.id);
      setToast(`Invite to ${revokeTarget.email} revoked.`);
      setRevokeTarget(null);
      loadInvites();
    } catch (err) {
      setError(getErrorMessage(err).message);
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="p-8">
      <div className="introPeople flex justify-between items-center">
        <div className="pb-6">
          <div className="profile-settings text-[30px]">People</div>
          <div className="manage text-[16px] text-[#64748B]">Manage your team members and pending invites</div>
        </div>
        {canInvite && (
          <button
            type="button"
            className="InviteButton flex gap-2 justify-center items-center bg-primary rounded-md p-2 w-45 h-10 cursor-pointer"
            onClick={() => setInviteModal(true)}
          >
            <div className="text-white">Invite Teammate</div>
          </button>
        )}
      </div>

      <div className="px-1 pb-2">
        <ErrorBanner message={error} />
      </div>

      <div className="w-full border border-border rounded-md">
        <div className="flex focus:brightness-150">
          <button
            type="button"
            className={`py-2 w-[20%] flex justify-center items-center cursor-pointer ${selected === "member" ? "border-b-2 border-primary text-primary shadow-md" : "border-b border-border text-[#64748B]"}`}
            onClick={() => setSelected("member")}
          >
            Members
          </button>
          <button
            type="button"
            className={`py-2 w-[20%] flex justify-center items-center cursor-pointer ${selected === "invite" ? "border-b-2 border-primary text-primary shadow-md" : "border-b border-border text-[#64748B]"}`}
            onClick={() => setSelected("invite")}
          >
            Invites
          </button>
          <div className="py-2 w-[60%] border-b border-border"></div>
        </div>

        <div className="searchbar p-2 flex flex-wrap gap-1.5 border-b border-border items-start">
          <div className="flex items-center gap-2 w-full max-w-70 px-4 py-2 bg-white border border-[#64748B] rounded-lg shadow-sm transition-all focus-within:border-primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4.5 h-4.5 text-gray-400 shrink-0">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={selected === "invite" ? "Search by email..." : "Search by name..."}
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400"
            />
          </div>

          {selected === "member" && (
            <>
              <div className="w-32">
                <Select
                  id="role-filter"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  options={[{ value: "", label: "All Roles" }, ...ROLE_OPTIONS]}
                  noMargin
                  className="h-9"
                />
              </div>
              <div className="w-36">
                <Select
                  id="department-filter"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  options={[{ value: "", label: "All Departments" }, ...departmentSelectOptions]}
                  noMargin
                  className="h-9"
                />
              </div>

              <div className="active border border-border rounded-lg flex justify-center text-[14px] overflow-hidden">
                <button type="button" className={`ac py-1 px-3 flex items-center cursor-pointer ${status === "active" ? "bg-primary text-white" : "bg-white text-[#64748B]"}`} onClick={() => setStatus("active")}>
                  Active
                </button>
                <div className="line border-l border-border"></div>
                <button type="button" className={`disabled py-1 px-3 flex items-center cursor-pointer ${status === "disabled" ? "bg-primary text-white" : "bg-white text-[#64748B]"}`} onClick={() => setStatus("disabled")}>
                  Disabled
                </button>
              </div>
            </>
          )}
        </div>

        {selected === "invite" ? (
          <div className="bg-white rounded-b-md overflow-x-auto">
            <table className="w-full min-w-180px text-sm text-left">
              <thead className="border-b border-border">
                <tr className="text-gray-400 text-xs uppercase">
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Department</th>
                  <th className="px-6 py-4 font-medium">Expires</th>
                  {canManage && <th className="px-6 py-4 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!loading && filteredInvites.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                      No pending invites.
                    </td>
                  </tr>
                ) : (
                  filteredInvites.map((invite) => (
                    <tr key={invite.id} className="text-[#64748B]">
                      <td className="px-6 py-4 font-medium text-[#334155]">{invite.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${roleStyles[invite.role] ?? "bg-gray-500/15 text-gray-400"}`}>
                          {ROLE_LABELS[invite.role] ?? invite.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">{departmentValueToLabel(invite.department)}</td>
                      <td className="px-6 py-4">{invite.expiresAt ? new Date(invite.expiresAt).toLocaleDateString() : "—"}</td>
                      {canManage && (
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => setRevokeTarget(invite)}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-red-50 hover:bg-red-100 text-red-500"
                            aria-label="Revoke invite"
                          >
                            <Ban size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-b-md overflow-x-auto">
            <table className="w-full min-w-180px text-sm text-left">
              <thead className="border-b border-border">
                <tr className="text-gray-400 text-xs uppercase">
                  <th className="px-6 py-4 font-medium">Member</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Department</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  {canManage && <th className="px-6 py-4 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!loading && filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                      No members match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="text-[#64748B]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${getAvatarColor(member.name)}`}>
                            {getInitials(member.name)}
                          </div>
                          <div>
                            <div className="font-medium text-[#334155]">{member.name}</div>
                            <div className="text-xs text-[#64748B]">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${roleStyles[member.role] ?? "bg-gray-500/15 text-gray-400"}`}>
                          {ROLE_LABELS[member.role] ?? member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#64748B]">{departmentValueToLabel(member.department)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusStyles[member.status] ?? "bg-gray-500/15 text-gray-400"}`}>
                          {member.status === "disabled" ? "Disabled" : "Active"}
                        </span>
                      </td>
                      {canManage && (
                        <td className="px-6 py-4">
                          {member.status !== "disabled" && member.id !== user?.id && (
                            <button
                              type="button"
                              onClick={() => setDisableTarget(member)}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-red-50 hover:bg-red-100 text-red-500"
                              aria-label="Disable member"
                            >
                              <UserX size={16} />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {inviteModal && (
        <InviteTeammate
          onClose={() => setInviteModal(false)}
          onInvited={() => {
            setInviteModal(false);
            setToast("Invite sent.");
            if (selected === "invite") loadInvites();
          }}
        />
      )}

      {disableTarget && (
        <ConfirmDialog
          title={`Disable ${disableTarget.name}?`}
          message="They'll lose access immediately. You can optionally reassign their open tasks to someone else instead of leaving them unassigned."
          confirmLabel="Disable"
          loading={disabling}
          onConfirm={handleDisable}
          onCancel={() => {
            setDisableTarget(null);
            setReassignTo("");
          }}
        >
          {reassignCandidates.length > 0 && (
            <div className="text-left w-full">
              <Select
                label="Reassign open tasks to (optional)"
                id="reassign-to"
                value={reassignTo}
                onChange={(e) => setReassignTo(e.target.value)}
                options={[{ value: "", label: "Don't reassign — leave unassigned" }, ...reassignCandidates.map((m) => ({ value: m.id, label: m.name }))]}
                noMargin
              />
            </div>
          )}
        </ConfirmDialog>
      )}

      {revokeTarget && (
        <ConfirmDialog
          title="Revoke this invite?"
          message={`${revokeTarget.email} will no longer be able to use this invite link.`}
          confirmLabel="Revoke"
          loading={revoking}
          onConfirm={handleRevoke}
          onCancel={() => setRevokeTarget(null)}
        />
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast("")} />}
    </div>
  );
};
