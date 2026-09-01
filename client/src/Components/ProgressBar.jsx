export const ProgressBar = ({ value, className = "" }) => {
  const color = value >= 70 ? "#059669" : value >= 30 ? "#D97706" : "#EF4444";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-[12px] font-medium w-9 shrink-0" style={{ color }}>
        {value}%
      </span>
      <div className="h-1.5 flex-1 rounded-full bg-[#E5E7EB] overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};
