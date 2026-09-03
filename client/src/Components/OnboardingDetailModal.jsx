import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, FileText, Calendar, Mail, Check, Ban } from "lucide-react";
import { Avatar } from "./Avatar";
import { StatusBadge } from "./StatusBadge";
import { ProgressBar } from "./ProgressBar";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { Select } from "./Select";
import { ErrorBanner } from "./ErrorBanner";
import { ConfirmDialog } from "./ConfirmDialog";
import { useAuthedApi } from "../hooks/useAuthedApi";
import { getOnboarding, getOnboardingTasks, updateTaskStatus, cancelOnboarding, updateOnboardingManager } from "../lib/onboardingsApi";
import { listUsers } from "../lib/usersApi";
import { getErrorMessage } from "../lib/getErrorMessage";
import { departmentValueToLabel, phaseValueToLabel, PHASE_LABELS } from "../lib/templateEnums";

const TABS = ["Details", "Tasks"];

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="bg-[#ECFEFF] rounded-md p-2 w-9 h-9 flex items-center justify-center shrink-0">
      <Icon className="text-[#0891B2]" size={16} />
    </div>
    <div className="min-w-0">
      <div className="text-[12px] text-[#64748B]">{label}</div>
      <div className="text-[14px] truncate">{value}</div>
    </div>
  </div>
);

const taskAssigneeLabel = (task) => task.assignee ?? departmentValueToLabel(task.assigneeDepartment);

