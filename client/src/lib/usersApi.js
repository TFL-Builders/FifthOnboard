// Wraps /api/v1/users. Real org roster — replaces the invented mockStaff.js
// list for any "who should handle this" picker (manager, supervisor).

export const listUsers = (authedApi, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return authedApi.get(`/users${query ? `?${query}` : ""}`).then((res) => res.data);
};

// disable (soft-delete) a user; reassignTo optionally moves their open tasks
// (and, if they were a manager, their onboardings) to another user instead
// of leaving them unassigned.
export const deleteUser = (authedApi, id, reassignTo) =>
  authedApi.delete(`/users/${id}`, { body: reassignTo ? { reassignTo } : undefined });

export const ROLE_LABELS = {
  admin: "Admin",
  hr: "HR",
  manager: "Manager",
  employee: "Employee",
  task_owner: "Task Owner",
};

// The org-wide "which team does this person sit in" field — same enum the
// template task builder uses for assigneeDepartment, minus "new_hire" (that
// value only applies to tasks, never to a real staff account).
export const DEPARTMENT_LABELS = ["HR", "Manager", "IT", "Finance", "Custom"];

const DEPARTMENT_TO_VALUE = { HR: "hr", Manager: "manager", IT: "it", Finance: "finance", Custom: "custom" };
const VALUE_TO_DEPARTMENT = Object.fromEntries(Object.entries(DEPARTMENT_TO_VALUE).map(([k, v]) => [v, k]));

export const departmentLabelToValue = (label) => DEPARTMENT_TO_VALUE[label] ?? "";
export const departmentValueToLabel = (value) => VALUE_TO_DEPARTMENT[value] ?? "—";
