// Applied at submit time only — never on every keystroke, so it doesn't
// fight the user mid-typing (e.g. trimming a trailing space they haven't
// finished replacing yet).

// Trim + strip angle brackets. React escapes render output regardless, but
// this keeps obviously-malformed input (accidental paste, basic injection
// attempts) from ever leaving the client for name/organization-style fields.
export const sanitizeText = (value) => value.trim().replace(/[<>]/g, "");

// Trim + lowercase, matching how the backend normalizes email (see
// User.email: "lowercase, trimmed") — sending it pre-normalized avoids
// case-only "different" emails confusing duplicate-account checks.
export const sanitizeEmail = (value) => value.trim().toLowerCase();

// Passwords are deliberately never sanitized — trimming could silently
// change what the user actually typed and intends to log in with again.
