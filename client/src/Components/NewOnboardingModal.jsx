import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { X, FileText, Check, Copy, Mail, Rocket, ArrowLeft, ArrowRight, ExternalLink, AlertTriangle } from "lucide-react";
import { Input } from "./Input";
import { Select } from "./Select";
import { Button } from "./Button";
import { Stepper } from "./Stepper";
import { Avatar } from "./Avatar";
import { ErrorBanner } from "./ErrorBanner";
import { useAuthedApi } from "../hooks/useAuthedApi";
import { listTemplatesForOnboarding } from "../lib/templatesApi";
import { listUsers, ROLE_LABELS } from "../lib/usersApi";
import { createOnboarding, sendHireEmail } from "../lib/onboardingsApi";
import { getSettings } from "../lib/settingsApi";
import { departmentValueToLabel } from "../lib/templateEnums";
import { getErrorMessage } from "../lib/getErrorMessage";

const STEPS = ["New Hire Info", "Choose Template", "Manager & Teams", "Start Date & Review"];

export const NewOnboardingModal = ({ onClose, onLaunched }) => {
  const authedApi = useAuthedApi();
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templateId, setTemplateId] = useState(null);
  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [managerId, setManagerId] = useState(null);
  const [departmentMap, setDepartmentMap] = useState({});
  const [orgSettings, setOrgSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const prefilledForTemplateRef = useRef(null);
  const [startDate, setStartDate] = useState("");
  const [launchResult, setLaunchResult] = useState(null);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    listTemplatesForOnboarding(authedApi)
      .then(setTemplates)
      .finally(() => setTemplatesLoading(false));
    listUsers(authedApi, { status: "active" })
      .then(setStaff)
      .finally(() => setStaffLoading(false));
    getSettings(authedApi)
      .then(setOrgSettings)
      .catch(() => setOrgSettings(null))
      .finally(() => setSettingsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const template = templates.find((t) => t.id === templateId);
  const templateTaskCount = template?.templateTasks?.length ?? 0;
  const manager = staff.find((s) => s.id === managerId);
  const managers = staff.filter((s) => s.role === "manager");

  const templateDepartments = template
    ? [...new Set((template.templateTasks ?? []).map((t) => t.assigneeDepartment))].filter(
        (d) => d !== "new_hire" && d !== "manager"
      )
    : [];

  useEffect(() => {
    if (!template || settingsLoading || staffLoading) return;
    if (prefilledForTemplateRef.current === template.id) return;
    prefilledForTemplateRef.current = template.id;

    if (!managerId && orgSettings?.defaultManagerId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time default prefill when a new template's data becomes available, not derived state
      setManagerId(orgSettings.defaultManagerId.id);
    }
    setDepartmentMap((prev) => {
      const next = { ...prev };
      templateDepartments.forEach((dept) => {
        if (!next[dept] && orgSettings?.defaultDepartmentMap?.[dept]) {
          next[dept] = orgSettings.defaultDepartmentMap[dept].id;
        }
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template?.id, settingsLoading, staffLoading]);

  const isManagerOrgDefault = Boolean(managerId) && managerId === orgSettings?.defaultManagerId?.id;
  const isDeptOrgDefault = (dept) =>
    Boolean(departmentMap[dept]) && departmentMap[dept] === orgSettings?.defaultDepartmentMap?.[dept]?.id;
  const usersForDepartment = (dept) => staff.filter((s) => s.department === dept);
  const unassignedDepartmentCount = templateDepartments.filter((d) => !departmentMap[d]).length;

  const canProceed =
    step === 0
      ? fullName.trim().length > 0 && email.trim().length > 0
      : step === 1
      ? templateId !== null
      : true;

  const portalLink = launchResult ? `${window.location.origin}/hire/${launchResult.hirePortalToken}` : "";

  const handleLaunch = async () => {
    setError("");
    setLaunching(true);
    try {
      const result = await createOnboarding(authedApi, {
        templateId,
        newHireName: fullName.trim(),
        newHireEmail: email.trim(),
        startDate,
        job: jobTitle.trim() || undefined,
        managerId: managerId || undefined,
        departmentMap: Object.fromEntries(Object.entries(departmentMap).filter(([, v]) => v)),
      });
      setLaunchResult(result);
      onLaunched?.(result);
    } catch (err) {
      setError(getErrorMessage(err).message);
    } finally {
      setLaunching(false);
    }
  };

  const handleSendEmail = async () => {
    setEmailError("");
    setSendingEmail(true);
    try {
      await sendHireEmail(authedApi, launchResult.id, portalLink);
      setEmailSent(true);
    } catch (err) {
      setEmailError(getErrorMessage(err).message);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(portalLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access denied — nothing to fall back to here
    }
  };

  if (launchResult) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-8" onClick={onClose}>
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col items-center text-center gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-[#ECFDF5] rounded-full w-14 h-14 flex items-center justify-center">
            <Rocket className="text-[#059669]" size={26} />
          </div>
          <div>
            <div className="text-[20px] font-bold">Onboarding launched!</div>
            <div className="text-[14px] text-[#64748B] mt-1">Share this portal link with {fullName}:</div>
          </div>

          <div className="w-full flex items-center gap-2 border border-border rounded-lg p-2.5">
            <span className="text-[13px] text-primary truncate flex-1 text-left">{portalLink}</span>
            <Button variant="secondary" type="button" onClick={handleCopy} className="shrink-0 px-3 py-1.5 text-[13px]">
              <Copy size={14} />
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>

          <div className="w-full text-[12px] text-[#B45309] bg-[#FEF3C7] rounded-lg px-3 py-2 text-left">
            This link won&apos;t be shown again. Copy it before closing.
          </div>

          <ErrorBanner message={emailError} />
          <Button
            variant="secondary"
            type="button"
            onClick={handleSendEmail}
            disabled={sendingEmail}
            className="w-full justify-center"
          >
            <Mail size={16} />
            {sendingEmail ? "Sending..." : emailSent ? "Email sent" : `Send email with link to ${fullName}`}
          </Button>

          <Button
            variant="primary"
            type="button"
            onClick={() => {
              window.open(`/hire/${launchResult.hirePortalToken}`, "_blank", "noopener,noreferrer");
              onClose();
            }}
            className="w-full justify-center"
          >
            <ExternalLink size={16} />
            Go to onboarding
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-8 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-[#64748B] hover:text-black transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="p-6 pb-0">
          <div className="text-[24px] font-bold">New onboarding</div>
          <div className="text-[14px] text-[#64748B] mt-1">Set up a new hire&apos;s onboarding journey in a few steps.</div>
        </div>

        <div className="px-6 pt-6">
          <Stepper steps={STEPS} currentStep={step} />
        </div>

        <div className="p-6 border border-border rounded-xl m-6 flex flex-col gap-4 min-h-70">
          <div className="text-[16px] font-medium">{STEPS[step]}</div>

          {step === STEPS.length - 1 && <ErrorBanner message={error} />}

          {step === 0 && (
            <>
              <Input
                label={
                  <>
                    Full name <span className="text-red-500">*</span>
                  </>
                }
                id="hire-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Smith"
                noMargin
                className="w-full"
              />
              <Input
                label={
                  <>
                    Work email <span className="text-red-500">*</span>
                  </>
                }
                id="hire-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@company.com"
                noMargin
                className="w-full"
              />
              <Input
                label={
                  <>
                    Job title <span className="text-[#94A3B8] font-normal">(optional)</span>
                  </>
                }
                id="hire-title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Software Engineer"
                noMargin
                className="w-full"
              />
            </>
          )}

          {step === 1 && (
            <>
              {!templatesLoading && templates.length > 0 && (
                <div className="flex justify-end -mt-1 -mb-2">
                  <Link to="/templates" className="text-[13px] text-primary hover:brightness-150 transition-colors">
                    + New Template
                  </Link>
                </div>
              )}
              {!templatesLoading && templates.length === 0 && (
                <div className="text-center text-[14px] py-6 flex flex-col items-center gap-2">
                  <span className="text-[#64748B]">No templates yet — you&apos;ll need one before launching an onboarding.</span>
                  <Link to="/templates" className="text-primary hover:brightness-150 transition-colors font-medium">
                    Create a template →
                  </Link>
                </div>
              )}
              {!templatesLoading && templates.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTemplateId(t.id)}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-colors ${
                        templateId === t.id ? "border-primary bg-[#ECFEFF]" : "border-border hover:border-primary"
                      }`}
                    >
                      <div className="bg-[#ECFEFF] rounded-md p-2 w-9 h-9 flex items-center justify-center shrink-0">
                        <FileText className="text-[#0891B2]" size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[14px] font-medium truncate">{t.name}</div>
                        <div className="text-[12px] text-[#64748B]">{t.templateTasks?.length ?? 0} tasks</div>
                      </div>
                      {templateId === t.id && <Check className="text-primary ml-auto shrink-0" size={18} />}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div>
                <div className="text-[14px] font-medium mb-1">
                  Who is {fullName || "the new hire"}&apos;s manager?
                </div>
                <div className="text-[12px] text-[#64748B] mb-3">
                  Select a manager or leave unassigned — you can update this later.
                </div>
                {!staffLoading && managers.length === 0 && (
                  <div className="text-[13px] text-[#64748B] border border-border rounded-xl p-3">
                    No users with the Manager role yet.
                  </div>
                )}
                {!staffLoading && managers.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {managers.map((person) => (
                      <button
                        key={person.id}
                        type="button"
                        onClick={() => setManagerId(managerId === person.id ? null : person.id)}
                        className={`relative flex flex-col items-center text-center gap-1 p-3 rounded-xl border transition-colors ${
                          managerId === person.id ? "border-primary bg-[#ECFEFF]" : "border-border hover:border-primary"
                        }`}
                      >
                        {managerId === person.id && (
                          <Check className="absolute right-2 top-2 text-primary" size={16} />
                        )}
                        <Avatar name={person.name} size={36} />
                        <div className="text-[14px] truncate w-full">{person.name}</div>
                        <div className="text-[12px] text-[#64748B] truncate w-full">{ROLE_LABELS[person.role] ?? person.role}</div>
                        {managerId === person.id && isManagerOrgDefault && (
                          <div className="text-[10px] font-medium text-[#B45309] bg-[#FEF3C7] rounded-full px-1.5 py-0.5">
                            Org Default
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="text-[14px] font-medium mb-1">Department task assignments</div>
                <div className="text-[12px] text-[#64748B] mb-3">
                  Map departments from this template to assignees. Org defaults are pre-filled.
                </div>

                {templateDepartments.length === 0 && (
                  <div className="text-[13px] text-[#64748B] border border-border rounded-xl p-3">
                    No department mappings required for this template.
                  </div>
                )}

                {templateDepartments.length > 0 && (
                  <div className="flex flex-col gap-3">
                    {templateDepartments.map((dept) => {
                      const currentUserId = departmentMap[dept] ?? "";
                      const currentUser = staff.find((s) => s.id === currentUserId);
                      const isDefault = isDeptOrgDefault(dept);
                      const options = usersForDepartment(dept);
                      return (
                        <div
                          key={dept}
                          className={`border rounded-xl p-3 flex items-center gap-3 ${
                            currentUserId ? "border-border" : "border-[#F3D9A8] bg-[#FEF3C7]/30"
                          }`}
                        >
                          <Avatar name={currentUser?.name ?? "?"} size={32} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[12px] text-[#64748B]">{departmentValueToLabel(dept)} Department</span>
                              {isDefault && (
                                <span className="text-[10px] font-medium text-[#B45309] bg-[#FEF3C7] rounded-full px-1.5 py-0.5">
                                  Org Default
                                </span>
                              )}
                            </div>
                            {options.length === 0 ? (
                              <div className="text-[13px] text-[#94A3B8]">No users in this department yet.</div>
                            ) : (
                              <Select
                                id={`onboarding-dept-${dept}`}
                                value={currentUserId}
                                onChange={(e) =>
                                  setDepartmentMap((prev) => ({ ...prev, [dept]: e.target.value }))
                                }
                                options={[
                                  { value: "", label: "Unassigned" },
                                  ...options.map((u) => ({ value: u.id, label: u.name })),
                                ]}
                                noMargin
                                className="h-9 text-[13px]"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {(unassignedDepartmentCount > 0 || !managerId) && (
                <div className="flex flex-col gap-2">
                  {!managerId && (
                    <div className="flex items-start gap-2 text-[12px] text-[#B45309] bg-[#FEF3C7] rounded-lg px-3 py-2">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                      No manager assigned. This onboarding will be flagged with a warning.
                    </div>
                  )}
                  {unassignedDepartmentCount > 0 && (
                    <div className="flex items-start gap-2 text-[12px] text-[#B45309] bg-[#FEF3C7] rounded-lg px-3 py-2">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                      Some tasks will be unassigned. You can assign them later from the onboarding detail page.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <>
              <Input
                label="Start date"
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                noMargin
                className="w-full"
              />

              <div className="border border-border rounded-xl p-3 flex items-center gap-3">
                <Avatar name={fullName || "?"} size={36} />
                <div className="min-w-0">
                  <div className="text-[14px] font-medium truncate">{fullName || "—"}</div>
                  <div className="text-[12px] text-[#64748B] truncate">
                    {jobTitle || "No title"} · {email || "no email"}
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-xl p-3 flex items-center gap-3">
                <div className="bg-[#ECFEFF] rounded-md p-2 w-9 h-9 flex items-center justify-center shrink-0">
                  <FileText className="text-[#0891B2]" size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-medium truncate">{template?.name ?? "No template selected"}</div>
                  <div className="text-[12px] text-[#64748B]">{templateTaskCount} tasks</div>
                </div>
              </div>

              <div className="border border-border rounded-xl p-3 flex items-center gap-3">
                <Avatar name={manager?.name ?? "?"} size={36} />
                <div className="min-w-0">
                  <div className="text-[12px] text-[#64748B]">Manager</div>
                  <div className={`text-[14px] font-medium truncate ${!manager ? "text-[#B45309]" : ""}`}>
                    {manager?.name ?? "Unassigned"}
                  </div>
                </div>
              </div>

              {templateDepartments.length > 0 && (
                <div className="border border-border rounded-xl divide-y divide-border">
                  {templateDepartments.map((dept) => {
                    const assignee = staff.find((s) => s.id === departmentMap[dept]);
                    return (
                      <div key={dept} className="flex items-center justify-between px-3 py-2.5">
                        <span className="text-[12px] text-[#64748B]">{departmentValueToLabel(dept)}</span>
                        <span
                          className={`text-[13px] font-medium flex items-center gap-1.5 ${
                            assignee ? "" : "text-[#B45309]"
                          }`}
                        >
                          {!assignee && <AlertTriangle size={13} />}
                          {assignee?.name ?? "Unassigned"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="bg-background rounded-xl p-3 text-center text-[14px]">
                Ready to launch <span className="text-primary font-medium">{fullName || "this hire"}</span>&apos;s
                onboarding with {templateTaskCount} tasks?
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between gap-3 px-6 pb-6">
          {step > 0 ? (
            <Button variant="secondary" type="button" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft size={16} />
              Back
            </Button>
          ) : (
            <span />
          )}

          {step < STEPS.length - 1 ? (
            <Button
              variant="primary"
              type="button"
              disabled={!canProceed}
              onClick={() => setStep((s) => s + 1)}
              className="w-auto px-5 h-11"
            >
              Next
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button variant="primary" type="button" onClick={handleLaunch} disabled={launching} className="w-auto px-5 h-11">
              <Rocket size={16} />
              {launching ? "Launching..." : "Launch onboarding"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
