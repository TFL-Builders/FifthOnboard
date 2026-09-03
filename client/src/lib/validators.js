// Paired with src/lib/sanitize.js — sanitize transforms input into a safe
// canonical form, validate rejects input that doesn't match an expected
// shape. See the input-sanitization skill for the full rationale.

const FULL_NAME_RE = /^[A-Za-z\s'-]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isFullNameValid = (value) => value.trim().length >= 2 && FULL_NAME_RE.test(value.trim());

export const fullNameError = (value) => {
  if (!value.trim()) return "Full name is required.";
  if (!isFullNameValid(value)) return "Full name can only contain letters, spaces, hyphens, and apostrophes.";
  return "";
};

export const isOrganizationNameValid = (value) => {
  const v = value.trim();
  return v.length >= 2 && v.length <= 80 && !/[<>]/.test(v);
};

export const organizationNameError = (value) => {
  if (!value.trim()) return "Organization name is required.";
  if (value.trim().length < 2) return "Organization name must be at least 2 characters.";
  if (value.trim().length > 80) return "Organization name must be 80 characters or fewer.";
  if (/[<>]/.test(value)) return "Organization name can't contain < or >.";
  return "";
};

export const isEmailValid = (value) => EMAIL_RE.test(value.trim());

export const emailError = (value) => {
  if (!value.trim()) return "Email is required.";
  if (!isEmailValid(value)) return "Enter a valid email address.";
  return "";
};
