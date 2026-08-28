import { ChevronDown } from "lucide-react";

export const Select = ({ label, id, options, className = "", noMargin = false, ...props }) => (
  <>
    {label && (
      <label htmlFor={id} className="text-left pb-1">
        {label}
      </label>
    )}
    <div className={`relative ${noMargin ? "" : "mb-4"}`}>
      <select
        id={id}
        className={`appearance-none border border-solid border-[#E5E7EB] hover:border-primary focus:border-primary focus:outline-none h-12 w-full rounded-[5px] pl-2.5 pr-8 bg-white ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
    </div>
  </>
);
