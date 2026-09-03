// Single source of truth for password strength — originally written inline
// in ResetPass.jsx; centralized here so Create Account enforces the same
// rules instead of a separate, looser check.
export const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One number", test: (v) => /[0-9]/.test(v) },
];

export const isPasswordValid = (password) => PASSWORD_RULES.every((rule) => rule.test(password));
