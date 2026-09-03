// Wraps /api/v1/invites. sendInvite/listInvites/deleteInvite go through the
// authed org-scoped API; acceptInvite is reached from the emailed link before
// the invitee has ever logged in, so it uses the unauthenticated `api` client
// directly (the token in the URL is the credential), same pattern as hirePortalApi.
import { api } from "./apiClient";

export const listInvites = (authedApi) => authedApi.get("/invites").then((res) => res.data);

export const sendInvite = (authedApi, { email, role, department }) =>
  authedApi.post("/invites", { email, role, department: department || undefined });

export const deleteInvite = (authedApi, id) => authedApi.delete(`/invites/${id}`);

export const acceptInvite = (token, { name, password }) =>
  api.post(`/invites/accept/${token}`, { name, password });
