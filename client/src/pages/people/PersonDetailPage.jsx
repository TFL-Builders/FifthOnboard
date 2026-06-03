import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  MessageSquare,
} from 'lucide-react'
import { format, parseISO, isPast, isToday } from 'date-fns'
import { usersApi } from '../../api/users'
import { tasksApi } from '../../api/onboardings'
import Avatar from '../../components/onboardings/Avatar'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const PHASE_LABELS = {
  pre_start:   'Before Day One',
  week_1:      'Week 1',
  week_2:      'Week 2',
  week_3_plus: 'Week 3+',
}

const STATUS_FILTERS = [
  { value: 'default', label: 'All (exc. Blocked)' },
  { value: 'all',     label: 'All' },
  { value: 'pending',     label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done',        label: 'Done' },
  { value: 'blocked',     label: 'Blocked' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function roleLabelOf(role) {
  const map = { admin: 'Admin', hr: 'HR', manager: 'Manager', task_owner: 'Task Owner', employee: 'Employee' }
  return map[role] ?? role
}

function deptLabelOf(dept) {
  if (!dept) return null
  const map = { hr: 'HR', manager: 'Manager', it: 'IT', finance: 'Finance', custom: 'Custom' }
  return map[dept] ?? dept
}

function safeDate(val) {
  if (!val) return null
  try { return typeof val === 'string' ? parseISO(val) : new Date(val) } catch { return null }
}

function fmtDate(val) {
  const d = safeDate(val)
  return d ? format(d, 'MMM d, yyyy') : null
}

// ─────────────────────────────────────────────────────────────────────────────
// Atoms
// ─────────────────────────────────────────────────────────────────────────────

function Bone({ w, h = 13, className = '' }) {
  return (
    <div
      className={`rounded animate-pulse ${className}`}
      style={{ width: w, height: h, backgroundColor: 'var(--border-color)', flexShrink: 0 }}
    />
  )
}

function RoleBadge({ role }) {
  const colorMap = {
    admin:      { bg: 'rgba(239,68,68,0.10)',    color: '#DC2626' },
    hr:         { bg: 'rgba(59,91,219,0.10)',     color: '#3B5BDB' },
    manager:    { bg: 'rgba(14,165,233,0.10)',    color: '#0284C7' },
    task_owner: { bg: 'rgba(121,80,242,0.10)',    color: '#7950F2' },
    employee:   { bg: 'rgba(100,116,139,0.10)',   color: '#475569' },
  }
  const s = colorMap[role] ?? { bg: 'rgba(100,116,139,0.10)', color: '#475569' }
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {roleLabelOf(role)}
    </span>
  )
}

function StatusChip({ status }) {
  const map = {
    active:   { label: 'Active',   bg: 'rgba(22,163,74,0.10)',   color: '#16A34A' },
    disabled: { label: 'Disabled', bg: 'rgba(220,38,38,0.10)',   color: '#DC2626' },
    invited:  { label: 'Invited',  bg: 'rgba(217,119,6,0.10)',   color: '#B45309' },
    pending:  { label: 'Pending',  bg: 'rgba(217,119,6,0.10)',   color: '#B45309' },
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

function TaskStatusChip({ status }) {
  const map = {
    pending:     { label: 'Pending',     bg: 'rgba(100,116,139,0.10)', color: '#475569' },
    in_progress: { label: 'In Progress', bg: 'rgba(14,165,233,0.10)',  color: '#0284C7' },
    done:        { label: 'Done',        bg: 'rgba(22,163,74,0.10)',   color: '#16A34A' },
    blocked:     { label: 'Blocked',     bg: 'rgba(220,38,38,0.10)',   color: '#DC2626' },
  }
  const s = map[status] ?? { label: status, bg: 'rgba(100,116,139,0.10)', color: '#475569' }
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  )
}

function PhaseBadge({ phase }) {
  const label = PHASE_LABELS[phase] ?? phase
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
      style={{ backgroundColor: 'rgba(59,91,219,0.08)', color: '#3B5BDB' }}
    >
      {label}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Task Item (read-only, with expandable comments)
// ─────────────────────────────────────────────────────────────────────────────

function TaskComments({ taskId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['task-comments', taskId],
    queryFn: () => tasksApi.getComments(taskId).then(r => r.data.data ?? r.data),
    staleTime: 60_000,
  })

  const comments = Array.isArray(data) ? data : []

  if (isLoading) {
    return (
      <div className="px-4 pb-3 pt-1 space-y-2">
        {[1, 2].map(i => (
          <div key={i} className="flex gap-2.5 animate-pulse">
            <Bone w={22} h={22} className="rounded-full shrink-0" />
            <div className="flex-1 space-y-1">
              <Bone w="60%" h={11} />
              <Bone w="80%" h={11} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <p className="px-4 pb-3 pt-1 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
        No comments yet.
      </p>
    )
  }

  return (
    <div className="px-4 pb-3 pt-1 space-y-2.5">
      {comments.map((c, i) => (
        <div key={c.id ?? i} className="flex items-start gap-2.5">
          <Avatar name={c.author?.name ?? c.name ?? '?'} avatarColor={c.author?.avatarColor ?? c.avatarColor} size={22} />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                {c.author?.name ?? c.name ?? 'Unknown'}
              </span>
              {(c.createdAt ?? c.timestamp) && (
                <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                  {fmtDate(c.createdAt ?? c.timestamp)}
                </span>
              )}
            </div>
            <p className="text-[12px] mt-0.5 leading-snug" style={{ color: 'var(--text-secondary)' }}>
              {c.body ?? c.text ?? c.content ?? ''}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function TaskItem({ task }) {
  const [commentsOpen, setCommentsOpen] = useState(false)
  const dueDate = safeDate(task.dueAt)
  const isOverdue = dueDate && task.status !== 'done' && isPast(dueDate) && !isToday(dueDate)

  return (
    <div style={{ borderBottom: '1px solid var(--border-color)' }}>
      <div className="px-4 py-3 flex items-start gap-3">
        {/* Status icon */}
        <div className="mt-0.5 shrink-0">
          {task.status === 'done' ? (
            <div className="h-4.5 w-4.5 rounded-full flex items-center justify-center" style={{ width: 18, height: 18, backgroundColor: '#16A34A' }}>
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ) : task.status === 'blocked' ? (
            <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: 'rgba(220,38,38,0.15)', border: '1.5px solid #DC2626', flexShrink: 0 }} />
          ) : task.status === 'in_progress' ? (
            <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: 'rgba(14,165,233,0.15)', border: '1.5px solid #0284C7', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: '1.5px solid var(--border-color)', flexShrink: 0 }} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <p
              className="text-[13px] font-medium leading-snug"
              style={{
                color: task.status === 'done' ? 'var(--text-secondary)' : 'var(--text-primary)',
                textDecoration: task.status === 'done' ? 'line-through' : 'none',
              }}
            >
              {task.title}
            </p>
            <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
              <TaskStatusChip status={task.status} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <PhaseBadge phase={task.phase} />
            {dueDate && (
              <span
                className="text-[11px]"
                style={{ color: isOverdue ? '#DC2626' : 'var(--text-secondary)' }}
              >
                Due {format(dueDate, 'MMM d, yyyy')}
              </span>
            )}
            {task.requiresUpload && (
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                style={{ backgroundColor: 'rgba(121,80,242,0.08)', color: '#7950F2' }}
              >
                Upload required
              </span>
            )}
            {task.blockedReason && (
              <span className="text-[11px]" style={{ color: '#DC2626' }}>
                Blocked: {task.blockedReason}
              </span>
            )}
            {task.completedAt && (
              <span className="text-[11px]" style={{ color: '#16A34A' }}>
                Completed {format(safeDate(task.completedAt), 'MMM d')}
              </span>
            )}

            {/* Toggle comments */}
            <button
              onClick={() => setCommentsOpen(v => !v)}
              className="flex items-center gap-1 cursor-pointer transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              aria-expanded={commentsOpen}
              aria-label={commentsOpen ? 'Hide comments' : 'View comments'}
            >
              <MessageSquare size={11} aria-hidden="true" style={{ color: 'var(--text-secondary)' }} />
              <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                Comments
              </span>
              {commentsOpen
                ? <ChevronDown size={10} aria-hidden="true" style={{ color: 'var(--text-secondary)' }} />
                : <ChevronRight size={10} aria-hidden="true" style={{ color: 'var(--text-secondary)' }} />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Comments panel */}
      {commentsOpen && (
        <div
          style={{ borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}
        >
          <TaskComments taskId={task.id} />
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Task Group
// ─────────────────────────────────────────────────────────────────────────────

function GroupSkeleton() {
  return (
    <div
      className="rounded-[8px] border overflow-hidden"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      <div className="px-4 py-3 animate-pulse" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <Bone w={160} h={14} className="mb-1.5" />
        <Bone w={100} h={11} />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="px-4 py-3 animate-pulse flex items-start gap-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <Bone w={18} h={18} className="rounded-full shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1.5">
            <Bone w="55%" />
            <div className="flex gap-2">
              <Bone w={80} h={18} className="rounded" />
              <Bone w={90} h={18} className="rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function TaskGroup({ group }) {
  const [collapsed, setCollapsed] = useState(false)
  const doneCount = group.tasks.filter(t => t.status === 'done').length

  return (
    <div
      className="rounded-[8px] border overflow-hidden"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      {/* Group header */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        style={{
          borderBottom: collapsed ? 'none' : '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-card)',
        }}
        aria-expanded={!collapsed}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-app)' }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--bg-card)' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              {group.newHireName}
            </p>
            <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
              {doneCount}/{group.tasks.length} done
            </span>
          </div>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {group.templateName}
          </p>
        </div>
        {collapsed
          ? <ChevronRight size={15} aria-hidden="true" style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
          : <ChevronDown size={15} aria-hidden="true" style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
        }
      </button>

      {/* Tasks */}
      {!collapsed && (
        group.tasks.length === 0 ? (
          <p className="px-4 py-4 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            No tasks in this onboarding match the current filter.
          </p>
        ) : (
          group.tasks.map(task => (
            <TaskItem key={task.id} task={task} />
          ))
        )
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PersonDetailPage
// ─────────────────────────────────────────────────────────────────────────────

export default function PersonDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('default')

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getById(id).then(r => r.data.data),
    staleTime: 60_000,
  })

  // Fetch all tasks (including blocked) so we can filter client-side
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['user-tasks', id],
    queryFn: () =>
      usersApi.getTasks(id, { status: 'pending,in_progress,done,blocked' }).then(r => r.data.data),
    enabled: !!id,
    staleTime: 60_000,
  })

  const person = userData
  const rawGroups = tasksData ?? []

  const filteredGroups = useMemo(() => {
    return rawGroups.map(group => ({
      ...group,
      tasks: group.tasks.filter(task => {
        if (statusFilter === 'all') return true
        if (statusFilter === 'default') return task.status !== 'blocked'
        return task.status === statusFilter
      }),
    })).filter(group => group.tasks.length > 0)
  }, [rawGroups, statusFilter])

  return (
    <div className="min-h-screen px-6 py-8" style={{ backgroundColor: 'var(--bg-app)' }}>
      <div className="mx-auto w-full max-w-[860px]">

        {/* Back */}
        <button
          onClick={() => navigate('/people')}
          className="flex items-center gap-1.5 mb-5 cursor-pointer transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded text-[13px] font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Back to People
        </button>

        {/* Profile card */}
        <div
          className="rounded-[8px] border p-5 mb-6"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          {userLoading ? (
            <div className="flex items-center gap-4 animate-pulse">
              <div className="rounded-full shrink-0" style={{ width: 48, height: 48, backgroundColor: 'var(--border-color)' }} />
              <div className="flex-1 space-y-2">
                <Bone w={160} h={16} />
                <div className="flex gap-2">
                  <Bone w={60} h={20} className="rounded-full" />
                  <Bone w={60} h={20} className="rounded-full" />
                </div>
                <Bone w={180} h={12} />
              </div>
            </div>
          ) : person ? (
            <div className="flex items-start gap-4">
              <Avatar name={person.name} avatarColor={person.avatarColor} size={48} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-[18px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {person.name}
                  </h1>
                  <RoleBadge role={person.role} />
                  {person.department && (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                      style={{ backgroundColor: 'rgba(100,116,139,0.10)', color: '#475569' }}
                    >
                      {deptLabelOf(person.department)}
                    </span>
                  )}
                  <StatusChip status={person.status} />
                </div>
                <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                  {person.email}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>Member not found.</p>
          )}
        </div>

        {/* Tasks section */}
        <div>
          {/* Section header + filter */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              Tasks across onboardings
            </h2>

            {/* Status filter pills */}
            <div
              className="flex rounded-[6px] border overflow-hidden"
              style={{ borderColor: 'var(--border-color)' }}
              role="group"
              aria-label="Task status filter"
            >
              {STATUS_FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className="h-8 px-3 text-[11px] font-medium cursor-pointer transition-colors"
                  style={{
                    backgroundColor: statusFilter === f.value ? '#3B5BDB' : 'var(--bg-card)',
                    color: statusFilter === f.value ? '#fff' : 'var(--text-secondary)',
                    borderRight: '1px solid var(--border-color)',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Groups */}
          {tasksLoading ? (
            <div className="space-y-4">
              <GroupSkeleton />
              <GroupSkeleton />
            </div>
          ) : filteredGroups.length === 0 ? (
            <div
              className="rounded-[8px] border flex flex-col items-center justify-center py-16 text-center"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-[8px] mb-3"
                style={{ backgroundColor: 'rgba(59,91,219,0.08)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
              </div>
              <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                No tasks assigned to this member
              </p>
              {statusFilter !== 'default' && (
                <button
                  onClick={() => setStatusFilter('default')}
                  className="mt-2 text-[12px] cursor-pointer transition-opacity hover:opacity-70"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Clear filter
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGroups.map(group => (
                <TaskGroup key={group.onboardingId} group={group} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
