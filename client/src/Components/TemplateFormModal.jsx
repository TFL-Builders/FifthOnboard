import { useEffect, useState } from "react";
import { X, Plus, GripVertical } from "lucide-react";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { Select } from "./Select";
import { Button } from "./Button";
import { ErrorBanner } from "./ErrorBanner";
import { useAuthedApi } from "../hooks/useAuthedApi";
import { getTemplate, createTemplate, updateTemplate } from "../lib/templatesApi";
import { getErrorMessage } from "../lib/getErrorMessage";
import {
  DEPARTMENT_LABELS,
  PHASE_LABELS,
  departmentLabelToValue,
  departmentValueToLabel,
  phaseLabelToValue,
  phaseValueToLabel,
} from "../lib/templateEnums";

const createTask = () => ({
  id: crypto.randomUUID(),
  title: "",
  description: "",
  assigneeRole: DEPARTMENT_LABELS[0],
  phase: PHASE_LABELS[0],
  dueOffsetDays: 0,
  requiresFileUpload: false,
});

// Same modal for both flows: pass a `templateId` to edit an existing
// template (fetched fresh from the API, since the list view only has
// taskCount, not full task detail), or omit it to create a new one.
export const TemplateFormModal = ({ templateId, onClose, onSaved }) => {
  const authedApi = useAuthedApi();
  const isEditing = Boolean(templateId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState(() => [createTask()]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditing) return;

    let cancelled = false;
    getTemplate(authedApi, templateId)
      .then((template) => {
        if (cancelled) return;
        setName(template.name);
        setDescription(template.description ?? "");
        setTasks(
          (template.tasks ?? []).map((task) => ({
            id: task.id,
            title: task.title,
            description: task.description ?? "",
            assigneeRole: departmentValueToLabel(task.assigneeDepartment),
            phase: phaseValueToLabel(task.phase),
            dueOffsetDays: task.dueOffsetDays ?? 0,
            requiresFileUpload: Boolean(task.requiresUpload),
          }))
        );
      })
      .catch((err) => !cancelled && setError(getErrorMessage(err).message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  const updateTask = (id, patch) =>
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...patch } : task)));

  const removeTask = (id) => setTasks((prev) => prev.filter((task) => task.id !== id));

  const addTask = () => setTasks((prev) => [...prev, createTask()]);

  const tasksByPhase = PHASE_LABELS.map((phase) => ({
    phase,
    tasks: tasks.filter((task) => task.phase === phase),
  })).filter((group) => group.tasks.length > 0);

  const canSave = name.trim().length > 0 && tasks.length > 0 && tasks.every((task) => task.title.trim().length > 0);

  const handleSave = async () => {
    if (!canSave) return;

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      templateTasks: tasks.map((task, index) => ({
        title: task.title.trim(),
        description: task.description.trim() || undefined,
        assigneeDepartment: departmentLabelToValue(task.assigneeRole),
        phase: phaseLabelToValue(task.phase),
        dueOffsetDays: task.dueOffsetDays,
        order: index,
        requiresUpload: task.requiresFileUpload,
      })),
    };

    setError("");
    setSaving(true);
    try {
      const saved = isEditing ? await updateTemplate(authedApi, templateId, payload) : await createTemplate(authedApi, payload);
      onSaved(saved);
    } catch (err) {
      setError(getErrorMessage(err).message);
    } finally {
      setSaving(false);
    }
  };

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
          <div className="text-[30px] font-bold">{isEditing ? "Edit Template" : "New Template"}</div>
          <div className="text-[16px] text-[#64748B] mt-1">Define a reusable onboarding checklist for new hires.</div>
        </div>

        {loading ? null : (
          <>
            <div className="px-6 pt-4">
              <ErrorBanner message={error} />
            </div>

            <div className="p-6 pt-0 flex flex-col gap-4">
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

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Select
                              label="Phase"
                              id={`task-phase-${task.id}`}
                              value={task.phase}
                              onChange={(e) => updateTask(task.id, { phase: e.target.value })}
                              options={PHASE_LABELS}
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

                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2 text-[14px] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={task.assigneeRole === "Employee"}
                              onChange={(e) =>
                                updateTask(task.id, {
                                  assigneeRole: e.target.checked ? "Employee" : DEPARTMENT_LABELS[0],
                                  requiresFileUpload: e.target.checked ? task.requiresFileUpload : false,
                                })
                              }
                              className="w-4 h-4 accent-primary"
                            />
                            Assign to new hire (shows on their onboarding portal)
                          </label>

                          {task.assigneeRole === "Employee" && (
                            <label className="flex items-center gap-2 text-[14px] cursor-pointer pl-6">
                              <input
                                type="checkbox"
                                checked={task.requiresFileUpload}
                                onChange={(e) => updateTask(task.id, { requiresFileUpload: e.target.checked })}
                                className="w-4 h-4 accent-primary"
                              />
                              Requires file upload
                            </label>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 p-6 pt-0">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="button" onClick={handleSave} disabled={!canSave || saving || loading} className="w-auto px-6 h-11">
            {saving ? "Saving..." : "Save Template"}
          </Button>
        </div>
      </div>
    </div>
  );
};
