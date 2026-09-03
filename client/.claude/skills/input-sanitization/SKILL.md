---
name: input-sanitization
description: FifthOnboard client input sanitization & validation — use when adding or reviewing any form field, especially auth forms
---

## Sanitize vs. validate — two different jobs

Don't conflate these:

- **Sanitize** — transform input into a safe/canonical form. Never rejects anything, never blocks submission by itself. Lives in `src/lib/sanitize.js`.
- **Validate** — check whether input matches an expected shape and reject it if not, with a specific message. Lives in `src/lib/validators.js`.

A field usually needs both: sanitize before sending to the API, validate to decide whether the submit button is even clickable and what to tell the user if not. Trimming a string is not the same as confirming it's a real name — don't let a `sanitizeText()` call stand in for actual validation, that was the mistake in the first pass of the auth forms.

## Field rules for this app

| Field | Sanitize | Validate |
|---|---|---|
| Full name | trim | letters, spaces, hyphens, apostrophes only; 2+ chars. No digits — `/^[A-Za-z\s'-]{2,}$/`. |
| Organization name | trim | 2-80 chars (matches the backend's own bound), no `<`/`>` or control characters. Digits and punctuation are fine — real org names have them ("7-Eleven", "Acme & Co."). Don't apply the same strict letters-only rule as a person's name. |
| Email | trim + lowercase (`sanitizeEmail`) | real format check — don't rely on `type="email"` alone, its HTML5 validation is looser than it looks and doesn't block form submission via a controlled-input submit handler. |
| Password | never sanitize (see below) | `isPasswordValid` from `src/lib/passwordRules.js` — the existing rule set (8+ chars, one uppercase, one number). Don't invent a second password check elsewhere. |

**Never sanitize passwords.** Trimming or transforming a password field can silently change what the user typed, and they'll then fail to log in with the password they think they set. This is a deliberate omission, not an oversight — see the comment in `sanitize.js`.

## Sanitize at submit time only

Call `sanitizeText`/`sanitizeEmail` when building the request payload in the submit handler, not in the field's `onChange`. Sanitizing on every keystroke fights the user mid-typing (e.g. stripping a trailing space they haven't finished replacing, or lowercasing while they're still typing their email's casing on purpose).

## Validate live, because it drives button state

Unlike sanitization, validation has to run on every change (or at least on blur), because its result feeds two things:

1. Whether the submit button is enabled at all — see the `error-handling` skill's rule that a submit button must be disabled while the form is invalid, not just while it's submitting. A button that's clickable with "John5" in the name field is the bug this skill exists to prevent.
2. Inline field-level error text, shown under the specific input once the user has interacted with it (don't show "required" errors before they've typed anything — validate-on-blur-then-live is the usual pattern, not validate-before-first-touch).

## Where this applies today

`Login.jsx`, `CreateAccount.jsx`, `ResetPass.jsx`, `ForgotPassword.jsx` — all four auth pages take free-text user input and send it to the API. Any new form taking user-entered text (not just auth) should follow the same sanitize-at-submit / validate-live split.
