import { useState } from "react";
import { X, Plus, GripVertical } from "lucide-react";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { Select } from "./Select";
import { Button } from "./Button";

const PHASES = ["Pre-start", "Day 1", "First week", "First month"];
const ROLES = ["HR", "IT", "Manager", "Employee"];

const createTask = () => ({
  id: crypto.randomUUID(),
  title: "",
  description: "",
  assigneeRole: ROLES[0],
  phase: PHASES[0],
  dueOffsetDays: 0,
  requiresFileUpload: false,
});

export const NewTemplateModal = ({ onClose }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState(() => [createTask()]);

  const updateTask = (id, patch) =>
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...patch } : task)));

  const removeTask = (id) => setTasks((prev) => prev.filter((task) => task.id !== id));

  const addTask = () => setTasks((prev) => [...prev, createTask()]);

  const tasksByPhase = PHASES.map((phase) => ({
    phase,
    tasks: tasks.filter((task) => task.phase === phase),
  })).filter((group) => group.tasks.length > 0);

  const canSave = name.trim().length > 0 && tasks.length > 0 && tasks.every((task) => task.title.trim().length > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-8 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-[#64748B] hover:text-black transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="p-6 pb-0">
          <div className="text-[30px] font-bold">New Template</div>
          <div className="text-[16px] text-[#64748B] mt-1">Define a reusable onboarding checklist for new hires.</div>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="border border-[#E5E7EB] rounded-xl p-4 flex flex-col gap-3">
            <div className="text-[12px] uppercase tracking-wide text-[#64748B] font-semibold">Template info</div>

            <Input
              label="Template name"
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Engineering onboarding"
              noMargin
              className="w-full"
            />

            <Textarea
              label={
                <>
                  Description <span className="text-[#94A3B8] font-normal">(optional)</span>
                </>
              }
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this template is for"
              noMargin
              className="w-full"
            />
          </div>

          <div className="border border-[#E5E7EB] rounded-xl p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-[12px] uppercase tracking-wide text-[#64748B] font-semibold">Tasks</span>
                <span className="text-[12px] text-[#94A3B8]">{tasks.length} total</span>
              </div>
              <Button variant="action" type="button" onClick={addTask} className="h-9 px-3 text-[14px]">
                <Plus size={16} />
                Add task
              </Button>
            </div>

            {tasksByPhase.map(({ phase, tasks: phaseTasks }) => (
              <div key={phase} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] uppercase tracking-wide text-[#64748B] font-semibold">{phase}</span>
                  <span className="text-[11px] bg-[#ECFEFF] text-[#0891B2] rounded-full w-5 h-5 flex items-center justify-center">
                    {phaseTasks.length}
                  </span>
                  <div className="flex-1 border-t border-[#E5E7EB]" />
                </div>

                {phaseTasks.map((task) => (
                  <div key={task.id} className="border border-[#E5E7EB] rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#64748B]">
                        <GripVertical size={16} />
                        <span className="text-[12px] uppercase tracking-wide font-semibold">
                          Task {tasks.indexOf(task) + 1}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTask(task.id)}
                        className="text-[#64748B] hover:text-black transition-colors"
                        aria-label="Remove task"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <Input
                      label={
                        <>
                          Title <span className="text-red-500">*</span>
                        </>
                      }
                      id={`task-title-${task.id}`}
                      value={task.title}
                      onChange={(e) => updateTask(task.id, { title: e.target.value })}
                      placeholder="e.g. Complete payroll form"
                      noMargin
                      className="w-full"
                    />

                    <Textarea
                      label="Description"
                      id={`task-description-${task.id}`}
                      value={task.description}
                      onChange={(e) => updateTask(task.id, { description: e.target.value })}
                      placeholder="Optional instructions for this task"
                      noMargin
                      className="w-full"
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Select
                          label="Assignee role"
                          id={`task-role-${task.id}`}
                          value={task.assigneeRole}
                          onChange={(e) => updateTask(task.id, { assigneeRole: e.target.value })}
                          options={ROLES}
                          noMargin
                        />
                      </div>
                      <div>
                        <Select
                          label="Phase"
                          id={`task-phase-${task.id}`}
                          value={task.phase}
                          onChange={(e) => updateTask(task.id, { phase: e.target.value })}
                          options={PHASES}
                          noMargin
                        />
                      </div>
                      <div>
                        <Input
                          label="Due (offset days)"
                          id={`task-due-${task.id}`}
                          type="number"
                          value={task.dueOffsetDays}
                          onChange={(e) => updateTask(task.id, { dueOffsetDays: Number(e.target.value) })}
                          noMargin
                          className="w-full"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-[14px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={task.requiresFileUpload}
                        onChange={(e) => updateTask(task.id, { requiresFileUpload: e.target.checked })}
                        className="w-4 h-4 accent-primary"
                      />
                      Requires file upload
                    </label>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 pt-0">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          {/* not yet persisted — closes the modal for now */}
          <Button variant="primary" type="button" onClick={onClose} disabled={!canSave} className="w-auto px-6 h-11">
            Save Template
          </Button>
        </div>
      </div>
    </div>
  );
};
