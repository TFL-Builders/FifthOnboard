import { useState } from "react";
import { Filter, ChevronDown } from "lucide-react";

export const FilterDropdown = ({ value, options, onChange, allLabel = "All" }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 h-11 px-4 rounded-[15px] border border-[#E5E7EB] text-[#64748B] bg-white hover:bg-background transition-colors"
      >
        <Filter size={16} />
        {value === allLabel ? "Filter" : value}
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute mt-1 w-44 bg-white border border-[#E5E7EB] rounded-lg shadow-md z-10 divide-y divide-[#E5E7EB] overflow-hidden">
          {options.map((option) => (
            <div
              key={option}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`p-2 cursor-pointer hover:bg-background ${
                option === value ? "text-primary font-medium" : "text-[#64748B]"
              }`}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