const TasksTab = ({ tasks, progress, onToggleTask, onMarkComplete, markingComplete }) => {
  const doneCount = tasks.filter((t) => t.status === "done").length;

  const tasksByPhase = PHASE_LABELS.map((label) => ({
    phase: label,
    tasks: tasks.filter((t) => phaseValueToLabel(t.phase) === label),
  })).filter((group) => group.tasks.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-medium">
          {doneCount}/{tasks.length} tasks done
        </span>
        <span className="text-[12px] text-[#64748B]">{progress}%</span>
      </div>
      <ProgressBar value={progress} />

      <div className="flex flex-col gap-4 max-h-96 overflow-y-auto">
        {tasksByPhase.map(({ phase, tasks: phaseTasks }) => (
          <div key={phase} className="flex flex-col gap-1">
            <div className="text-[12px] uppercase tracking-wide text-[#64748B] font-semibold mb-1">{phase}</div>
            {phaseTasks.map((task) => {
              const done = task.status === "done";
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => onToggleTask(task)}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-background text-left transition-colors"
                >
                  <div
                    className={`w-4.5 h-4.5 rounded flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                      done ? "bg-primary border-primary" : "border-[#E5E7EB]"
                    }`}
                  >
                    {done && <Check className="text-white" size={12} />}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-[14px] ${done ? "text-[#94A3B8] line-through" : ""}`}>{task.title}</div>
                    <div className="text-[12px] text-[#64748B]">{taskAssigneeLabel(task)}</div>
                  </div>
                </button>
              );
            })}
          </div>
        ))}

        {tasks.length === 0 && <div className="text-[14px] text-[#94A3B8] text-center py-4">No tasks yet.</div>}
      </div>

      {doneCount < tasks.length && tasks.length > 0 && (
        <Button variant="secondary" type="button" onClick={onMarkComplete} disabled={markingComplete} className="w-auto self-start px-4">
          {markingComplete ? "Marking complete..." : "Mark all remaining tasks complete"}
        </Button>
      )}
    </div>
  );
};

const DetailsTab = ({ record, taskCount, onChangeManagerClick }) => (
  <div className="flex flex-col gap-4">
    <DetailRow icon={Mail} label="Work email" value={record.email || "—"} />
    <DetailRow icon={FileText} label="Template" value={`${record.template} · ${taskCount} tasks`} />
    <DetailRow icon={Calendar} label="Start date" value={record.startDate ? new Date(record.startDate).toLocaleDateString() : "Not set"} />

    <div>
      <div className="text-[12px] text-[#64748B] mb-1">Progress</div>
      <ProgressBar value={record.progress} />
    </div>

    <div className="border-t border-border pt-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar name={record.manager === "Unassigned" ? "?" : record.manager} size={36} />
        <div>
          <div className="text-[12px] text-[#64748B]">Supervisor</div>
          <div className={`text-[14px] font-medium ${record.manager === "Unassigned" ? "text-[#B45309]" : ""}`}>
            {record.manager}
          </div>
        </div>
      </div>
      <Button variant="secondary" type="button" className="px-3 py-1.5 text-[13px]" onClick={onChangeManagerClick}>
        Change
      </Button>
    </div>
  </div>
);

export const OnboardingDetailModal = ({ records, index, onClose, onNavigate, onChanged }) => {
  const authedApi = useAuthedApi();
  const [tab, setTab] = useState("Details");
  const [detail, setDetail] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingComplete, setMarkingComplete] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [changingManager, setChangingManager] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [pendingManagerId, setPendingManagerId] = useState("");
  const [savingManager, setSavingManager] = useState(false);

  const record = records[index];

  const loadDetail = () => {
    if (!record) return;
    setLoading(true);
    setError("");
    Promise.all([getOnboarding(authedApi, record.id), getOnboardingTasks(authedApi, record.id)])
      .then(([detailRes, tasksRes]) => {
        setDetail(detailRes);
        setTasks(tasksRes);
      })
      .catch((err) => setError(getErrorMessage(err).message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting UI state when switching to a different record, not derived state
    setTab("Details");
    setChangingManager(false);
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record?.id]);

  if (!record) return null;

  const handleToggleTask = async (task) => {
    const nextStatus = task.status === "done" ? "pending" : "done";
    try {
      await updateTaskStatus(authedApi, task.id, { status: nextStatus });
      loadDetail();
      onChanged?.();
    } catch (err) {
      setError(getErrorMessage(err).message);
    }
  };

  const handleMarkComplete = async () => {
    setMarkingComplete(true);
    try {
      await Promise.all(
        tasks.filter((t) => t.status !== "done").map((t) => updateTaskStatus(authedApi, t.id, { status: "done" }))
      );
      loadDetail();
      onChanged?.();
    } catch (err) {
      setError(getErrorMessage(err).message);
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelOnboarding(authedApi, record.id);
      setConfirmCancel(false);
      onChanged?.();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err).message);
      setCancelling(false);
    }
  };

  const openChangeManager = () => {
    setChangingManager(true);
    setPendingManagerId(detail?.managerId ?? "");
    if (users.length === 0) {
      setUsersLoading(true);
      listUsers(authedApi, { status: "active" })
        .then(setUsers)
        .catch((err) => setError(getErrorMessage(err).message))
        .finally(() => setUsersLoading(false));
    }
  };

  const handleSaveManager = async () => {
    setSavingManager(true);
    try {
      const updated = await updateOnboardingManager(authedApi, record.id, detail, pendingManagerId || null);
      setDetail(updated);
      setChangingManager(false);
      onChanged?.();
    } catch (err) {
      setError(getErrorMessage(err).message);
    } finally {
      setSavingManager(false);
    }
  };

  const canCancel = detail && detail.status === "active";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-8 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <StatusBadge status={record.status} />
            <span className="text-[12px] text-[#94A3B8]">
              {index + 1}/{records.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <IconButton
              aria-label="Previous onboarding"
              disabled={index === 0}
              onClick={() => onNavigate(index - 1)}
              className={index === 0 ? "opacity-30" : ""}
            >
              <ChevronLeft size={16} />
            </IconButton>
            <IconButton
              aria-label="Next onboarding"
              disabled={index === records.length - 1}
              onClick={() => onNavigate(index + 1)}
              className={index === records.length - 1 ? "opacity-30" : ""}
            >
              <ChevronRight size={16} />
            </IconButton>
            <IconButton aria-label="Close" onClick={onClose} className="ml-2">
              <X size={16} />
            </IconButton>
          </div>
        </div>

        <div className="p-6 pb-4 flex items-center gap-4">
          <Avatar name={record.name} size={48} />
          <div className="min-w-0">
            <div className="text-[20px] font-bold truncate">{record.name}</div>
            <div className="text-[14px] text-[#64748B] truncate">
              {record.jobTitle} · {record.template}
            </div>
          </div>
        </div>

        <div className="flex gap-1 px-6 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-3 py-2 text-[14px] border-b-2 -mb-px transition-colors ${
                tab === t ? "border-primary text-primary font-medium" : "border-transparent text-[#64748B] hover:text-black"
              }`}
            >
              {t}
              {t === "Tasks" && <span className="ml-1.5 text-[11px] bg-background rounded-full px-1.5 py-0.5">{tasks.length}</span>}
            </button>
          ))}
        </div>

        <div className="p-6">
          <ErrorBanner message={error} />

          {loading ? null : changingManager ? (
            <div className="flex flex-col gap-3">
              <div className="text-[14px] font-medium">Change supervisor</div>
              {usersLoading ? null : (
                <Select
                  label="Supervisor"
                  id="change-manager"
                  value={pendingManagerId}
                  onChange={(e) => setPendingManagerId(e.target.value)}
                  options={[{ value: "", label: "Unassigned" }, ...users.map((u) => ({ value: u.id, label: u.name }))]}
                  noMargin
                />
              )}
              <div className="flex gap-2">
                <Button variant="secondary" type="button" onClick={() => setChangingManager(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="primary" type="button" onClick={handleSaveManager} disabled={savingManager} className="flex-1 w-auto">
                  {savingManager ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : tab === "Tasks" ? (
            <TasksTab
              tasks={tasks}
              progress={detail?.progress ?? record.progress}
              onToggleTask={handleToggleTask}
              onMarkComplete={handleMarkComplete}
              markingComplete={markingComplete}
            />
          ) : (
            <DetailsTab record={detail ?? record} taskCount={tasks.length} onChangeManagerClick={openChangeManager} />
          )}
        </div>

        {!loading && !changingManager && (
          <div className="flex justify-between gap-3 px-6 pb-6">
            <Button variant="secondary" type="button" className="px-4 h-11" onClick={() => setConfirmCancel(true)} disabled={!canCancel}>
              <Ban size={16} />
              Cancel Onboarding
            </Button>
          </div>
        )}
      </div>

      {confirmCancel && (
        <ConfirmDialog
          title="Cancel this onboarding?"
          message="Every incomplete task will be marked blocked and the new hire's portal link will stop working immediately."
          confirmLabel="Cancel Onboarding"
          loading={cancelling}
          onConfirm={handleCancel}
          onCancel={() => setConfirmCancel(false)}
        />
      )}
    </div>
  );
};
