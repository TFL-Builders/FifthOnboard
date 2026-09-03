import { ApiError } from "./apiClient";

// Normalizes any thrown value — an ApiError from the backend (either the
// plain-string { error } shape or Zod's { errors: [{ field, message }] }
// list), a generic JS/network error, or a bare string — into one consistent
// shape. Feed the result to <ErrorBanner /> for an inline form error, or to
// <Toast variant="error" /> for a transient one; both read the same shape.
export const getErrorMessage = (err) => {
  if (err instanceof ApiError) {
    if (err.errors?.length) {
      const fieldErrors = Object.fromEntries(err.errors.map((e) => [e.field, e.message]));
      return { message: err.errors[0].message, fieldErrors };
    }
    return { message: err.message, fieldErrors: null };
  }

  if (typeof err === "string") {
    return { message: err, fieldErrors: null };
  }

  return { message: err?.message || "Something went wrong. Please try again.", fieldErrors: null };
};
