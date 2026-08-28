export const Input = ({ label, id, className = "", noMargin = false, ...props }) => (
  <>
    {label && (
      <label htmlFor={id} className="text-left pb-1">
        {label}
      </label>
    )}
    <input
      id={id}
      className={`border border-[#E5E7EB] hover:border-primary focus:border-primary focus:outline-none h-12 w-100 rounded-[5px] ${noMargin ? "" : "mb-4"} pl-2.5 bg-white ${className}`}
      {...props}
    />
  </>
);
