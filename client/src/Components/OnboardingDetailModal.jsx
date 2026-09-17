import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, FileText, Calendar, Mail, Check, Ban, AlertTriangle } from "lucide-react";
import { Avatar } from "./Avatar";
import { StatusBadge } from "./StatusBadge";
import { ProgressBar } from "./ProgressBar";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { Select } from "./Select";
import { ErrorBanner } from "./ErrorBanner";
import { ConfirmDialog } from "./ConfirmDialog";
import { TaskComments } from "./TaskComments";
import { useAuthedApi } from "../hooks/useAuthedApi";
import { useAuth } from "../context/AuthContext";
import {
  getOnboarding,
  getOnboardingTasks,
  updateTaskStatus,
  cancelOnboarding,
  updateOnboardingManager,
  updateOnboardingDepartments,
} from "../lib/onboardingsApi";
import { listUsers } from "../lib/usersApi";
import { getErrorMessage } from "../lib/getErrorMessage";
import { departmentValueToLabel, phaseValueToLabel, PHASE_LABELS } from "../lib/templateEnums";

const TABS = ["Details", "Tasks"];
const TASK_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
  { value: "blocked", label: "Blocked" },
];

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

const taskAssigneeLabel = (task) => task.completedBy ?? task.assignee ?? departmentValueToLabel(task.assigneeDepartment);

const TaskRow = ({ task, onToggle, onSetStatus, canEdit = true }) => {
  const [blocking, setBlocking] = useState(false);
  const [reasonDraft, setReasonDraft] = useState("");
  const done = task.status === "done";
  const uploadLocked = task.requiresUpload && task.status !== "done";

  if (!canEdit) {
    return (
      <div className="flex flex-col gap-1.5 p-2 rounded-lg">
        <div className="flex items-start gap-3">
          <div
            className={`w-4.5 h-4.5 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
              done ? "bg-primary border-primary" : "border-[#E5E7EB]"
            }`}
          >
            {done && <Check className="text-white" size={12} />}
          </div>
          <div className="min-w-0 flex-1">
            <div className={`text-[14px] ${done ? "text-[#94A3B8] line-through" : ""}`}>{task.title}</div>
            <div className="text-[12px] text-[#64748B]">{taskAssigneeLabel(task)}</div>
            {task.status === "blocked" && task.blockedReason && (
              <div className="text-[11px] text-red-500 mt-0.5">Blocked: {task.blockedReason}</div>
            )}
          </div>
          <span className="text-[12px] text-[#64748B] shrink-0 mt-0.5">
            {TASK_STATUS_OPTIONS.find((o) => o.value === task.status)?.label ?? task.status}
          </span>
        </div>
        <div className="pl-7">
          <TaskComments taskId={task.id} />
        </div>
      </div>
    );
  }

  const handleClick = () => {
    if (uploadLocked) return;
    onToggle(task);
  };

  const handleStatusChange = (e) => {
    const next = e.target.value;
    if (next === "blocked") {
      setBlocking(true);
      return;
    }
    onSetStatus(task, next);
  };

  const confirmBlock = () => {
    if (!reasonDraft.trim()) return;
    onSetStatus(task, "blocked", reasonDraft.trim());
    setBlocking(false);
    setReasonDraft("");
  };

  const statusOptions = uploadLocked
    ? TASK_STATUS_OPTIONS.filter((o) => o.value !== "done")
    : TASK_STATUS_OPTIONS;

  return (
    <div className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-background transition-colors">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={handleClick}
          disabled={uploadLocked}
          className={`flex items-start gap-3 flex-1 min-w-0 text-left ${uploadLocked ? "cursor-not-allowed" : ""}`}
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
            {uploadLocked && (
              <div className="text-[11px] text-[#B45309] mt-0.5">
                Requires the new hire to upload a file from their portal.
              </div>
            )}
            {task.status === "blocked" && task.blockedReason && (
              <div className="text-[11px] text-red-500 mt-0.5">Blocked: {task.blockedReason}</div>
            )}
          </div>
        </button>

        <select
          value={blocking ? "blocked" : task.status}
          onChange={handleStatusChange}
          disabled={blocking}
          className="text-[12px] border border-[#E5E7EB] hover:border-primary focus:border-primary focus:outline-none rounded-md h-7 pl-1.5 pr-1 bg-white shrink-0 disabled:opacity-70"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {blocking && (
        <div className="flex items-center gap-2 pl-7">
          <input
            type="text"
            value={reasonDraft}
            onChange={(e) => setReasonDraft(e.target.value)}
            placeholder="Why is this blocked?"
            className="flex-1 text-[12px] border border-[#E5E7EB] focus:border-primary focus:outline-none rounded-md h-8 px-2 bg-white"
          />
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              setBlocking(false);
              setReasonDraft("");
            }}
            className="h-8 px-2.5 text-[12px]"
          >
            Cancel
          </Button>
          <Button variant="primary" type="button" onClick={confirmBlock} disabled={!reasonDraft.trim()} className="h-8 px-2.5 text-[12px] w-auto">
            Confirm
          </Button>
        </div>
      )}

      <div className="pl-7">
        <TaskComments taskId={task.id} />
      </div>
    </div>
  );
};

const TasksTab = ({ tasks, progress, onToggleTask, onSetStatus, onMarkComplete, markingComplete, canEdit }) => {
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const completableRemaining = tasks.filter((t) => t.status !== "done" && !t.requiresUpload);

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
            {phaseTasks.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={onToggleTask} onSetStatus={onSetStatus} canEdit={canEdit} />
            ))}
          </div>
        ))}

        {tasks.length === 0 && <div className="text-[14px] text-[#94A3B8] text-center py-4">No tasks yet.</div>}
      </div>

      {canEdit && completableRemaining.length > 0 && (
        <Button variant="secondary" type="button" onClick={onMarkComplete} disabled={markingComplete} className="w-auto self-start px-4">
          {markingComplete ? "Marking complete..." : "Mark all remaining tasks complete"}
        </Button>
      )}
    </div>
  );
};

