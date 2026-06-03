import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  Clock,
  Loader,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Send,
  X,
} from 'lucide-react'
import { formatDistanceToNow, isPast, isToday, parseISO, format } from 'date-fns'
import useAuthStore from '../../stores/authStore'
import { usersApi, tasksApi } from '../../api/onboardings'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_FILTERS = [
  { value: 'all',        label: 'All'         },
  { value: 'pending',    label: 'Pending'     },
  { value: 'in_progress',label: 'In Progress' },
  { value: 'done',       label: 'Done'        },
  { value: 'blocked',    label: 'Blocked'     },
]

const PHASE_LABELS = {
  pre_start:  'Before Day One',
  week_1:     'Week 1',
  week_2:     'Week 2',
  week_3_plus:'Week 3+',
}

const STATUS_OPTIONS = [
  { value: 'pending',    label: 'Pending'     },
  { value: 'in_progress',label: 'In Progress' },
  { value: 'done',       label: 'Done'        },
  { value: 'blocked',    label: 'Blocked'     },
]

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function safeDate(val) {
  if (!val) return null
  try { return typeof val === 'string' ? parseISO(val) : new Date(val) } catch { return null }
}

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

function relativeTime(val) {
  const d = safeDate(val)
  if (!d) return ''
  try { return formatDistanceToNow(d, { addSuffix: true }) } catch { return '' }
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────

function Bone({ w, h = 13, className = '' }) {
  return (
    <div
      className={`rounded animate-pulse ${className}`}
      style={{ width: w, height: h, backgroundColor: 'var(--border-color)', flexShrink: 0 }}
    />
  )
}

function TaskSkeleton() {
  return (
    <div
      className="px-4 py-3.5 flex items-start gap-3 animate-pulse"
      style={{ borderBottom: '1px solid var(--border-color)' }}
    >
      <Bone w={18} h={18} className="rounded-full mt-0.5 shrink-0" />
      <div className="flex-1 space-y-2">
        <Bone w="55%" />
        <div className="flex gap-2">
          <Bone w={72} h={20} className="rounded-full" />
          <Bone w={80} h={20} className="rounded-full" />
        </div>
      </div>
    </div>
  )
}

function GroupSkeleton() {
  return (
    <div
      className="rounded-[8px] border overflow-hidden"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 animate-pulse"
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        <Bone w={34} h={34} className="rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Bone w={140} />
          <Bone w={100} h={11} />
        </div>
        <Bone w={28} h={20} className="rounded-full" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => <TaskSkeleton key={i} />)}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Status icon
// ─────────────────────────────────────────────────────────────────────────────

function StatusIcon({ status }) {
  if (status === 'pending')
    return <Clock size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
  if (status === 'in_progress')
    return (
      <Loader
        size={16}
        style={{ color: '#3B5BDB', flexShrink: 0, animation: 'spin 1s linear infinite' }}
      />
    )
  if (status === 'done')
    return <CheckCircle size={16} style={{ color: '#16A34A', flexShrink: 0 }} />
  if (status === 'blocked')
    return <XCircle size={16} style={{ color: '#DC2626', flexShrink: 0 }} />
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// Due date pill
// ─────────────────────────────────────────────────────────────────────────────

function DuePill({ dueAt, status }) {
  if (status === 'done') return null
  const d = safeDate(dueAt)
  if (!d) return null

  if (isToday(d)) {
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
        style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: '#B45309' }}
      >
        Due today
      </span>
    )
  }
  if (isPast(d)) {
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
        style={{ backgroundColor: 'rgba(220,38,38,0.10)', color: '#DC2626' }}
      >
        Overdue
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
    >
      Due {format(d, 'MMM d')}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Status chip
// ─────────────────────────────────────────────────────────────────────────────

function StatusChip({ status }) {
  const map = {
    pending:    { label: 'Pending',     bg: 'rgba(100,116,139,0.10)', color: '#475569' },
    in_progress:{ label: 'In Progress', bg: 'rgba(59,91,219,0.10)',   color: '#3B5BDB' },
    done:       { label: 'Done',        bg: 'rgba(22,163,74,0.10)',   color: '#16A34A' },
    blocked:    { label: 'Blocked',     bg: 'rgba(220,38,38,0.10)',   color: '#DC2626' },
  }
  const s = map[status] ?? { label: status, bg: 'rgba(100,116,139,0.10)', color: '#475569' }
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Comments panel
// ─────────────────────────────────────────────────────────────────────────────

function CommentsPanel({ taskId }) {
  const [body, setBody] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['taskComments', taskId],
    queryFn: () => tasksApi.getComments(taskId).then(r => r.data.data),
    staleTime: 30_000,
  })

  const addMutation = useMutation({
    mutationFn: (text) => tasksApi.addComment(taskId, { body: text }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['taskComments', taskId] })
      setBody('')
    },
    onError: () => toast.error('Failed to post comment'),
  })

  function handleSubmit(e) {
    e.preventDefault()
    const text = body.trim()
    if (!text) return
    addMutation.mutate(text)
  }

  const comments = data ?? []

  return (
    <div
      className="mx-4 mb-3 rounded-[6px] overflow-hidden"
      style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
    >
      {/* Comment list */}
      <div className="max-h-[220px] overflow-y-auto">
        {isLoading && (
          <div className="px-3 py-3 space-y-2 animate-pulse">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-2">
                <Bone w={24} h={24} className="rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Bone w="40%" />
                  <Bone w="70%" h={11} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && comments.length === 0 && (
          <p
            className="text-[12px] px-3 py-3 text-center"
            style={{ color: 'var(--text-secondary)' }}
          >
            No comments yet.
          </p>
        )}

        {!isLoading && comments.map((c, i) => (
          <div
            key={c.id}
            className="flex items-start gap-2.5 px-3 py-2.5"
            style={{ borderBottom: i < comments.length - 1 ? '1px solid var(--border-color)' : 'none' }}
          >
            <div
              className="flex items-center justify-center rounded-full shrink-0 text-[10px] font-semibold"
              style={{
                width: 24, height: 24,
                backgroundColor: (c.authorColor ?? '#3B5BDB') + '22',
                color: c.authorColor ?? '#3B5BDB',
              }}
              aria-hidden="true"
            >
              {getInitials(c.author)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {c.author}
                </span>
                <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                  {relativeTime(c.createdAt)}
                </span>
              </div>
              <p className="text-[12px] mt-0.5 leading-snug" style={{ color: 'var(--text-primary)' }}>
                {c.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderTop: '1px solid var(--border-color)' }}
      >
        <input
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Add a comment…"
          className="flex-1 text-[12px] bg-transparent outline-none"
          style={{ color: 'var(--text-primary)' }}
          disabled={addMutation.isPending}
        />
        <button
          type="submit"
          disabled={!body.trim() || addMutation.isPending}
          aria-label="Post comment"
          className="cursor-pointer transition-opacity disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        >
          <Send size={14} style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
        </button>
      </form>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Task card
// ─────────────────────────────────────────────────────────────────────────────

function TaskCard({ task, onboardingId }) {
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState(task.status)
  const [blockedInput, setBlockedInput] = useState(task.blockedReason ?? '')
  const [showBlockedInput, setShowBlockedInput] = useState(false)
  const qc = useQueryClient()
  const user = useAuthStore(s => s.user)

  const updateMutation = useMutation({
    mutationFn: (payload) => tasksApi.update(task.id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myTasks', user?.id] })
      toast.success('Task updated')
    },
    onError: () => toast.error('Failed to update task'),
  })

  function handleStatusChange(newStatus) {
    setPendingStatus(newStatus)
    if (newStatus === 'blocked') {
      setShowBlockedInput(true)
      return
    }
    setShowBlockedInput(false)
    updateMutation.mutate({ status: newStatus })
  }

  function handleBlockedSubmit(e) {
    e.preventDefault()
    if (!blockedInput.trim()) return
    updateMutation.mutate({ status: 'blocked', blockedReason: blockedInput.trim() })
    setShowBlockedInput(false)
  }

  const isDone = task.status === 'done'
  const completedDate = safeDate(task.completedAt)

  return (
    <div style={{ borderBottom: '1px solid var(--border-color)' }}>
      {/* Main row */}
      <div className="flex items-start gap-3 px-4 py-3.5">
        <div className="mt-0.5">
          <StatusIcon status={task.status} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <p
            className="text-[13px] font-medium leading-snug"
            style={{
              color: 'var(--text-primary)',
              textDecoration: isDone ? 'line-through' : 'none',
              opacity: isDone ? 0.6 : 1,
            }}
          >
            {task.title}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {task.phase && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                style={{ backgroundColor: 'rgba(59,91,219,0.08)', color: '#3B5BDB' }}
              >
                {PHASE_LABELS[task.phase] ?? task.phase}
              </span>
            )}
            <DuePill dueAt={task.dueAt} status={task.status} />
            <StatusChip status={task.status} />
            {isDone && completedDate && (
              <span className="text-[11px]" style={{ color: '#16A34A' }}>
                Completed {format(completedDate, 'MMM d')}
              </span>
            )}
          </div>

          {/* Blocked reason */}
          {task.status === 'blocked' && task.blockedReason && (
            <div
              className="mt-2 px-3 py-2 rounded-[6px] text-[12px] leading-snug"
              style={{ backgroundColor: 'rgba(220,38,38,0.07)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.18)' }}
            >
              {task.blockedReason}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Comments toggle */}
          <button
            onClick={() => setCommentsOpen(v => !v)}
            aria-label="Toggle comments"
            className="flex items-center gap-1 cursor-pointer transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-2 py-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            <MessageSquare size={14} aria-hidden="true" />
          </button>

          {/* Status dropdown */}
          <select
            value={pendingStatus}
            onChange={e => handleStatusChange(e.target.value)}
            disabled={updateMutation.isPending}
            aria-label="Change status"
            className="text-[11px] rounded-[6px] border px-2 py-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            style={{
              backgroundColor: 'var(--bg-app)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Blocked reason input */}
      {showBlockedInput && (
        <form
          onSubmit={handleBlockedSubmit}
          className="flex items-center gap-2 px-4 pb-3"
        >
          <input
            autoFocus
            value={blockedInput}
            onChange={e => setBlockedInput(e.target.value)}
            placeholder="Reason for blocking (required)…"
            required
            className="flex-1 text-[12px] rounded-[6px] border px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#DC2626]/40"
            style={{
              backgroundColor: 'var(--bg-app)',
              borderColor: '#DC2626',
              color: 'var(--text-primary)',
            }}
          />
          <button
            type="submit"
            disabled={!blockedInput.trim()}
            className="text-[11px] font-medium px-3 py-1.5 rounded-[6px] cursor-pointer transition-opacity disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{ backgroundColor: 'rgba(220,38,38,0.10)', color: '#DC2626' }}
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={() => { setShowBlockedInput(false); setPendingStatus(task.status) }}
            aria-label="Cancel"
            className="cursor-pointer transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            <X size={14} style={{ color: 'var(--text-secondary)' }} aria-hidden="true" />
          </button>
        </form>
      )}

      {/* Comments */}
      {commentsOpen && <CommentsPanel taskId={task.id} />}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding group
// ─────────────────────────────────────────────────────────────────────────────

function OnboardingGroup({ group }) {
  const [expanded, setExpanded] = useState(true)
  const initials = getInitials(group.newHireName)

  const AVATAR_COLORS = ['#3b5bdb','#1098ad','#0ca678','#f59f00','#e64980','#7950f2','#f76707','#2f9e44']
  let h = 0
  for (let i = 0; i < group.newHireName.length; i++) h = group.newHireName.charCodeAt(i) + ((h << 5) - h)
  const color = AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]

  return (
    <div
      className="rounded-[8px] border overflow-hidden"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      {/* Group header */}
      <button
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
        className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
        style={{ borderBottom: expanded ? '1px solid var(--border-color)' : 'none' }}
      >
        {/* Avatar */}
        <div
          className="flex items-center justify-center rounded-full shrink-0 font-semibold text-[12px]"
          style={{ width: 34, height: 34, backgroundColor: color + '22', color }}
          aria-hidden="true"
        >
          {initials}
        </div>

        {/* Name + template */}
        <div className="flex-1 text-left min-w-0">
          <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {group.newHireName}
          </p>
          <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {group.templateName}
          </p>
        </div>

        {/* Task count badge */}
        <span
          className="inline-flex items-center justify-center rounded-full text-[11px] font-semibold px-2 py-0.5 shrink-0"
          style={{ backgroundColor: 'rgba(59,91,219,0.10)', color: '#3B5BDB' }}
        >
          {group.tasks.length}
        </span>

        {expanded
          ? <ChevronDown size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} aria-hidden="true" />
          : <ChevronRight size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} aria-hidden="true" />
        }
      </button>

      {/* Tasks */}
      {expanded && (
        <div>
          {group.tasks.map(task => (
            <TaskCard key={task.id} task={task} onboardingId={group.onboardingId} />
          ))}
          {group.tasks.length === 0 && (
            <p className="text-[13px] px-4 py-6 text-center" style={{ color: 'var(--text-secondary)' }}>
              No tasks match the current filter.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MyTasksPage
// ─────────────────────────────────────────────────────────────────────────────

export default function MyTasksPage() {
  const user = useAuthStore(s => s.user)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['myTasks', user?.id],
    queryFn: () =>
      usersApi.getUserTasks(user.id, { status: 'pending,in_progress,done,blocked' })
        .then(r => r.data.data),
    enabled: !!user?.id,
    staleTime: 60_000,
  })

  const groups = data ?? []

  // Flatten tasks for counting non-done
  const totalPending = useMemo(() =>
    groups.reduce((acc, g) => acc + g.tasks.filter(t => t.status !== 'done').length, 0),
    [groups]
  )

  // Apply filters — filter per task inside each group, skip empty groups
  const filteredGroups = useMemo(() => {
    return groups
      .map(g => ({
        ...g,
        tasks: g.tasks.filter(task => {
          const matchStatus = statusFilter === 'all' || task.status === statusFilter
          const matchSearch = !search || task.title.toLowerCase().includes(search.toLowerCase())
          return matchStatus && matchSearch
        }),
      }))
      .filter(g => g.tasks.length > 0)
  }, [groups, statusFilter, search])

  const hasFilter = statusFilter !== 'all' || !!search

  // All-done state (data loaded, every task is done)
  const allDone = !isLoading && groups.length > 0 && totalPending === 0 && !hasFilter

  // Empty assigned state
  const noneAssigned = !isLoading && groups.length === 0

  return (
    <div className="min-h-screen px-6 py-8" style={{ backgroundColor: 'var(--bg-app)' }}>
      <div className="mx-auto w-full max-w-[860px]">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[22px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                My Tasks
              </h1>
              {!isLoading && totalPending > 0 && (
                <span
                  className="inline-flex items-center justify-center rounded-full text-[11px] font-semibold px-2 py-0.5"
                  style={{ backgroundColor: 'rgba(59,91,219,0.12)', color: '#3B5BDB' }}
                >
                  {totalPending}
                </span>
              )}
            </div>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Tasks assigned to you across all onboardings
            </p>
          </div>
        </div>

        {/* ── Filters bar ── */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {/* Status tabs */}
          <div
            className="flex items-center gap-0.5 rounded-[8px] p-1"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            role="group"
            aria-label="Filter by status"
          >
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                aria-pressed={statusFilter === f.value}
                className="px-3 py-1 rounded-[6px] text-[12px] font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                style={
                  statusFilter === f.value
                    ? { backgroundColor: 'var(--color-primary, #3B5BDB)', color: '#fff' }
                    : { color: 'var(--text-secondary)' }
                }
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks…"
            aria-label="Search tasks"
            className="flex-1 min-w-[180px] text-[13px] rounded-[8px] border px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#3B5BDB]/30 transition-shadow"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          />

          {/* Reset */}
          {hasFilter && (
            <button
              onClick={() => { setStatusFilter('all'); setSearch('') }}
              className="text-[12px] font-medium cursor-pointer transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              style={{ color: 'var(--color-primary, #3B5BDB)' }}
            >
              Reset filters
            </button>
          )}
        </div>

        {/* ── Skeleton ── */}
        {isLoading && (
          <div className="flex flex-col gap-4">
            <GroupSkeleton />
            <GroupSkeleton />
          </div>
        )}

        {/* ── Empty states ── */}
        {noneAssigned && (
          <div
            className="flex flex-col items-center justify-center py-20 text-center rounded-[8px] border"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-[8px] mb-3"
              style={{ backgroundColor: 'rgba(59,91,219,0.08)' }}
            >
              <CheckCircle size={22} style={{ color: '#3B5BDB' }} aria-hidden="true" />
            </div>
            <p className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              You have no tasks assigned yet
            </p>
            <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
              Tasks will appear here once you are added to an onboarding.
            </p>
          </div>
        )}

        {allDone && (
          <div
            className="flex flex-col items-center justify-center py-20 text-center rounded-[8px] border"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-[8px] mb-3"
              style={{ backgroundColor: 'rgba(22,163,74,0.08)' }}
            >
              <CheckCircle size={22} style={{ color: '#16A34A' }} aria-hidden="true" />
            </div>
            <p className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              All caught up! No pending tasks.
            </p>
            <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
              All your tasks are marked as done.
            </p>
          </div>
        )}

        {!isLoading && !noneAssigned && !allDone && filteredGroups.length === 0 && hasFilter && (
          <div
            className="flex flex-col items-center justify-center py-16 text-center rounded-[8px] border"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <p className="text-[14px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              No tasks match your filters
            </p>
            <button
              onClick={() => { setStatusFilter('all'); setSearch('') }}
              className="text-[12px] font-medium mt-2 cursor-pointer transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              style={{ color: 'var(--color-primary, #3B5BDB)' }}
            >
              Reset filters
            </button>
          </div>
        )}

        {/* ── Grouped task list ── */}
        {!isLoading && filteredGroups.length > 0 && (
          <div className="flex flex-col gap-4">
            {filteredGroups.map(g => (
              <OnboardingGroup key={g.onboardingId} group={g} />
            ))}
          </div>
        )}

      </div>

      {/* Spin keyframe for in_progress icon */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
