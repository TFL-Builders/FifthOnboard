const TASK_NAME_POOL = [
  "Sign employment contract and NDA",
  "Complete tax and banking forms",
  "Set up company email account",
  "Provision laptop and peripherals",
  "Grant access to internal tools",
  "Complete benefits enrollment",
  "Attend orientation session",
  "Meet with supervisor for 1:1",
  "Review team documentation",
  "Set up development environment",
  "Complete security training",
  "Shadow a team member",
  "Present short demo to team",
  "Ship first independent change to production",
  "Complete compliance training",
  "Set up payroll direct deposit",
  "Review company handbook",
  "Join relevant Slack channels",
  "Schedule 30-day check-in",
  "Complete role-specific certification",
  "Set up VPN access",
  "Attend department all-hands",
  "Finalize workstation setup",
  "Complete 90-day performance review prep",
  "Send resolution summary to supervisor",
];

// "Employee" tasks are the new hire's own to-dos (checkable from their hire
// portal); the rest are things staff do on their behalf (visible there as
// read-only status).
export const TASK_ROLES = ["Employee", "HR", "IT", "Manager"];

export const PHASES = ["Pre-start", "Day 1", "First week", "First month"];

const phaseFor = (i, total) => {
  const chunkSize = Math.ceil(total / PHASES.length);
  return PHASES[Math.min(Math.floor(i / chunkSize), PHASES.length - 1)];
};

// Deterministic mock task list for a given onboarding record — there's no
// backend yet, so `record.progress` (a rough starting point set at seed
// time) decides how many of the generated tasks start out done.
export const generateTasksForRecord = (record, taskCount) => {
  const completedCount = Math.round((record.progress / 100) * taskCount);

  return Array.from({ length: taskCount }, (_, i) => ({
    id: i + 1,
    title: TASK_NAME_POOL[i % TASK_NAME_POOL.length],
    assigneeRole: TASK_ROLES[i % TASK_ROLES.length],
    phase: phaseFor(i, taskCount),
    done: i < completedCount,
  }));
};
