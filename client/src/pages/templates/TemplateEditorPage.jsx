import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Plus, X, ArrowLeft, ChevronRight } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { getTemplate, createTemplate, updateTemplate } from '../../api/templates'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const ASSIGNEE_ROLES = [
  { value: 'hr',       label: 'HR'       },
  { value: 'manager',  label: 'Manager'  },
  { value: 'new_hire', label: 'New hire' },
  { value: 'it',       label: 'IT'       },
  { value: 'finance',  label: 'Finance'  },
  { value: 'custom',   label: 'Custom'   },
]

const PHASES = [
  { value: 'pre_start',   label: 'Pre-start' },
  { value: 'week_1',      label: 'Week 1'    },
  { value: 'week_2',      label: 'Week 2'    },
  { value: 'week_3_plus', label: 'Week 3+'   },
]

const EMPTY_TASK = {
  title:          '',
  description:    '',
  assigneeRole:   'hr',
  phase:          'pre_start',
  dueOffsetDays:  0,
  order:          0,
  requiresUpload: false,
}

// ─────────────────────────────────────────────────────────────────────────────
// Zod schema
// ─────────────────────────────────────────────────────────────────────────────

const taskSchema = z.object({
  title:          z.string().min(1, 'Title is required'),
  description:    z.string().max(500).optional().or(z.literal('')),
  assigneeRole:   z.enum(['hr', 'manager', 'new_hire', 'it', 'finance', 'custom']),
  phase:          z.enum(['pre_start', 'week_1', 'week_2', 'week_3_plus']),
  dueOffsetDays:  z.coerce.number().int().default(0),
  order:          z.coerce.number().default(0),
  requiresUpload: z.boolean().default(false),
})

const schema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name must be 120 characters or fewer'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or fewer')
    .optional()
    .or(z.literal('')),
  templateTasks: z.array(taskSchema),
})

// ─────────────────────────────────────────────────────────────────────────────
// Shared field styles (mirrors Input component for non-Input elements)
// ─────────────────────────────────────────────────────────────────────────────

const fieldBase =
  'flex w-full rounded-[8px] border bg-transparent text-[14px] ' +
  'transition-colors placeholder:opacity-50 ' +
  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:border-primary ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

const fieldBorder = 'border-[var(--border-color)]'
const fieldBorderError = 'border-danger focus:ring-danger focus:border-danger'

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────────────────────────

function SkeletonBlock({ h = 'h-[38px]', w = 'w-full' }) {
  return (
    <div
      className={`${h} ${w} rounded-[8px] animate-pulse`}
      style={{ backgroundColor: 'var(--border-color)' }}
    />
  )
}

