import { useState } from "react";
import { X, ChevronLeft, ChevronRight, FileText, Calendar, Mail, Check } from "lucide-react";
import { Avatar } from "./Avatar";
import { StatusBadge } from "./StatusBadge";
import { ProgressBar } from "./ProgressBar";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { SAMPLE_TEMPLATES } from "../data/mockTemplates";
import { PHASES } from "../data/mockTasks";

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

const taskAssigneeLabel = (task, record) => (task.assigneeRole === "Employee" ? record.name : task.assigneeRole);

const TasksTab = ({ record, onToggleTask }) => {
  const tasks = record.tasks;
  const doneCount = tasks.filter((t) => t.done).length;

  const tasksByPhase = PHASES.map((phase) => ({
    phase,
    tasks: tasks.filter((t) => t.phase === phase),
  })).filter((group) => group.tasks.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-medium">
          {doneCount}/{tasks.length} tasks done
        </span>
        <span className="text-[12px] text-[#64748B]">{record.progress}%</span>
      </div>
      <ProgressBar value={record.progress} />

      <div className="flex flex-col gap-4 max-h-96 overflow-y-auto">
        {tasksByPhase.map(({ phase, tasks: phaseTasks }) => (
          <div key={phase} className="flex flex-col gap-1">
            <div className="text-[12px] uppercase tracking-wide text-[#64748B] font-semibold mb-1">{phase}</div>
            {phaseTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => onToggleTask(record.id, task.id)}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-background text-left transition-colors"
              >
                <div
                  className={`w-4.5 h-4.5 rounded flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                    task.done ? "bg-primary border-primary" : "border-[#E5E7EB]"
                  }`}
                >
                  {task.done && <Check className="text-white" size={12} />}
                </div>
                <div className="min-w-0">
                  <div className={`text-[14px] ${task.done ? "text-[#94A3B8] line-through" : ""}`}>{task.title}</div>
                  <div className="text-[12px] text-[#64748B]">{taskAssigneeLabel(task, record)}</div>
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const DetailsTab = ({ record, taskCount }) => (
  <div className="flex flex-col gap-4">
    <DetailRow icon={Mail} label="Work email" value={record.email || "—"} />
    <DetailRow icon={FileText} label="Template" value={`${record.template} · ${taskCount} tasks`} />
    <DetailRow icon={Calendar} label="Start date" value={record.startDate || "Not set"} />

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
      <Button variant="secondary" type="button" className="px-3 py-1.5 text-[13px]">
        Change
      </Button>
    </div>
  </div>
);

export const OnboardingDetailModal = ({ records, index, onClose, onNavigate, onToggleTask, onMarkComplete }) => {
  const [tab, setTab] = useState("Details");
  const record = records[index];

  if (!record) return null;

  const template = SAMPLE_TEMPLATES.find((t) => t.name === record.template);

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
              {record.jobTitle} · {template?.name ?? record.template}
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
              {t === "Tasks" && template && (
                <span className="ml-1.5 text-[11px] bg-background rounded-full px-1.5 py-0.5">{template.taskCount}</span>
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === "Tasks" ? (
            <TasksTab record={record} onToggleTask={onToggleTask} />
          ) : (
            <DetailsTab record={record} taskCount={template?.taskCount ?? record.tasks.length} />
          )}
        </div>

        <div className="flex justify-between gap-3 px-6 pb-6">
          <Button
            variant="primary"
            type="button"
            disabled={record.status === "completed"}
            onClick={() => onMarkComplete(record.id)}
            className="w-auto px-5 h-11"
          >
            <Check size={16} />
            Mark Complete
          </Button>
          <Button variant="secondary" type="button" className="px-4 h-11">
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
};
