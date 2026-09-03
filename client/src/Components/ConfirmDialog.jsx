import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

// Generic "are you sure?" modal — not specific to templates. Any destructive
// action (cancel an onboarding, deactivate a user, revoke an invite, ...)
// can reuse this instead of a bespoke confirm each time.
export const ConfirmDialog = ({
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
  children,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-8" onClick={onCancel}>
    <div
      className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center gap-3"
      onClick={(e) => e.stopPropagation()}
    >
      <div className={`rounded-full w-12 h-12 flex items-center justify-center ${danger ? "bg-red-50" : "bg-[#ECFEFF]"}`}>
        <AlertTriangle className={danger ? "text-red-500" : "text-[#0891B2]"} size={22} />
      </div>
      <div className="text-[18px] font-bold">{title}</div>
      <div className="text-[14px] text-[#64748B]">{message}</div>

      {children}

      <div className="flex gap-3 w-full mt-2">
        <Button variant="secondary" type="button" onClick={onCancel} className="flex-1" disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant="primary"
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 w-auto ${danger ? "!bg-red-500 !border-red-500 hover:!bg-red-50 hover:!text-red-500" : ""}`}
        >
          {loading ? "Working..." : confirmLabel}
        </Button>
      </div>
    </div>
  </div>
);