function SkeletonEditor() {
  return (
    <div className="space-y-4">
      {/* Info card */}
      <div
        className="rounded-[8px] border p-4 space-y-4"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        <SkeletonBlock h="h-[12px]" w="w-20" />
        <SkeletonBlock />
        <SkeletonBlock h="h-[12px]" w="w-24" />
        <SkeletonBlock h="h-[72px]" />
      </div>

      {/* Tasks card */}
      <div
        className="rounded-[8px] border p-4 space-y-3"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        <SkeletonBlock h="h-[12px]" w="w-28" />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-[8px] border p-3 space-y-2 animate-pulse"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div className="flex justify-between">
              <SkeletonBlock h="h-[13px]" w="w-32" />
              <SkeletonBlock h="h-[13px]" w="w-6" />
            </div>
            <SkeletonBlock h="h-[38px]" />
            <div className="grid grid-cols-3 gap-2">
              <SkeletonBlock h="h-[38px]" />
              <SkeletonBlock h="h-[38px]" />
              <SkeletonBlock h="h-[38px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TaskCard
// ─────────────────────────────────────────────────────────────────────────────

function TaskCard({ index, register, errors, remove }) {
  const taskErrors = errors?.templateTasks?.[index]

  return (
    <div
      className="rounded-[8px] border p-4 space-y-3"
      style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-app)' }}
    >
      {/* Card header */}
      <div className="flex items-center justify-between">
        <span
          className="text-[12px] font-semibold uppercase tracking-wide"
          style={{ color: 'var(--text-secondary)' }}
        >
          Task {index + 1}
        </span>
        <button
          type="button"
          onClick={() => remove(index)}
          aria-label={`Remove task ${index + 1}`}
          className="flex h-6 w-6 items-center justify-center rounded-[6px] cursor-pointer
            transition-colors hover:bg-black/8 dark:hover:bg-white/8
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
          style={{ color: 'var(--text-secondary)' }}
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>

      {/* Title */}
      <div className="space-y-1">
        <label
          htmlFor={`task-title-${index}`}
          className="block text-[12px] font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          Title <span className="text-danger" aria-hidden="true">*</span>
        </label>
        <input
          id={`task-title-${index}`}
          placeholder="e.g. Complete payroll form"
          className={`${fieldBase} h-[38px] px-3 ${taskErrors?.title ? fieldBorderError : fieldBorder}`}
          style={{ color: 'var(--text-primary)' }}
          aria-invalid={taskErrors?.title ? 'true' : undefined}
          aria-describedby={taskErrors?.title ? `task-title-${index}-error` : undefined}
          {...register(`templateTasks.${index}.title`)}
        />
        {taskErrors?.title && (
          <p
            id={`task-title-${index}-error`}
            className="text-[12px] text-danger"
            role="alert"
            aria-live="polite"
          >
            {taskErrors.title.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label
          htmlFor={`task-desc-${index}`}
          className="block text-[12px] font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          Description
        </label>
        <textarea
          id={`task-desc-${index}`}
          rows={2}
          placeholder="Optional instructions for this task"
          className={`${fieldBase} py-2 px-3 resize-none ${fieldBorder}`}
          style={{ color: 'var(--text-primary)', minHeight: '64px' }}
          {...register(`templateTasks.${index}.description`)}
        />
      </div>

      {/* Row: assignee role | phase | due offset */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Assignee role */}
        <div className="space-y-1">
          <label
            htmlFor={`task-role-${index}`}
            className="block text-[12px] font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            Assignee role
          </label>
          <select
            id={`task-role-${index}`}
            className={`${fieldBase} h-[38px] px-3 cursor-pointer ${fieldBorder}`}
            style={{ color: 'var(--text-primary)' }}
            {...register(`templateTasks.${index}.assigneeRole`)}
          >
            {ASSIGNEE_ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Phase */}
        <div className="space-y-1">
          <label
            htmlFor={`task-phase-${index}`}
            className="block text-[12px] font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            Phase
          </label>
          <select
            id={`task-phase-${index}`}
            className={`${fieldBase} h-[38px] px-3 cursor-pointer ${fieldBorder}`}
            style={{ color: 'var(--text-primary)' }}
            {...register(`templateTasks.${index}.phase`)}
          >
            {PHASES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Due offset days */}
        <div className="space-y-1">
          <label
            htmlFor={`task-offset-${index}`}
            className="block text-[12px] font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            Due (offset days)
          </label>
          <input
            id={`task-offset-${index}`}
            type="number"
            placeholder="0"
            className={`${fieldBase} h-[38px] px-3 ${taskErrors?.dueOffsetDays ? fieldBorderError : fieldBorder}`}
            style={{ color: 'var(--text-primary)' }}
            aria-invalid={taskErrors?.dueOffsetDays ? 'true' : undefined}
            {...register(`templateTasks.${index}.dueOffsetDays`)}
          />
        </div>
      </div>

      {/* Requires upload checkbox */}
      <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          className="h-4 w-4 rounded accent-primary cursor-pointer"
          {...register(`templateTasks.${index}.requiresUpload`)}
        />
        <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>
          Requires file upload
        </span>
      </label>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase group header
// ─────────────────────────────────────────────────────────────────────────────

function PhaseHeader({ label, count }) {
  return (
    <div className="flex items-center gap-2 pt-1 pb-0.5">
      <span
        className="text-[12px] font-semibold uppercase tracking-wide"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </span>
      <span
        className="inline-flex items-center justify-center h-[18px] min-w-[18px] px-1.5
          rounded-full text-[11px] font-medium"
        style={{
          backgroundColor: 'rgba(59,91,219,0.10)',
          color: 'var(--color-primary)',
        }}
      >
        {count}
      </span>
      <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-color)' }} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TemplateEditorPage
// ─────────────────────────────────────────────────────────────────────────────

export default function TemplateEditorPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const isEdit   = Boolean(id)

  // ── Form ───────────────────────────────────────────────────────────────────
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name:          '',
      description:   '',
      templateTasks: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'templateTasks',
  })

  // ── Query — edit mode only ─────────────────────────────────────────────────
  const { isLoading: queryLoading } = useQuery({
    queryKey: ['template', id],
    queryFn:  () => getTemplate(id).then((r) => r.data),
    enabled:  isEdit,
    onSuccess: (data) => {
      const t = data?.template ?? data
      reset({
        name:          t.name          ?? '',
        description:   t.description   ?? '',
        templateTasks: (t.templateTasks ?? []).map((task) => ({
          title:          task.title          ?? '',
          description:    task.description    ?? '',
          assigneeRole:   task.assigneeRole   ?? 'hr',
          phase:          task.phase          ?? 'pre_start',
          dueOffsetDays:  task.dueOffsetDays  ?? 0,
          order:          task.order          ?? 0,
          requiresUpload: task.requiresUpload ?? false,
        })),
      })
    },
  })

  // ── Mutations ──────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (payload) => createTemplate(payload),
    onSuccess: (res) => {
      const newId = res.data?.template?._id ?? res.data?._id
      if (newId) navigate(`/templates/${newId}`)
      else navigate('/templates')
    },
    onError: () => toast.error('Failed to create template'),
  })

  const updateMutation = useMutation({
    mutationFn: (payload) => updateTemplate(id, payload),
    onSuccess: () => toast.success('Template saved'),
    onError:   () => toast.error('Failed to save template'),
  })

  // ── Submit ─────────────────────────────────────────────────────────────────
  function onSubmit(values) {
    const payload = {
      ...values,
      templateTasks: values.templateTasks.map((task, i) => ({ ...task, order: i })),
    }
    if (isEdit) updateMutation.mutate(payload)
    else        createMutation.mutate(payload)
  }

  const isSaving = isSubmitting || createMutation.isPending || updateMutation.isPending
  const isLoading = isEdit && queryLoading

  // ── Group tasks by phase for display ──────────────────────────────────────
  const watchedTasks = watch('templateTasks')

  const phaseGroups = PHASES.map((phase) => ({
    ...phase,
    indices: fields
      .map((_, i) => i)
      .filter(
        (i) =>
          (watchedTasks?.[i]?.phase ?? fields[i]?.phase ?? 'pre_start') === phase.value,
      ),
  })).filter((g) => g.indices.length > 0)

  const unassignedIndices = fields
    .map((_, i) => i)
    .filter((i) => !phaseGroups.some((g) => g.indices.includes(i)))

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background:   'var(--bg-card)',
            color:        'var(--text-primary)',
            border:       '1px solid var(--border-color)',
            fontSize:     '14px',
            borderRadius: '8px',
          },
          error: { duration: Infinity },
        }}
      />

      <div
        className="min-h-screen"
        style={{ backgroundColor: 'var(--bg-app)' }}
      >
        {/* ── Sticky header ───────────────────────────────────────────────── */}
        <div
          className="sticky top-0 z-20 px-6"
          style={{
            backgroundColor: 'var(--bg-app)',
            borderBottom:    '1px solid var(--border-color)',
          }}
        >
          <div className="mx-auto flex h-14 w-full max-w-[760px] items-center justify-between gap-4">
            {/* Left: back + title */}
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => navigate('/templates')}
                aria-label="Back to templates"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] cursor-pointer
                  transition-colors hover:bg-black/5 dark:hover:bg-white/8
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ArrowLeft size={16} aria-hidden="true" />
              </button>

              {/* Breadcrumb */}
              <div
                className="hidden sm:flex items-center gap-1.5 text-[13px]"
                style={{ color: 'var(--text-secondary)' }}
              >
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => navigate('/templates')}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate('/templates')}
                >
                  Templates
                </span>
                <ChevronRight size={13} aria-hidden="true" />
                <span
                  className="font-medium truncate max-w-[180px]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {isEdit ? 'Edit template' : 'New template'}
                </span>
              </div>

              {/* Mobile title */}
              <h1
                className="sm:hidden text-[15px] font-semibold truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {isEdit ? 'Edit template' : 'New template'}
              </h1>
            </div>

            {/* Right: Cancel + Save */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => navigate('/templates')}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                loading={isSaving}
                disabled={isSaving}
                onClick={handleSubmit(onSubmit)}
              >
                {isEdit ? 'Save changes' : 'Create template'}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className="px-6 py-8">
          <div className="mx-auto w-full max-w-[760px]">

            {/* Desktop heading (below sticky bar) */}
            <div className="hidden sm:block mb-6">
              <h1
                className="text-[24px] font-semibold leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {isEdit ? 'Edit template' : 'New template'}
              </h1>
              <p
                className="mt-1 text-[14px]"
                style={{ color: 'var(--text-secondary)' }}
              >
                {isEdit
                  ? 'Update the template name, description, and tasks.'
                  : 'Define a reusable onboarding checklist for new hires.'}
              </p>
            </div>

            {isLoading ? (
              <SkeletonEditor />
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

                {/* ── Template info card ─────────────────────────────────── */}
                <div
                  className="rounded-[8px] border p-4 space-y-4"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor:     'var(--border-color)',
                  }}
                >
                  <h2
                    className="text-[13px] font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Template info
                  </h2>

                  {/* Name */}
                  <Input
                    id="template-name"
                    label="Template name"
                    placeholder="e.g. Engineering onboarding"
                    error={errors.name?.message}
                    {...register('name')}
                  />

                  {/* Description */}
                  <div className="space-y-1">
                    <label
                      htmlFor="template-description"
                      className="block text-[12px] font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Description
                      <span
                        className="ml-1 font-normal"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        (optional)
                      </span>
                    </label>
                    <textarea
                      id="template-description"
                      rows={3}
                      placeholder="Describe what this template is for"
                      className={`${fieldBase} py-2 px-3 resize-none ${
                        errors.description ? fieldBorderError : fieldBorder
                      }`}
                      style={{ color: 'var(--text-primary)', minHeight: '80px' }}
                      aria-invalid={errors.description ? 'true' : undefined}
                      aria-describedby={
                        errors.description ? 'template-description-error' : undefined
                      }
                      {...register('description')}
                    />
                    {errors.description && (
                      <p
                        id="template-description-error"
                        className="text-[12px] text-danger"
                        role="alert"
                        aria-live="polite"
                      >
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* ── Template tasks card ────────────────────────────────── */}
                <div
                  className="rounded-[8px] border p-4"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor:     'var(--border-color)',
                  }}
                >
                  {/* Section header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2
                        className="text-[13px] font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Tasks
                        {fields.length > 0 && (
                          <span
                            className="ml-2 normal-case text-[12px] font-normal"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {fields.length} total
                          </span>
                        )}
                      </h2>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => append({ ...EMPTY_TASK })}
                      className="gap-1.5"
                    >
                      <Plus size={14} aria-hidden="true" />
                      Add task
                    </Button>
                  </div>

                  {/* Empty tasks state */}
                  {fields.length === 0 && (
                    <div
                      className="flex flex-col items-center justify-center py-10 rounded-[8px] border border-dashed text-center"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      <p
                        className="text-[14px] font-medium mb-1"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        No tasks yet
                      </p>
                      <p
                        className="text-[13px] mb-4 max-w-[240px]"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Add tasks to define what needs to happen during onboarding.
                      </p>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => append({ ...EMPTY_TASK })}
                        className="gap-1.5"
                      >
                        <Plus size={14} aria-hidden="true" />
                        Add your first task
                      </Button>
                    </div>
                  )}

                  {/* Tasks grouped by phase */}
                  {fields.length > 0 && (
                    <div className="space-y-4">
                      {phaseGroups.map((group) => (
                        <div key={group.value} className="space-y-2">
                          <PhaseHeader label={group.label} count={group.indices.length} />
                          {group.indices.map((index) => (
                            <TaskCard
                              key={fields[index]?.id ?? index}
                              index={index}
                              register={register}
                              errors={errors}
                              remove={remove}
                            />
                          ))}
                        </div>
                      ))}

                      {/* Unassigned (safety net — shouldn't appear in normal use) */}
                      {unassignedIndices.length > 0 && (
                        <div className="space-y-2">
                          {unassignedIndices.map((index) => (
                            <TaskCard
                              key={fields[index]?.id ?? index}
                              index={index}
                              register={register}
                              errors={errors}
                              remove={remove}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add task (bottom shortcut when list is non-empty) */}
                  {fields.length > 0 && (
                    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                      <button
                        type="button"
                        onClick={() => append({ ...EMPTY_TASK })}
                        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary
                          cursor-pointer hover:opacity-75 transition-opacity
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1
                          rounded-[4px]"
                      >
                        <Plus size={14} aria-hidden="true" />
                        Add another task
                      </button>
                    </div>
                  )}
                </div>

                {/* ── Bottom submit row ──────────────────────────────────── */}
                <div className="flex justify-end gap-2 pb-8">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/templates')}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={isSaving}
                    disabled={isSaving}
                  >
                    {isEdit ? 'Save changes' : 'Create template'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
