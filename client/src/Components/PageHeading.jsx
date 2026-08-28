export const PageHeading = ({ title, subtitle, className = "" }) => (
  <div className={`pb-6 ${className}`}>
    <div className="text-[30px]">{title}</div>
    {subtitle && <div className="text-[16px] text-[#64748B]">{subtitle}</div>}
  </div>
);
