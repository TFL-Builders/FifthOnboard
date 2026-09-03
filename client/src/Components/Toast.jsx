import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

export const Toast = ({ message, onDismiss, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  return (
    <div className="fixed bottom-6 right-6 z-60 flex items-center gap-3 bg-white border border-border shadow-2xl rounded-xl px-4 py-3 max-w-sm">
      <CheckCircle2 className="text-[#059669] shrink-0" size={20} />
      <span className="text-[14px]">{message}</span>
    </div>
  );
};
