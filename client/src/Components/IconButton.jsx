const VARIANT_CLASSES = {
  default: "border border-[#E5E7EB] text-[#64748B] hover:bg-background hover:text-black",
  danger: "border border-[#E5E7EB] text-red-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600",
};

export const IconButton = ({ variant = "default", className = "", children, ...props }) => (
  <button
    type="button"
    className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${VARIANT_CLASSES[variant]} ${className}`}
    {...props}
  >
    {children}
  </button>
);
