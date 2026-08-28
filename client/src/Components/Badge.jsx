export const Badge = ({ children, className = "" }) => (
  <span className={`text-[12px] text-[#64748B] border border-[#E5E7EB] rounded-full px-2 py-0.5 ${className}`}>
    {children}
  </span>
);
