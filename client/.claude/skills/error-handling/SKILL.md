---
name: error-handling
description: FifthOnboard client error handling & display — use whenever catching an error from an API call, or showing any error/success state to the user
---

## One normalizer for every error, no matter the source

`src/lib/getErrorMessage.js` takes anything a `catch` block might receive — an `ApiError` from `src/lib/apiClient.js` (either the backend's plain `{ error: "string" }` shape or Zod's `{ errors: [{ field, message }] }` list), a generic JS/network error (e.g. `fetch` rejecting with "Failed to fetch" on a CORS block or dropped connection), or a bare string — and returns one consistent shape: `{ message, fieldErrors }`.

**Rule: every `catch` block that might show something to the user calls `getErrorMessage(err)` first.** Never render `err.message` or `err.errors?.[0]?.message` directly inline in a component — that was the pattern before this skill existed, and it meant every form re-implemented its own (slightly different) unwrapping logic.

## Two places an error can land — pick based on context

- **`<ErrorBanner message={...} />`** (`src/Components/ErrorBanner.jsx`) — inline, form-level or general errors. Use `message` from `getErrorMessage`'s result. This is for errors tied to a specific form the user is actively filling out.
- **`<Toast variant="error" message={...} />`** (`src/Components/Toast.jsx`) — transient, non-form errors elsewhere in the app (e.g. a background task update failing in `OnboardingDetailModal`). Same `getErrorMessage` output feeds it; `Toast` defaults to `variant="success"` so pass `variant="error"` explicitly.

Don't invent a third display style. If neither fits, that's a sign the situation needs one of these two, not a new one-off.

## Field-level errors render under the field, not just in the banner

`getErrorMessage`'s `fieldErrors` (a `{ fieldName: message }` map, populated from the backend's Zod validation shape) exists specifically so a field-specific problem can show next to that field instead of only as a generic banner at the top. If `fieldErrors` has an entry for a field you're rendering, show it there — the banner (`message`, generally the first error) is a fallback/summary, not the only place an error should appear.

## Submit buttons: three states, not two

A submit button reflects:

1. **Idle** — enabled, normal label.
2. **Submitting** — `disabled`, label changes to a present-tense verb ("Signing in...", "Creating account...").
3. **Invalid** — `disabled` because the form doesn't yet pass its field validators (see the `input-sanitization` skill), independent of whether it's submitting.

A button that's clickable while a required field is malformed (e.g. digits in a name field) skips state 3 — that's the bug that prompted this skill. `disabled={submitting}` alone is not enough; it needs to be `disabled={submitting || !isFormValid}`.

## Success states matter too

Not every "no error" outcome is silent. When an action succeeds but doesn't navigate the user somewhere self-evidently different (e.g. `POST /auth/forgot-password`'s always-200 response, or a redirect from Reset Password back to Login), show an explicit success message using the same visual weight as `ErrorBanner` but in the success palette (emerald, not red) — see `Login.jsx`'s `resetSuccess` banner and `ForgotPassword.jsx`'s post-submit confirmation for the pattern.
