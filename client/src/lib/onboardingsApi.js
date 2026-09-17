// Wraps /api/v1/onboardings and /api/v1/tasks.

// The API's field names (newHireName, templateName, progressPercent, ...)
// don't match what the rest of the app's JSX already expects (name, template,
// progress, ...) — normalizing here means the table/detail components barely
// had to change when this switched from mock data to real fetches.
const normalizeOnboarding = (o) => ({
  id: o.id,
  name: o.newHireName,
  jobTitle: o.job ?? "",
  email: o.newHireEmail,
  template: o.templateName,
  manager: o.manager ?? "Unassigned",
  managerId: o.managerId && typeof o.managerId === "object" ? o.managerId._id : o.managerId ?? null,
  progress: o.progressPercent ?? 0,
  status: o.status,
  startDate: o.startDate,
  warnings: o.warnings ?? {},
  createdAt: o.createdAt,
  hirePortalExpiresAt: o.hirePortalExpiresAt,
  completedAt: o.completedAt,
});

export const listOnboardings = (authedApi, { status, search, managerId, startDate } = {}) => {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (search) params.set("search", search);
  if (managerId) params.set("managerId", managerId);
  if (startDate) params.set("startDate", startDate);
  const query = params.toString();
  return authedApi.get(`/onboardings${query ? `?${query}` : ""}`).then((res) => res.data.map(normalizeOnboarding));
};

export const getOnboarding = (authedApi, id) =>
  authedApi.get(`/onboardings/${id}`).then((res) => normalizeOnboarding(res.data));

export const getOnboardingTasks = (authedApi, id, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return authedApi.get(`/onboardings/${id}/tasks${query ? `?${query}` : ""}`).then((res) => res.data);
};

// Any valid onboarding ID works here — the API ignores :id entirely in this
// mode and returns the org's 5 most recently completed tasks overall.
export const getRecentlyCompleted = (authedApi, anyOnboardingId) =>
  getOnboardingTasks(authedApi, anyOnboardingId, { recentlyCompleted: "true" });

// Raw (un-normalized) response — the caller needs hirePortalToken and
// taskCount, which only exist on this one-time creation response.
export const createOnboarding = (authedApi, payload) => authedApi.post(`/onboardings`, payload).then((res) => res.data);

// No "data" wrapper on this one — just { message }.
export const cancelOnboarding = (authedApi, id) => authedApi.patch(`/onboardings/${id}/cancel`);

// PATCH /onboardings/:id requires the full body (templateId + startDate are
// mandatory on the schema even though the controller ignores/doesn't
// re-validate them for an update) — this exists so "change supervisor" can
// send one field's worth of *intent* without the caller re-deriving the rest.
export const updateOnboardingManager = (authedApi, id, current, managerId) =>
  authedApi
    .patch(`/onboardings/${id}`, {
      templateId: "000000000000000000000000",
      newHireName: current.name,
      newHireEmail: current.email,
      startDate: current.startDate,
      job: current.jobTitle || undefined,
      managerId,
    })
    .then((res) => normalizeOnboarding(res.data));

export const updateOnboardingDepartments = (authedApi, id, current, departmentMap) =>
  authedApi
    .patch(`/onboardings/${id}`, {
      templateId: "000000000000000000000000",
      newHireName: current.name,
      newHireEmail: current.email,
      startDate: current.startDate,
      job: current.jobTitle || undefined,
      managerId: current.managerId || undefined,
      departmentMap,
    })
    .then((res) => normalizeOnboarding(res.data));

export const updateTaskStatus = (authedApi, taskId, patch) =>
  authedApi.patch(`/tasks/${taskId}`, patch).then((res) => res.data);

export const getTaskComments = (authedApi, taskId) =>
  authedApi.get(`/tasks/${taskId}/comments`).then((res) => res.data);

export const addTaskComment = (authedApi, taskId, body) =>
  authedApi.post(`/tasks/${taskId}/comments`, { body }).then((res) => res.data);

// Staff-side action (hr/admin, Bearer-authed) despite the /hire URL prefix —
// (re)sends the new hire's portal-link email. Note: the server's email
// template for this is currently an empty file, so it sends successfully
// but the email body renders blank — a server-side content gap, not a bug here.
export const sendHireEmail = (authedApi, onboardingId, portalLink) =>
  authedApi.post(`/hire/${onboardingId}/send-email`, { portalLink });

export const formatRelativeTime = (dateString) => {
  const days = Math.floor((Date.now() - new Date(dateString).getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
};
