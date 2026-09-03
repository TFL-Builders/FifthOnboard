import { useAuth } from "../context/AuthContext";
import { api } from "../lib/apiClient";

// Every protected endpoint needs `Authorization: Bearer <accessToken>` — this
// just pre-binds the current token from AuthContext onto the shared api
// client so call sites don't have to thread it through by hand.
export const useAuthedApi = () => {
  const { accessToken } = useAuth();

  return {
    get: (path, options) => api.get(path, { ...options, token: accessToken }),
    post: (path, body, options) => api.post(path, body, { ...options, token: accessToken }),
    patch: (path, body, options) => api.patch(path, body, { ...options, token: accessToken }),
    delete: (path, options) => api.delete(path, { ...options, token: accessToken }),
  };
};
