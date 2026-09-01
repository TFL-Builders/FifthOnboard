const VARIANT_CLASSES = {
  active: "bg-[#ECFDF5] text-[#059669]",
  completed: "bg-[#F0F9FF] text-[#0369A1]",
  "at-risk": "bg-[#FEF2F2] text-red-500",
};

export const StatusBadge = ({ status }) => (
  <span
    className={`text-[12px] font-medium rounded-full px-2.5 py-1 capitalize ${
      VARIANT_CLASSES[status] ?? VARIANT_CLASSES.active
    }`}
  >
    {status}
  </span>
);
