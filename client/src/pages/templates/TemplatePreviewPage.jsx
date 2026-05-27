import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Pencil, AlertCircle, Upload } from 'lucide-react'
import { getTemplate } from '../../api/templates'
import Button from '../../components/ui/Button'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const PHASE_ORDER = ['pre_start', 'week_1', 'week_2', 'week_3_plus']

const PHASE_LABELS = {
  pre_start:   'Before day one',
  week_1:      'Week 1',
  week_2:      'Week 2',
  week_3_plus: 'Week 3+',
}

const ROLE_CONFIG = {
  hr:       { label: 'HR',       bg: 'rgba(14,165,233,0.12)',  color: '#0EA5E9' },
  manager:  { label: 'Manager',  bg: 'rgba(217,119,6,0.12)',   color: '#D97706' },
  new_hire: { label: 'New Hire', bg: 'rgba(22,163,74,0.12)',   color: '#16A34A' },
  it:       { label: 'IT',       bg: 'rgba(59,91,219,0.12)',   color: '#3B5BDB' },
  finance:  { label: 'Finance',  bg: 'rgba(217,119,6,0.12)',   color: '#D97706' },
  custom:   { label: 'Custom',   bg: 'rgba(71,85,105,0.12)',   color: '#475569' },
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDueOffset(days) {
  if (days === 0) return 'On start date'
  const abs = Math.abs(days)
  const unit = abs === 1 ? 'day' : 'days'
  return days < 0
    ? `${abs} ${unit} before start`
    : `${abs} ${unit} after start`
}

function formatUpdatedAt(updatedAt) {
  if (updatedAt === 0) return 'Today'
  if (updatedAt === 1) return 'Yesterday'
  return `${updatedAt} days ago`
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────────────────────────

function Bone({ h = 'h-[14px]', w = 'w-full', className = '' }) {
  return (
    <div
      className={`${h} ${w} rounded animate-pulse ${className}`}
      style={{ backgroundColor: 'var(--border-color)' }}
    />
  )
}

function SkeletonPreview() {
  return (
    <div className="space-y-4">
      {/* Header card */}
      <div
        className="rounded-[8px] border p-6 space-y-3"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        <Bone h="h-[22px]" w="w-2/3" />
        <Bone h="h-[14px]" w="w-1/2" />
        <div className="flex gap-4 pt-1">
          <Bone h="h-[12px]" w="w-32" />
          <Bone h="h-[12px]" w="w-28" />
        </div>
      </div>

      {/* Phase section + tasks */}
      <div className="space-y-3">
        <Bone h="h-[12px]" w="w-24" />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-[8px] border p-4 space-y-2 animate-pulse"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <Bone h="h-[14px]" w="w-1/2" />
            <div className="flex gap-2">
              <Bone h="h-[20px]" w="w-16" className="rounded-full" />
              <Bone h="h-[20px]" w="w-24" className="rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Error state
// ─────────────────────────────────────────────────────────────────────────────

function FetchError({ onBack }) {
  return (
    <div
      className="rounded-[8px] border p-10 flex flex-col items-center justify-center text-center"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      role="alert"
      aria-live="assertive"
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full mb-4"
        style={{ backgroundColor: 'rgba(220,38,38,0.08)' }}
      >
        <AlertCircle size={18} className="text-danger" aria-hidden="true" />
      </div>
      <p
        className="text-[14px] font-medium mb-1"
        style={{ color: 'var(--text-primary)' }}
      >
        Failed to load template
      </p>
      <p
        className="text-[13px] mb-5 max-w-[260px]"
        style={{ color: 'var(--text-secondary)' }}
      >
        Something went wrong. Check your connection and try again.
      </p>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onBack}
        className="gap-1.5"
      >
        <ArrowLeft size={13} aria-hidden="true" />
        Back to templates
      </Button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Chip — role badge / upload badge
// ─────────────────────────────────────────────────────────────────────────────

function Chip({ bg, color, children }) {
  return (
    <span
      className="inline-flex items-center gap-1 h-[20px] px-2 rounded-full text-[11px] font-medium shrink-0"
      style={{ backgroundColor: bg, color }}
    >
      {children}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Task card
// ─────────────────────────────────────────────────────────────────────────────

function TaskCard({ task }) {
  const role = ROLE_CONFIG[task.assigneeRole] ?? ROLE_CONFIG.custom

  return (
    <div
      className="rounded-[8px] border p-4"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      {/* Title */}
      <p
        className="text-[14px] font-medium leading-snug"
        style={{ color: 'var(--text-primary)' }}
      >
        {task.title}
      </p>

      {/* Description */}
      {task.description && (
        <p
          className="mt-1 text-[13px] leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          {task.description}
        </p>
      )}

      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
        {/* Assignee role */}
        <Chip bg={role.bg} color={role.color}>
          {role.label}
        </Chip>

        {/* Due offset */}
        <Chip bg="rgba(71,85,105,0.08)" color="var(--text-secondary)">
          {formatDueOffset(task.dueOffsetDays ?? 0)}
        </Chip>

        {/* Requires upload */}
        {task.requiresUpload && (
          <Chip bg="rgba(59,91,219,0.10)" color="#3B5BDB">
            <Upload size={10} aria-hidden="true" />
            Requires upload
          </Chip>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase section
// ─────────────────────────────────────────────────────────────────────────────

function PhaseSection({ label, tasks }) {
  return (
    <div className="space-y-2">
      {/* Phase heading + rule */}
      <div className="flex items-center gap-2">
        <span
          className="text-[12px] font-semibold uppercase tracking-wide shrink-0"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
        </span>
        <span
          className="inline-flex items-center justify-center h-[18px] min-w-[18px] px-1.5
            rounded-full text-[11px] font-medium shrink-0"
          style={{ backgroundColor: 'rgba(59,91,219,0.10)', color: '#3B5BDB' }}
        >
          {tasks.length}
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-color)' }} />
      </div>

      {/* Tasks */}
      {tasks.map((task) => (
        <TaskCard key={task._id ?? task.title} task={task} />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TemplatePreviewPage
// ─────────────────────────────────────────────────────────────────────────────

export default function TemplatePreviewPage() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const {
    data:      template,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['template', id],
    queryFn:  () => getTemplate(id).then((r) => r.data.data),
  })

  // Group tasks by phase
  const phaseGroups = PHASE_ORDER
    .map((phase) => ({
      phase,
      label: PHASE_LABELS[phase],
      tasks: (template?.tasks ?? [])
        .filter((t) => t.phase === phase)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    }))
    .filter((g) => g.tasks.length > 0)

  const hasTasks = (template?.tasks ?? []).length > 0

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--bg-app)' }}
    >
      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-20 px-6"
        style={{
          backgroundColor: 'var(--bg-app)',
          borderBottom:    '1px solid var(--border-color)',
        }}
      >
        <div className="mx-auto flex h-14 w-full max-w-[760px] items-center justify-between gap-4">
          {/* Left: back + breadcrumb */}
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

            <span
              className="hidden sm:block text-[13px] truncate font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              {isLoading ? 'Loading…' : (template?.name ?? 'Template')}
            </span>
          </div>

          {/* Right: Edit button */}
          {!isLoading && !isError && template && (
            <Button
              type="button"
              size="sm"
              onClick={() => navigate(`/templates/${id}`)}
              className="gap-1.5 shrink-0"
            >
              <Pencil size={13} aria-hidden="true" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="px-6 py-8">
        <div className="mx-auto w-full max-w-[760px]">

          {isLoading ? (
            <SkeletonPreview />
          ) : isError ? (
            <FetchError onBack={() => navigate('/templates')} />
          ) : (
            <div className="space-y-5">

              {/* ── Template header card ──────────────────────────────── */}
              <div
                className="rounded-[8px] border p-6"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor:     'var(--border-color)',
                }}
              >
                <h1
                  className="text-[24px] font-semibold leading-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {template.name}
                </h1>

                {template.description && (
                  <p
                    className="mt-2 text-[14px] leading-relaxed max-w-prose"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {template.description}
                  </p>
                )}

                {/* Meta row */}
                <div
                  className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-4 text-[12px]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {template.createdBy && (
                    <span>
                      Created by{' '}
                      <span
                        className="font-medium"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {template.createdBy?.name ?? template.createdBy}
                      </span>
                    </span>
                  )}
                  {template.updatedAt != null && (
                    <span>
                      Last updated{' '}
                      <span
                        className="font-medium"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {formatUpdatedAt(template.updatedAt)}
                      </span>
                    </span>
                  )}
                  <span>
                    <span
                      className="font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {(template.tasks ?? []).length}
                    </span>{' '}
                    {(template.tasks ?? []).length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>
              </div>

              {/* ── Tasks section ─────────────────────────────────────── */}
              <div className="space-y-5">
                {!hasTasks ? (
                  /* Empty tasks */
                  <div
                    className="rounded-[8px] border border-dashed flex flex-col items-center
                      justify-center py-12 px-4 text-center"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <p
                      className="text-[14px] font-medium mb-1"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      No tasks added yet
                    </p>
                    <p
                      className="text-[13px]"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Edit this template to add onboarding tasks.
                    </p>
                  </div>
                ) : (
                  phaseGroups.map((group) => (
                    <PhaseSection
                      key={group.phase}
                      label={group.label}
                      tasks={group.tasks}
                    />
                  ))
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
