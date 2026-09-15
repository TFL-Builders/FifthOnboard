const BASE_URL = import.meta.env.VITE_API_URL ?? "https://fifthonboard.onrender.com/api/v1";

// Carries the parsed error body so callers can tell apart the two shapes the
// API uses: { error: "<message>" } vs. Zod's { errors: [{ field, message }] }.
export class ApiError extends Error {
  constructor(status, body) {
    super(body?.error ?? "Something went wrong. Please try again.");
    this.status = status;
    this.errors = body?.errors ?? null;
  }
}

const request = async (path, { method = "GET", body, token } = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, payload);
  }

  return payload;
};

export const api = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) => request(path, { ...options, method: "POST", body }),
  patch: (path, body, options) => request(path, { ...options, method: "PATCH", body }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};
