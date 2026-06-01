import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Pencil,
  Send,
  MailOpen,
  XCircle,
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Paperclip,
  Lock,
  User,
  CalendarDays,
  FileText,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { format, isToday, isPast, parseISO } from 'date-fns'
import { onboardingsApi, tasksApi } from '../../api/onboardings'
import useAuthStore from '../../stores/authStore'
import Button from '../../components/ui/Button'
import Avatar from '../../components/onboardings/Avatar'
import StatusChip, { STATUS_STYLES } from '../../components/onboardings/StatusChip'
import ProgressBar from '../../components/onboardings/ProgressBar'
import WarningBadge from '../../components/onboardings/WarningBadge'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DEPT_LABELS = {
  hr: 'HR',
  manager: 'Manager',
  it: 'IT',
  finance: 'Finance',
  new_hire: 'New Hire',
  custom: 'Custom',
}

const PHASE_ORDER = ['pre_start', 'week_1', 'week_2', 'week_3_plus']
const PHASE_LABELS = {
  pre_start: 'Before Day One',
  week_1: 'Week 1',
  week_2: 'Week 2',
  week_3_plus: 'Week 3+',
}

const TASK_STATUS_OPTIONS = [
  { value: 'pending',     label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done',        label: 'Done' },
  { value: 'blocked',     label: 'Blocked' },
]

const DEPT_OPTIONS = [
  { value: '',         label: 'All departments' },
  { value: 'hr',       label: 'HR' },
  { value: 'manager',  label: 'Manager' },
  { value: 'it',       label: 'IT' },
  { value: 'finance',  label: 'Finance' },
  { value: 'new_hire', label: 'New Hire' },
  { value: 'custom',   label: 'Custom' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmtDate(d) {
  if (!d) return ''
  try { return format(typeof d === 'string' ? parseISO(d) : new Date(d), 'MMM d, yyyy') } catch { return '' }
}

function DuePill({ dueAt, status }) {
  if (!dueAt || status === 'done') return null
  let d
  try { d = typeof dueAt === 'string' ? parseISO(dueAt) : new Date(dueAt) } catch { return null }
  const todayFlag = isToday(d)
  const pastFlag = isPast(d) && !todayFlag
  if (todayFlag) {
    return (
      <span className="text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(217,119,6,0.10)', color: '#d97706' }}>
        Due today
      </span>
    )
  }
  if (pastFlag) {
    return (
      <span className="text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(220,38,38,0.10)', color: '#dc2626' }}>
        Overdue
      </span>
    )
  }
  return (
    <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
      Due {fmtDate(dueAt)}
    </span>
  )
}

function TaskStatusIcon({ status }) {
  if (status === 'done') return <CheckCircle2 size={16} style={{ color: '#16a34a' }} aria-hidden="true" />
  if (status === 'in_progress') return <Loader2 size={16} className="animate-spin" style={{ color: '#2563eb' }} aria-hidden="true" />
  if (status === 'blocked') return <XCircle size={16} style={{ color: '#dc2626' }} aria-hidden="true" />
  return <Clock size={16} style={{ color: 'var(--text-secondary)' }} aria-hidden="true" />
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeletons
// ─────────────────────────────────────────────────────────────────────────────

function HeaderSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-5 w-24 rounded" style={{ backgroundColor: 'var(--border-color)' }} />
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full" style={{ backgroundColor: 'var(--border-color)' }} />
        <div className="space-y-2">
          <div className="h-6 w-48 rounded" style={{ backgroundColor: 'var(--border-color)' }} />
          <div className="h-4 w-32 rounded" style={{ backgroundColor: 'var(--border-color)' }} />
        </div>
      </div>
      <div className="h-4 w-full rounded" style={{ backgroundColor: 'var(--border-color)' }} />
    </div>
  )
}

function TaskCardSkeleton() {
  return (
    <div className="rounded-[10px] border p-4 animate-pulse" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
      <div className="flex items-start gap-3">
        <div className="h-4 w-4 rounded-full mt-0.5" style={{ backgroundColor: 'var(--border-color)' }} />
        <div className="flex-1 space-y-2">
          <div className="h-[14px] rounded" style={{ width: '70%', backgroundColor: 'var(--border-color)' }} />
          <div className="h-[12px] rounded" style={{ width: '50%', backgroundColor: 'var(--border-color)' }} />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Cancel dialog
// ─────────────────────────────────────────────────────────────────────────────

function CancelDialog({ name, onConfirm, onCancel, isLoading }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-dlg-title"
    >
      <div
        className="w-full max-w-sm rounded-[10px] p-6 space-y-4"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.10)' }}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(220,38,38,0.10)' }}>
            <XCircle size={16} style={{ color: '#dc2626' }} aria-hidden="true" />
          </div>
          <div>
            <h2 id="cancel-dlg-title" className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              Cancel onboarding for {name}?
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              All pending tasks will be blocked. This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={isLoading}>
            No, keep it
          </Button>
          <Button size="sm" onClick={onConfirm} loading={isLoading} className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-500">
            Yes, cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Task comments section
// ─────────────────────────────────────────────────────────────────────────────

function TaskComments({ taskId }) {
  const [draft, setDraft] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['taskComments', taskId],
    queryFn: () => tasksApi.getComments(taskId).then((r) => r.data),
  })

  const comments = data?.data ?? []

  const addMutation = useMutation({
    mutationFn: (body) => tasksApi.addComment(taskId, { body }),
    onSuccess: () => {
      setDraft('')
      queryClient.invalidateQueries({ queryKey: ['taskComments', taskId] })
    },
    onError: () => toast.error('Failed to post comment'),
  })

  return (
    <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
      {isLoading && (
        <div className="space-y-2 animate-pulse">
          {[80, 60].map((w, i) => (
            <div key={i} className="h-[12px] rounded" style={{ width: `${w}%`, backgroundColor: 'var(--border-color)' }} />
          ))}
        </div>
      )}
      {!isLoading && comments.length === 0 && (
        <p className="text-[12px] mb-3" style={{ color: 'var(--text-secondary)' }}>No comments yet.</p>
      )}
      {!isLoading && comments.length > 0 && (
        <div className="space-y-3 mb-3">
          {comments.map((c, i) => (
            <div key={c.id ?? i} className="flex gap-2">
              {/* backend returns { author, authorColor } — NOT authorName */}
              <Avatar name={c.author || 'User'} avatarColor={c.authorColor} size={22} />
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>{c.author || 'User'}</span>
                  <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{fmtDate(c.createdAt)}</span>
                </div>
                <p className="text-[12px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-primary)' }}>{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a comment…"
          rows={2}
          aria-label="Add comment"
          className="flex-1 resize-none rounded-[8px] border px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          style={{
            backgroundColor: 'var(--bg-app)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
        />
        <Button
          size="sm"
          disabled={!draft.trim() || addMutation.isPending}
          loading={addMutation.isPending}
          onClick={() => addMutation.mutate(draft.trim())}
          className="self-end"
        >
          Post
        </Button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Task card
// ─────────────────────────────────────────────────────────────────────────────

function TaskCard({ task, isHR, userId, onboarding }) {
  const queryClient = useQueryClient()
  const [expanded, setExpanded] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [pendingStatus, setPendingStatus] = useState(null)
  const [blockedReason, setBlockedReason] = useState('')

  // Backend returns `assignee` (name string) for pending/in_progress tasks,
  // and does NOT return assigneeUserId. Server enforces its own permission check,
  // so show the button for all users and let the 403 surface if needed.
  const canEdit = true

  const updateMutation = useMutation({
    mutationFn: (data) => tasksApi.update(task.id, data),
    onSuccess: () => {
      toast.success('Task updated')
      setShowStatusMenu(false)
      setPendingStatus(null)
      setBlockedReason('')
      queryClient.invalidateQueries({ queryKey: ['onboardingTasks', onboarding.id] })
    },
    onError: () => toast.error('Failed to update task'),
  })

  function handleStatusSelect(val) {
    if (val === 'blocked') {
      setPendingStatus('blocked')
    } else {
      updateMutation.mutate({ status: val })
    }
  }

  function submitBlocked() {
    updateMutation.mutate({ status: 'blocked', blockedReason: blockedReason.trim() || undefined })
  }

  const titleClass = [
    'text-[13px] font-medium leading-snug',
    task.status === 'done' ? 'line-through' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className="rounded-[10px] border transition-shadow"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        boxShadow: hovered ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="p-4">
        {/* Title row */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            <TaskStatusIcon status={task.status} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <span className={titleClass} style={{ color: 'var(--text-primary)' }}>
                {task.title}
              </span>
              {/* Hover actions */}
              <div
                className="flex items-center gap-1 shrink-0 transition-opacity duration-150"
                style={{ opacity: hovered ? 1 : 0 }}
              >
                {/* Status dropdown toggle */}
                {canEdit && (
                  <div className="relative">
                    <button
                      onClick={() => { setShowStatusMenu((v) => !v); setPendingStatus(null) }}
                      aria-label="Update status"
                      title="Update status"
                      className="inline-flex items-center gap-1 h-[26px] px-2 rounded-[6px] cursor-pointer text-[11px] font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Status
                      <ChevronDown size={11} aria-hidden="true" />
                    </button>
                    {showStatusMenu && !pendingStatus && (
                      <div
                        className="absolute right-0 top-full mt-1 z-30 w-[140px] rounded-[8px] border py-1 shadow-lg"
                        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                      >
                        {TASK_STATUS_OPTIONS.map((opt) => {
                          const s = STATUS_STYLES[opt.value]
                          return (
                            <button
                              key={opt.value}
                              onClick={() => handleStatusSelect(opt.value)}
                              disabled={task.status === opt.value || updateMutation.isPending}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] cursor-pointer hover:bg-black/5 dark:hover:bg-white/8 disabled:opacity-40 disabled:cursor-not-allowed"
                              style={{ color: s?.color ?? 'var(--text-primary)' }}
                            >
                              {opt.label}
                            </button>
                          )
                        })}
                      </div>
                    )}
                    {/* Blocked reason inline */}
                    {showStatusMenu && pendingStatus === 'blocked' && (
                      <div
                        className="absolute right-0 top-full mt-1 z-30 w-[240px] rounded-[8px] border p-3 shadow-lg space-y-2"
                        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                      >
                        <p className="text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>Reason for blocking (optional)</p>
                        <textarea
                          value={blockedReason}
                          onChange={(e) => setBlockedReason(e.target.value)}
                          rows={2}
                          placeholder="Describe the blocker…"
                          className="w-full resize-none rounded-[6px] border px-2 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-primary"
                          style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                        />
                        <div className="flex gap-1.5">
                          <Button size="sm" onClick={submitBlocked} loading={updateMutation.isPending} className="flex-1">
                            Confirm
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => { setPendingStatus(null); setShowStatusMenu(false) }}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Comments toggle */}
                <button
                  onClick={() => setShowComments((v) => !v)}
                  aria-label="Toggle comments"
                  title="Comments"
                  className="inline-flex items-center gap-1 h-[26px] px-2 rounded-[6px] cursor-pointer text-[11px] transition-colors hover:bg-black/5 dark:hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  style={{ color: showComments ? 'var(--color-primary)' : 'var(--text-secondary)' }}
                >
                  <MessageCircle size={13} aria-hidden="true" />
                  {task.commentCount > 0 && (
                    <span className="font-medium">{task.commentCount}</span>
                  )}
                </button>
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* Assignee — backend returns field as `assignee` (name string) */}
              <div className="flex items-center gap-1">
                {task.assignee
                  ? <Avatar name={task.assignee} size={18} />
                  : <User size={13} style={{ color: 'var(--text-secondary)' }} aria-hidden="true" />
                }
                <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  {task.assignee || 'Unassigned'}
                </span>
              </div>

              {/* Department */}
              {task.assigneeDepartment && (
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                >
                  {DEPT_LABELS[task.assigneeDepartment] ?? task.assigneeDepartment}
                </span>
              )}

              {/* Due date */}
              <DuePill dueAt={task.dueAt} status={task.status} />

              {/* Status chip */}
              <StatusChip status={task.status} />
            </div>

            {/* Completed at */}
            {task.completedAt && (
              <p className="text-[11px] mt-1.5" style={{ color: '#16a34a' }}>
                Completed {fmtDate(task.completedAt)}
              </p>
            )}

            {/* Description toggle */}
            {task.description && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1 mt-2 text-[11px] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                style={{ color: 'var(--text-secondary)' }}
              >
                {expanded ? <ChevronUp size={11} aria-hidden="true" /> : <ChevronDown size={11} aria-hidden="true" />}
                {expanded ? 'Hide details' : 'Show details'}
              </button>
            )}
            {expanded && task.description && (
              <p className="mt-2 text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Blocked reason box */}
        {task.status === 'blocked' && task.blockedReason && (
          <div
            className="mt-3 rounded-[6px] px-3 py-2 text-[12px] leading-relaxed"
            style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#dc2626' }}
            role="alert"
          >
            <strong>Blocked:</strong> {task.blockedReason}
          </div>
        )}

        {/* Attachments */}
        {task.status === 'done' && task.requiresUpload && task.attachments?.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Attachments</p>
            {task.attachments.map((att, i) => (
              <a
                key={att.id ?? i}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[12px] hover:underline"
                style={{ color: 'var(--color-primary)' }}
              >
                <Paperclip size={12} aria-hidden="true" />
                {att.fileName || att.name || 'File'}
              </a>
            ))}
          </div>
        )}

        {/* Comments section */}
        {showComments && <TaskComments taskId={task.id} />}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase group
// ─────────────────────────────────────────────────────────────────────────────

function PhaseGroup({ phase, tasks, isHR, userId, onboarding }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
          {PHASE_LABELS[phase] ?? phase}
        </h3>
        <span
          className="inline-flex items-center px-1.5 py-0 rounded-full text-[11px] font-medium tabular-nums"
          style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
        >
          {tasks.length}
        </span>
      </div>
      <div className="space-y-2">
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} isHR={isHR} userId={userId} onboarding={onboarding} />
        ))}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Status filter chip
// ─────────────────────────────────────────────────────────────────────────────

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center h-[28px] px-3 rounded-full text-[12px] font-medium cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      style={{
        backgroundColor: active ? 'var(--color-primary)' : 'var(--bg-card)',
        color: active ? '#fff' : 'var(--text-secondary)',
        border: `1px solid ${active ? 'var(--color-primary)' : 'var(--border-color)'}`,
      }}
    >
      {label}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// OnboardingDetailPage
// ─────────────────────────────────────────────────────────────────────────────

export default function OnboardingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const isHR = user?.role === 'hr' || user?.role === 'admin'

  // ── Filter state ─────────────────────────────────────────────────────────
  const [statusFilters, setStatusFilters] = useState(new Set()) // empty = All
  const [deptFilter, setDeptFilter] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('')
  const [showNewHireOnly, setShowNewHireOnly] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  // ── Queries ───────────────────────────────────────────────────────────────
  const {
    data: onboardingData,
    isLoading: onboardingLoading,
    isError: onboardingError,
  } = useQuery({
    queryKey: ['onboarding', id],
    queryFn: () => onboardingsApi.get(id).then((r) => r.data),
  })

  const onboarding = onboardingData?.data ?? onboardingData ?? null

  const {
    data: tasksData,
    isLoading: tasksLoading,
  } = useQuery({
    queryKey: ['onboardingTasks', id],
    // Pass all statuses explicitly — backend default excludes blocked tasks
    queryFn: () =>
      onboardingsApi.getTasks(id, { status: 'pending,in_progress,done,blocked' }).then((r) => r.data),
    enabled: !!id,
  })

  const allTasks = tasksData?.data ?? []

  // ── Derived assignee list ─────────────────────────────────────────────────
  const assigneeOptions = useMemo(() => {
    const seen = new Set()
    const opts = []
    for (const t of allTasks) {
      // Backend returns assignee name as `assignee`, not `assigneeName`
      if (t.assignee && !seen.has(t.assignee)) {
        seen.add(t.assignee)
        opts.push({ value: t.assignee, label: t.assignee })
      }
    }
    return opts
  }, [allTasks])

  // ── Client-side filtering ─────────────────────────────────────────────────
  const filteredTasks = useMemo(() => {
    return allTasks.filter((t) => {
      if (showNewHireOnly && t.assigneeDepartment !== 'new_hire') return false
      if (statusFilters.size > 0 && !statusFilters.has(t.status)) return false
      if (deptFilter && t.assigneeDepartment !== deptFilter) return false
      if (assigneeFilter && t.assignee !== assigneeFilter) return false
      return true
    })
  }, [allTasks, statusFilters, deptFilter, assigneeFilter, showNewHireOnly])

  // ── Group by phase ────────────────────────────────────────────────────────
  const grouped = useMemo(() => {
    const map = {}
    for (const phase of PHASE_ORDER) map[phase] = []
    for (const t of filteredTasks) {
      const phase = t.phase ?? 'pre_start'
      if (!map[phase]) map[phase] = []
      map[phase].push(t)
    }
    return map
  }, [filteredTasks])

  const hasFilters = statusFilters.size > 0 || deptFilter || assigneeFilter || showNewHireOnly

  function toggleStatus(val) {
    setStatusFilters((prev) => {
      const next = new Set(prev)
      if (next.has(val)) next.delete(val)
      else next.add(val)
      return next
    })
  }

  function resetFilters() {
    setStatusFilters(new Set())
    setDeptFilter('')
    setAssigneeFilter('')
    setShowNewHireOnly(false)
  }

  // ── Cancel mutation ───────────────────────────────────────────────────────
  const cancelMutation = useMutation({
    mutationFn: () => onboardingsApi.cancel(id),
    onSuccess: () => {
      toast.success('Onboarding cancelled')
      setShowCancelDialog(false)
      queryClient.invalidateQueries({ queryKey: ['onboarding', id] })
      queryClient.invalidateQueries({ queryKey: ['onboardings'] })
    },
    onError: () => toast.error('Failed to cancel onboarding'),
  })

  // ── Loading / error states ────────────────────────────────────────────────
  if (onboardingLoading) {
    return (
      <div className="min-h-screen px-6 py-8" style={{ backgroundColor: 'var(--bg-app)' }}>
        <div className="mx-auto w-full max-w-[900px]">
          <HeaderSkeleton />
          <div className="mt-8 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <TaskCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    )
  }

  if (onboardingError || !onboarding) {
    return (
      <div className="min-h-screen px-6 py-8 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-app)' }}>
        <div className="text-center">
          <AlertCircle size={32} className="mx-auto mb-3" style={{ color: '#dc2626' }} aria-hidden="true" />
          <p className="text-[15px] font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
            Failed to load onboarding
          </p>
          <Button variant="secondary" onClick={() => navigate('/onboardings')}>
            Back to Onboardings
          </Button>
        </div>
      </div>
    )
  }

  const progress = onboarding.progressPercent ?? 0

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            fontSize: '14px',
            borderRadius: '8px',
          },
          error: { duration: Infinity },
        }}
      />

      {showCancelDialog && (
        <CancelDialog
          name={onboarding.newHireName}
          isLoading={cancelMutation.isPending}
          onConfirm={() => cancelMutation.mutate()}
          onCancel={() => setShowCancelDialog(false)}
        />
      )}

      <div className="min-h-screen px-6 py-8" style={{ backgroundColor: 'var(--bg-app)' }}>
        <div className="mx-auto w-full max-w-[900px]">

          {/* ── Back button ─────────────────────────────────────────────────── */}
          <Link
            to="/onboardings"
            className="inline-flex items-center gap-1.5 text-[13px] mb-6 cursor-pointer hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Back to Onboardings
          </Link>

          {/* ── Header card ─────────────────────────────────────────────────── */}
          <div
            className="rounded-[12px] border p-6 mb-6"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            {/* Top row: avatar + name + actions */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <Avatar name={onboarding.newHireName} size={48} />
                <div>
                  <h1 className="text-[22px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {onboarding.newHireName}
                  </h1>
                  <p className="text-[14px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {onboarding.job || onboarding.jobTitle || 'New Hire'}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              {isHR && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => navigate(`/onboardings/${id}/edit`)}
                  >
                    <Pencil size={13} aria-hidden="true" />
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => toast('This feature is coming in a future update.', { icon: null })}
                  >
                    <MailOpen size={13} aria-hidden="true" />
                    Invite to Portal
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => toast('This feature is coming in a future update.', { icon: null })}
                  >
                    <Send size={13} aria-hidden="true" />
                    Send Reminder
                  </Button>
                  {onboarding.status !== 'cancelled' && onboarding.status !== 'completed' && (
                    <Button
                      size="sm"
                      className="gap-1.5 bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
                      onClick={() => setShowCancelDialog(true)}
                    >
                      <XCircle size={13} aria-hidden="true" />
                      Cancel
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Meta row */}
            <div
              className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-4 text-[13px]"
              style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
            >
              <div className="flex items-center gap-1.5">
                <FileText size={13} aria-hidden="true" />
                <span>{onboarding.templateName || '—'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User size={13} aria-hidden="true" />
                <span>{onboarding.manager || 'No manager'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarDays size={13} aria-hidden="true" />
                <span>{fmtDate(onboarding.startDate) || '—'}</span>
              </div>
              <StatusChip status={onboarding.status} />
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>Progress</span>
                <span className="text-[12px] font-semibold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                  {progress}%
                </span>
              </div>
              <ProgressBar percent={progress} height={8} />
            </div>

            {/* Warning badges */}
            {(onboarding.warnings?.hasNoManager || onboarding.warnings?.hasUnassignedTasks) && (
              <div className="flex flex-wrap gap-2 mt-4">
                {onboarding.warnings?.hasNoManager && <WarningBadge type="noManager" />}
                {onboarding.warnings?.hasUnassignedTasks && <WarningBadge type="unassignedTasks" />}
              </div>
            )}
          </div>

          {/* ── Task filters bar ─────────────────────────────────────────────── */}
          <div
            className="rounded-[10px] border p-3 mb-5"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            {/* Status chips */}
            <div className="flex flex-wrap gap-2 mb-3">
              <FilterChip
                label="All"
                active={statusFilters.size === 0 && !showNewHireOnly}
                onClick={() => { setStatusFilters(new Set()); setShowNewHireOnly(false) }}
              />
              {['pending', 'in_progress', 'done', 'blocked'].map((s) => (
                <FilterChip
                  key={s}
                  label={STATUS_STYLES[s]?.label ?? s}
                  active={statusFilters.has(s)}
                  onClick={() => toggleStatus(s)}
                />
              ))}
              <FilterChip
                label="New Hire"
                active={showNewHireOnly}
                onClick={() => setShowNewHireOnly((v) => !v)}
              />
            </div>

            {/* Dropdown filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Department */}
              <div className="relative">
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  aria-label="Filter by department"
                  className="h-[30px] rounded-[8px] border text-[12px] cursor-pointer px-2 pr-6 appearance-none focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                >
                  {DEPT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-secondary)' }} aria-hidden="true" />
              </div>

              {/* Assignee */}
              {assigneeOptions.length > 0 && (
                <div className="relative">
                  <select
                    value={assigneeFilter}
                    onChange={(e) => setAssigneeFilter(e.target.value)}
                    aria-label="Filter by assignee"
                    className="h-[30px] rounded-[8px] border text-[12px] cursor-pointer px-2 pr-6 appearance-none focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  >
                    <option value="">All assignees</option>
                    {assigneeOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-secondary)' }} aria-hidden="true" />
                </div>
              )}

              {/* Reset */}
              {hasFilters && (
                <button
                  onClick={resetFilters}
                  className="text-[12px] cursor-pointer hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>

          {/* ── Task list ─────────────────────────────────────────────────────── */}
          {tasksLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <TaskCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="space-y-8">
              {PHASE_ORDER.map((phase) => {
                const tasks = grouped[phase] ?? []
                if (tasks.length === 0) return null
                return (
                  <PhaseGroup
                    key={phase}
                    phase={phase}
                    tasks={tasks}
                    isHR={isHR}
                    userId={user?.id}
                    onboarding={onboarding}
                  />
                )
              })}

              {filteredTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CheckCircle2 size={32} className="mb-3" style={{ color: 'var(--border-color)' }} aria-hidden="true" />
                  <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    No tasks match the current filters
                  </p>
                  <button
                    onClick={resetFilters}
                    className="mt-2 text-[13px] cursor-pointer hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
