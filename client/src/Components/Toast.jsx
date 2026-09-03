import { useEffect } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

const VARIANTS = {
  success: { Icon: CheckCircle2, color: "text-[#059669]" },
  error: { Icon: AlertCircle, color: "text-red-500" },
};

export const Toast = ({ message, onDismiss, duration = 4000, variant = "success" }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  const { Icon, color } = VARIANTS[variant];

  return (
    <div className="fixed bottom-6 right-6 z-60 flex items-center gap-3 bg-white border border-border shadow-2xl rounded-xl px-4 py-3 max-w-sm">
      <CheckCircle2 className="text-[#059669] shrink-0" size={20} />
      <span className="text-[14px]">{message}</span>
    </div>
  );
};
