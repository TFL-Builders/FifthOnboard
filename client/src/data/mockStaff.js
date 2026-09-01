// The whole department's staff directory — this app is scoped to a single
// department, not an organization, so any "who should handle this" picker
// (manager, team members, task assignee) draws from this one flat list
// rather than being split up by sub-department.
export const DEPARTMENT_STAFF = [
  { id: 1, name: "Sampler Temple", role: "HR" },
  { id: 2, name: "John Smith", role: "Engineering Manager" },
  { id: 3, name: "Ava Okoye", role: "Senior Engineer" },
  { id: 4, name: "Daniel Reyes", role: "IT Support" },
  { id: 5, name: "Priya Nair", role: "People Ops" },
  { id: 6, name: "Marcus Lee", role: "Team Lead" },
];
