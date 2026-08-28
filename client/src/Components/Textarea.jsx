export const Textarea = ({ label, id, className = "", noMargin = false, ...props }) => (
  <>
    {label && (
      <label htmlFor={id} className="text-left pb-1">
        {label}
      </label>
    )}
    <textarea
      id={id}
      rows={3}
      className={`border border-solid border-[#E5E7EB] hover:border-primary focus:border-primary focus:outline-none rounded-[5px] ${noMargin ? "" : "mb-4"} p-2.5 bg-white resize-none w-100 ${className}`}
      {...props}
    />
  </>
);
