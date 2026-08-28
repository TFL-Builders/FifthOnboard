const VARIANT_CLASSES = {
  primary:
    "w-100 h-12 rounded-lg bg-primary text-white border border-primary hover:bg-background hover:border-primary hover:text-primary transition-colors duration-300",
  action:
    "flex items-center gap-2 h-11 px-4 rounded-md bg-primary text-white hover:brightness-95 transition-colors",
  secondary:
    "px-4 py-2 rounded-md border border-[#E5E7EB] text-[#64748B] hover:bg-background transition-colors",
};

export const Button = ({ variant = "primary", className = "", children, ...props }) => (
  <button className={`${VARIANT_CLASSES[variant]} ${className}`} {...props}>
    {children}
  </button>
);
