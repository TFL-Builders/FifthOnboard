import { createContext, useContext, useState } from "react";
import { SAMPLE_TEMPLATES } from "../data/mockTemplates";
import { generateTasksForRecord } from "../data/mockTasks";

const OnboardingsContext = createContext(undefined);

const getTaskCount = (templateName) => SAMPLE_TEMPLATES.find((t) => t.name === templateName)?.taskCount ?? 10;

const getProgress = (tasks) =>
  tasks.length === 0 ? 0 : Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100);

// A record's `tasks` array is the single source of truth — `progress` and
// `status` are always derived from it so the internal table, the detail
// modal, and the public hire portal can never drift out of sync.
const seedRecord = (record) => {
  const tasks = record.tasks ?? generateTasksForRecord(record, getTaskCount(record.template));
  const progress = getProgress(tasks);
  return { ...record, tasks, progress, status: progress === 100 ? "completed" : "active" };
};

const INITIAL_RECORDS = [
  { id: 1, portalId: "alicia-chen-a1b2c3", name: "Alicia Chen", jobTitle: "Software Engineer", email: "alicia.chen@fifthlab.com", template: "Engineering Onboarding", manager: "John Smith", startDate: "2026-08-25", progress: 0 },
  { id: 2, portalId: "marcus-webb-d4e5f6", name: "Marcus Webb", jobTitle: "Software Engineer", email: "marcus.webb@fifthlab.com", template: "Engineering Onboarding", manager: "John Smith", startDate: "2026-08-18", progress: 45 },
  { id: 3, portalId: "priya-sharma-g7h8i9", name: "Priya Sharma", jobTitle: "Product Manager", email: "priya.sharma@fifthlab.com", template: "Engineering Onboarding", manager: "Unassigned", startDate: "2026-08-20", progress: 12 },
  { id: 4, portalId: "noah-bennett-j1k2l3", name: "Noah Bennett", jobTitle: "Sales Rep", email: "noah.bennett@fifthlab.com", template: "Sales Onboarding", manager: "Unassigned", startDate: "2026-07-14", progress: 100 },
  { id: 5, portalId: "grace-kim-m4n5o6", name: "Grace Kim", jobTitle: "HR Coordinator", email: "grace.kim@fifthlab.com", template: "HR Onboarding", manager: "Sampler Temple", startDate: "2026-08-10", progress: 68 },
].map(seedRecord);

export const OnboardingsProvider = ({ children }) => {
  const [records, setRecords] = useState(INITIAL_RECORDS);

  const addRecord = (record) => setRecords((prev) => [seedRecord(record), ...prev]);

  const updateRecord = (id, patch) =>
    setRecords((prev) => prev.map((record) => (record.id === id ? { ...record, ...patch } : record)));

  const toggleTask = (id, taskId) =>
    setRecords((prev) =>
      prev.map((record) => {
        if (record.id !== id) return record;
        const tasks = record.tasks.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task));
        const progress = getProgress(tasks);
        return { ...record, tasks, progress, status: progress === 100 ? "completed" : "active" };
      })
    );

  const markComplete = (id) =>
    setRecords((prev) =>
      prev.map((record) =>
        record.id === id
          ? { ...record, tasks: record.tasks.map((task) => ({ ...task, done: true })), progress: 100, status: "completed" }
          : record
      )
    );

  const getByPortalId = (portalId) => records.find((record) => record.portalId === portalId);

  return (
    <OnboardingsContext.Provider value={{ records, addRecord, updateRecord, toggleTask, markComplete, getByPortalId }}>
      {children}
    </OnboardingsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useOnboardings = () => {
  const context = useContext(OnboardingsContext);
  if (!context) {
    throw new Error("useOnboardings must be used within an OnboardingsProvider");
  }
  return context;
};