const DetailsTab = ({ record, taskCount, onChangeManagerClick, onFixAssignmentsClick, unassignedDepartmentCount, canManage }) => (
  <div className="flex flex-col gap-4">
    {(record.warnings?.hasUnassignedTasks || record.warnings?.hasNoManager) && (
      <div className="flex items-start gap-2 text-[13px] text-[#B45309] bg-[#FEF3C7] rounded-lg px-3 py-2.5">
        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
        <div>
          {record.warnings?.hasNoManager && (
            <div>{canManage ? 'No supervisor is assigned yet — use "Change" below to set one.' : "No supervisor is assigned yet."}</div>
          )}
          {record.warnings?.hasUnassignedTasks && (
            <div>
              {unassignedDepartmentCount} department{unassignedDepartmentCount === 1 ? "" : "s"} still need
              {unassignedDepartmentCount === 1 ? "s" : ""} someone assigned to their tasks.{" "}
              {canManage && (
                <button type="button" onClick={onFixAssignmentsClick} className="underline hover:brightness-110">
                  Fix now
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )}

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
      {canManage && (
        <Button variant="secondary" type="button" className="px-3 py-1.5 text-[13px]" onClick={onChangeManagerClick}>
          Change
        </Button>
      )}
    </div>
  </div>
);

export const OnboardingDetailModal = ({ records, index, onClose, onNavigate, onChanged }) => {
  const { user } = useAuth();
  const canManage = ["admin", "hr"].includes(user?.role);
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
  const [fixingAssignments, setFixingAssignments] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [pendingManagerId, setPendingManagerId] = useState("");
  const [savingManager, setSavingManager] = useState(false);
  const [departmentDrafts, setDepartmentDrafts] = useState({});
  const [savingAssignments, setSavingAssignments] = useState(false);

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
    setFixingAssignments(false);
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record?.id]);

  if (!record) return null;

  const unassignedDepartments = [
    ...new Set(
      tasks
        .filter((t) => t.assigneeDepartment !== "new_hire" && t.assigneeDepartment !== "manager" && t.assignee === "Unassigned")
        .map((t) => t.assigneeDepartment)
    ),
  ];

  const ensureUsersLoaded = () => {
    if (users.length === 0) {
      setUsersLoading(true);
      listUsers(authedApi, { status: "active" })
        .then(setUsers)
        .catch((err) => setError(getErrorMessage(err).message))
        .finally(() => setUsersLoading(false));
    }
  };

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

  const handleSetStatus = async (task, status, blockedReason) => {
    try {
      await updateTaskStatus(authedApi, task.id, { status, ...(status === "blocked" ? { blockedReason } : {}) });
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
        tasks
          .filter((t) => t.status !== "done" && !t.requiresUpload)
          .map((t) => updateTaskStatus(authedApi, t.id, { status: "done" }))
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
    ensureUsersLoaded();
  };

  const openFixAssignments = () => {
    setDepartmentDrafts({});
    setFixingAssignments(true);
    ensureUsersLoaded();
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

  const handleSaveAssignments = async () => {
    const departmentMap = Object.fromEntries(Object.entries(departmentDrafts).filter(([, v]) => v));
    setSavingAssignments(true);
    try {
      await updateOnboardingDepartments(authedApi, record.id, detail, departmentMap);
      setFixingAssignments(false);
      loadDetail();
      onChanged?.();
    } catch (err) {
      setError(getErrorMessage(err).message);
    } finally {
      setSavingAssignments(false);
    }
  };

  const canCancel = detail && detail.status === "active";
  const canSaveAssignments = Object.values(departmentDrafts).some(Boolean);

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
          ) : fixingAssignments ? (
            <div className="flex flex-col gap-3">
              <div className="text-[14px] font-medium">Fix department assignments</div>
              {usersLoading ? null : unassignedDepartments.length === 0 ? (
                <div className="text-[13px] text-[#64748B]">Everything is assigned now.</div>
              ) : (
                unassignedDepartments.map((dept) => (
                  <Select
                    key={dept}
                    label={departmentValueToLabel(dept)}
                    id={`fix-dept-${dept}`}
                    value={departmentDrafts[dept] ?? ""}
                    onChange={(e) => setDepartmentDrafts((prev) => ({ ...prev, [dept]: e.target.value }))}
                    options={[{ value: "", label: "Leave unassigned" }, ...users.map((u) => ({ value: u.id, label: u.name }))]}
                    noMargin
                  />
                ))
              )}
              <div className="flex gap-2">
                <Button variant="secondary" type="button" onClick={() => setFixingAssignments(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="button"
                  onClick={handleSaveAssignments}
                  disabled={savingAssignments || !canSaveAssignments}
                  className="flex-1 w-auto"
                >
                  {savingAssignments ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : tab === "Tasks" ? (
            <TasksTab
              tasks={tasks}
              progress={detail?.progress ?? record.progress}
              onToggleTask={handleToggleTask}
              onSetStatus={handleSetStatus}
              onMarkComplete={handleMarkComplete}
              markingComplete={markingComplete}
              canEdit={canManage}
            />
          ) : (
            <DetailsTab
              record={detail ?? record}
              taskCount={tasks.length}
              onChangeManagerClick={openChangeManager}
              onFixAssignmentsClick={openFixAssignments}
              unassignedDepartmentCount={unassignedDepartments.length}
              canManage={canManage}
            />
          )}
        </div>

        {!loading && !changingManager && !fixingAssignments && canManage && (
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
