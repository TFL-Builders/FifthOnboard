// Wraps /api/v1/templates. Every function takes the authed api client
// (from useAuthedApi()) as its first argument and unwraps the { data } envelope.

export const listTemplates = (authedApi, filter = "active") =>
  authedApi.get(`/templates?filter=${filter}`).then((res) => res.data);

// Lightweight shape (id, name, templateTasks) used by the onboarding-launch
// template picker — see NewOnboardingModal.
// ⚠ This is the one templates-list branch on the server that returns raw
// Mongoose docs (`_id`) instead of the `id`-mapped shape every other branch
// of that endpoint uses — normalizing here defensively so template selection
// still works correctly even before that's fixed server-side.
export const listTemplatesForOnboarding = (authedApi) =>
  authedApi.get(`/templates?onboarding=true`).then((res) =>
    res.data.map((t) => ({
      id: t.id ?? t._id,
      name: t.name,
      templateTasks: (t.templateTasks ?? []).map((task) => ({ ...task, id: task.id ?? task._id })),
    }))
  );

export const getTemplate = (authedApi, id) => authedApi.get(`/templates/${id}`).then((res) => res.data);

export const createTemplate = (authedApi, payload) =>
  authedApi.post(`/templates`, payload).then((res) => res.data);

export const updateTemplate = (authedApi, id, payload) =>
  authedApi.patch(`/templates/${id}`, payload).then((res) => res.data);

export const cloneTemplate = (authedApi, id) => authedApi.post(`/templates/${id}/clone`).then((res) => res.data);

export const archiveTemplate = (authedApi, id) =>
  authedApi.patch(`/templates/${id}/archive`).then((res) => res.data);

export const unarchiveTemplate = (authedApi, id) =>
  authedApi.patch(`/templates/${id}/unarchive`).then((res) => res.data);

export const deleteTemplate = (authedApi, id) => authedApi.delete(`/templates/${id}`).then((res) => res.data);

// GET /templates returns updatedAt as an integer "days ago"; every other
// templates endpoint (create/update/clone/get-single) returns a real ISO
// date instead (called out explicitly as an inconsistency in the API doc).
// This normalizes both into the same display string.
export const formatUpdatedAt = (updatedAt) => {
  const days = typeof updatedAt === "number" ? updatedAt : Math.floor((Date.now() - new Date(updatedAt).getTime()) / 86400000);

  if (days <= 0) return "Updated today";
  if (days === 1) return "Updated 1 day ago";
  return `Updated ${days} days ago`;
};
