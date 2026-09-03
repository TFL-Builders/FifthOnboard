// Wraps /api/v1/users. Real org roster — replaces the invented mockStaff.js
// list for any "who should handle this" picker (manager, supervisor).

export const listUsers = (authedApi, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return authedApi.get(`/users${query ? `?${query}` : ""}`).then((res) => res.data);
};

export const ROLE_LABELS = {
  admin: "Admin",
  hr: "HR",
  manager: "Manager",
  employee: "Employee",
  task_owner: "Task Owner",
};
