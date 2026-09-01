import { Check } from "lucide-react";

export const Stepper = ({ steps, currentStep }) => (
  <div className="flex items-center">
    {steps.map((label, index) => {
      const isComplete = index < currentStep;
      const isCurrent = index === currentStep;

      return (
        <div key={label} className={`flex items-center ${index < steps.length - 1 ? "flex-1" : ""}`}>
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-medium border-2 transition-colors ${
                isComplete
                  ? "bg-primary border-primary text-white"
                  : isCurrent
                  ? "border-primary text-primary"
                  : "border-[#E5E7EB] text-[#94A3B8]"
              }`}
            >
              {isComplete ? <Check size={16} /> : index + 1}
            </div>
            <span
              className={`text-[12px] whitespace-nowrap ${
                isCurrent ? "text-primary font-medium" : isComplete ? "text-black" : "text-[#94A3B8]"
              }`}
            >
              {label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`h-0.5 flex-1 mx-2 mb-5 ${isComplete ? "bg-primary" : "bg-[#E5E7EB]"}`} />
          )}
        </div>
      );
    })}
  </div>
);
