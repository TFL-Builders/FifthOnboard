import { PASSWORD_RULES } from "../lib/passwordRules";

const CheckCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
    <path d="M4.5 7.2L6.2 8.9L9.5 5.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EmptyCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

export const PasswordRulesChecklist = ({ password, confirmPassword }) => {
  const showMismatch = confirmPassword !== undefined && confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="flex flex-col gap-1 items-start mb-4 -mt-1 pl-4">
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(password);
        return (
          <div
            key={rule.label}
            className={`flex items-start gap-1.5 text-[12px] transition-colors ${
              passed ? "text-emerald-600" : "text-[#94A3B8]"
            }`}
          >
            {passed ? <CheckCircleIcon /> : <EmptyCircleIcon />}
            {rule.label}
          </div>
        );
      })}
      {showMismatch && (
        <div className="flex items-center gap-1.5 text-[12px] text-red-500">
          <EmptyCircleIcon />
          Passwords do not match
        </div>
      )}
    </div>
  );
};
