import { useState } from "react";
import { X, FileText, Check, Copy, Mail, Rocket, ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { Input } from "./Input";
import { Button } from "./Button";
import { Stepper } from "./Stepper";
import { Avatar } from "./Avatar";
import { SAMPLE_TEMPLATES } from "../data/mockTemplates";
import { DEPARTMENT_STAFF } from "../data/mockStaff";
import { useOnboardings } from "../context/OnboardingsContext";

const STEPS = ["New Hire Info", "Choose Template", "Manager", "Start Date & Review"];

export const NewOnboardingModal = ({ onClose, onLaunched }) => {
  const { addRecord } = useOnboardings();
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [templateId, setTemplateId] = useState(null);
  const [managerId, setManagerId] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [launched, setLaunched] = useState(false);
  const [copied, setCopied] = useState(false);
  const [portalSuffix] = useState(() => Math.random().toString(16).slice(2, 8));

  const template = SAMPLE_TEMPLATES.find((t) => t.id === templateId);
  const manager = DEPARTMENT_STAFF.find((s) => s.id === managerId);

  const canProceed =
    step === 0
      ? fullName.trim().length > 0 && email.trim().length > 0
      : step === 1
      ? templateId !== null
      : true;

  const portalId = `${fullName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${portalSuffix}`;
  const portalLink = `http://localhost:5173/hire/${portalId}`;

  const handleLaunch = () => {
    const record = {
      id: Date.now(),
      portalId,
      name: fullName,
      jobTitle,
      email,
      template: template?.name ?? "—",
      manager: manager?.name ?? "Unassigned",
      startDate,
      progress: 0,
    };
    addRecord(record);
    setLaunched(true);
    onLaunched?.(record);
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

  if (launched) {
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

          <Button variant="secondary" type="button" className="w-full justify-center">
            <Mail size={16} />
            Send email with link to {fullName}
          </Button>

          <Button
            variant="primary"
            type="button"
            onClick={() => {
              window.open(`/hire/${portalId}`, "_blank", "noopener,noreferrer");
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
            <div className="grid grid-cols-2 gap-3">
              {SAMPLE_TEMPLATES.map((t) => (
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
                    <div className="text-[12px] text-[#64748B]">{t.taskCount} tasks</div>
                  </div>
                  {templateId === t.id && <Check className="text-primary ml-auto shrink-0" size={18} />}
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="text-[14px] font-medium mb-1">
                Who will supervise and onboard {fullName || "the new hire"}?
              </div>
              <div className="text-[12px] text-[#64748B] mb-3">
                Pick a staff member from the department to be in charge — you can update this later.
              </div>
              <div className="grid grid-cols-3 gap-3">
                {DEPARTMENT_STAFF.map((person) => (
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
                    <div className="text-[12px] text-[#64748B] truncate w-full">{person.role}</div>
                  </button>
                ))}
              </div>
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
                  <div className="text-[12px] text-[#64748B]">{template?.taskCount ?? 0} tasks</div>
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

              <div className="bg-background rounded-xl p-3 text-center text-[14px]">
                Ready to launch <span className="text-primary font-medium">{fullName || "this hire"}</span>&apos;s
                onboarding with {template?.taskCount ?? 0} tasks?
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
            <Button variant="primary" type="button" onClick={handleLaunch} className="w-auto px-5 h-11">
              <Rocket size={16} />
              Launch onboarding
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
