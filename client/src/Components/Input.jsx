export const Input = ({ label, id, className = "", noMargin = false, error, ...props }) => (
  <>
    {label && (
      <label htmlFor={id} className="text-left pb-1">
        {label}
      </label>
    )}
    <input
      id={id}
      className={`border ${error ? "border-red-400" : "border-[#E5E7EB]"} hover:border-primary focus:border-primary focus:outline-none h-12 w-100 rounded-[5px] ${
        noMargin ? "" : error ? "mb-1" : "mb-4"
      } pl-2.5 bg-white ${className}`}
      {...props}
    />
    {error && <div className={`text-[12px] text-red-500 text-left ${noMargin ? "mt-1" : "mb-3"}`}>{error}</div>}
  </>
);
