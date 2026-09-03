import { useState } from "react";
import { useAuthedApi } from "../hooks/useAuthedApi";
import { sendInvite as sendInviteRequest } from "../lib/invitesApi";
import { getErrorMessage } from "../lib/getErrorMessage";
import { ROLE_LABELS } from "../lib/usersApi";
import { Input } from "./Input";
import { Select } from "./Select";
import { ErrorBanner } from "./ErrorBanner";
import { Button } from "./Button";
import { emailError } from "../lib/validators";

// Admins aren't invited through this flow — granting that level of access is
// an org-owner action, not a routine team invite.
const ROLE_OPTIONS = Object.entries(ROLE_LABELS)
  .filter(([value]) => value !== "admin")
  .map(([value, label]) => ({ value, label }));

const DEPARTMENT_OPTIONS = [
  { value: "", label: "No department" },
  { value: "hr", label: "HR" },
  { value: "manager", label: "Manager" },
  { value: "it", label: "IT" },
  { value: "finance", label: "Finance" },
  { value: "custom", label: "Custom" },
];

export const InviteTeammate = ({ onClose, onInvited }) => {
  const authedApi = useAuthedApi();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const emailErr = emailError(email);
  const canSubmit = !emailErr && Boolean(role) && !sending;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setSending(true);
    try {
      await sendInviteRequest(authedApi, { email: email.trim().toLowerCase(), role, department });
      onInvited();
    } catch (err) {
      setError(getErrorMessage(err).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="Invite fixed inset-0 z-50 flex justify-center items-center bg-black/40" onClick={onClose}>
      <div className="main-Invite flex flex-col text-center max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="page-container bg-background flex justify-center items-center flex-col shadow-2xl rounded-2xl mb-5 border border-primary">
          <div className="card flex flex-col gap-8 px-6">
            <div className="flex flex-col">
              <p className="text-[36px] pt-5 font-bold welcome">Invite member</p>
              <div className="h-6 text-[#64748B]">Send an Invite link to their work email</div>
            </div>
            <hr className="text-primary" />
            <form onSubmit={handleSubmit} id="Invite-Form" className="flex flex-col px-6 mb-4 text-left">
              <ErrorBanner message={error} />

              <Input
                label="Work Email"
                id="work-email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={email.length > 0 ? emailErr : ""}
                required
              />

              <Select
                label="Role"
                id="invite-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                options={[{ value: "", label: "Select a role" }, ...ROLE_OPTIONS]}
              />

              <Select
                label="Department"
                id="invite-department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                options={DEPARTMENT_OPTIONS}
              />
              <div className="text-left text-[#64748B] text-[12px] -mt-3 pb-2">
                This is used to assign tasks to the person
              </div>

              <Button form="Invite-Form" type="submit" disabled={!canSubmit}>
                {sending ? "Sending..." : "Send Invite"}
              </Button>
            </form>

            <div>
              <hr className="text-primary" />
              <div className="final flex flex-row justify-end gap-4 m-4 mb-4">
                <button
                  type="button"
                  className="cancel border p-2 rounded-md text-red-400 hover:bg-red-800 hover:text-white"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
