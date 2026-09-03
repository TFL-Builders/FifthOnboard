// The task builder shows friendly labels; the API stores lowercase/snake_case
// enums. Keeping the mapping here means <Select> never has to know the
// difference — it just deals in label strings like every other Select in the app.

export const DEPARTMENT_LABELS = ["HR", "Manager", "IT", "Finance", "Custom", "Employee"];
export const PHASE_LABELS = ["Pre-start", "Week 1", "Week 2", "Week 3+"];

const DEPARTMENT_TO_VALUE = {
  HR: "hr",
  Manager: "manager",
  IT: "it",
  Finance: "finance",
  Custom: "custom",
  Employee: "new_hire",
};
const VALUE_TO_DEPARTMENT = Object.fromEntries(Object.entries(DEPARTMENT_TO_VALUE).map(([k, v]) => [v, k]));

const PHASE_TO_VALUE = {
  "Pre-start": "pre_start",
  "Week 1": "week_1",
  "Week 2": "week_2",
  "Week 3+": "week_3_plus",
};
const VALUE_TO_PHASE = Object.fromEntries(Object.entries(PHASE_TO_VALUE).map(([k, v]) => [v, k]));

export const departmentLabelToValue = (label) => DEPARTMENT_TO_VALUE[label] ?? "custom";
export const departmentValueToLabel = (value) => VALUE_TO_DEPARTMENT[value] ?? "Custom";
export const phaseLabelToValue = (label) => PHASE_TO_VALUE[label] ?? "pre_start";
export const phaseValueToLabel = (value) => VALUE_TO_PHASE[value] ?? "Pre-start";
