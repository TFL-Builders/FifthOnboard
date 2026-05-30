import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Eye,
  Pencil,
  XCircle,
  AlertTriangle,
  Search,
  Users,
  CalendarDays,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { formatDistanceToNowStrict, isAfter, parseISO } from 'date-fns'
import { onboardingsApi } from '../../api/onboardings'
import useAuthStore from '../../stores/authStore'
import Button from '../../components/ui/Button'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  active: {
    label: 'Active',
    bg: 'rgba(34,197,94,0.10)',
    color: '#16a34a',
  },
  completed: {
    label: 'Completed',
    bg: 'rgba(59,130,246,0.10)',
    color: '#2563eb',
  },
  archived: {
    label: 'Archived',
    bg: 'rgba(100,116,139,0.10)',
    color: '#475569',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'rgba(239,68,68,0.10)',
    color: '#dc2626',
  },
}

const PROGRESS_COLOR = (pct) => {
  if (pct >= 80) return '#16a34a'
  if (pct >= 50) return '#2563eb'
  if (pct >= 20) return '#d97706'
  return '#dc2626'
}

const STATUS_OPTIONS = [
  { value: 'active',    label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived',  label: 'Archived' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'all',       label: 'All statuses' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

const AVATAR_COLORS = [
  '#3b5bdb','#1098ad','#0ca678','#f59f00','#e64980','#7950f2','#f76707','#2f9e44',
]

function avatarColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function relativeTime(dateStr) {
  if (!dateStr) return ''
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
    const now = new Date()
    const diffMs = now - d
    if (diffMs < 86400000) return 'Today'
    if (diffMs < 172800000) return 'Yesterday'
    return formatDistanceToNowStrict(d, { addSuffix: true })
  } catch {
    return ''
  }
}

function isOverdue(tasks = []) {
  const now = new Date()
  return tasks.some(
    (t) => t.dueAt && t.status !== 'done' && isAfter(now, parseISO(t.dueAt)),
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// useDebounced
// ─────────────────────────────────────────────────────────────────────────────

function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[240, 140, 120, 100, 80, 60].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div
            className="h-[14px] rounded"
            style={{ width: w, backgroundColor: 'var(--border-color)', maxWidth: '100%' }}
          />
          {i === 0 && (
            <div
              className="h-[11px] rounded mt-1.5"
              style={{ width: 100, backgroundColor: 'var(--border-color)' }}
            />
          )}
        </td>
      ))}
    </tr>
  )
}

function RecentTaskSkeleton() {
  return (
    <div className="flex items-start gap-3 py-3 animate-pulse">
      <div
        className="h-7 w-7 rounded-full shrink-0"
        style={{ backgroundColor: 'var(--border-color)' }}
      />
      <div className="flex-1 space-y-1.5">
        <div className="h-[13px] rounded" style={{ width: '80%', backgroundColor: 'var(--border-color)' }} />
        <div className="h-[11px] rounded" style={{ width: '60%', backgroundColor: 'var(--border-color)' }} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Cancel dialog
// ─────────────────────────────────────────────────────────────────────────────

function CancelDialog({ onboarding, onConfirm, onCancel, isLoading }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-dialog-title"
    >
      <div
        className="w-full max-w-sm rounded-[10px] p-6 space-y-4"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.10)',
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(220,38,38,0.10)' }}
          >
            <XCircle size={16} style={{ color: '#dc2626' }} aria-hidden="true" />
          </div>
          <div>
            <h2
              id="cancel-dialog-title"
              className="text-[15px] font-semibold leading-snug"
              style={{ color: 'var(--text-primary)' }}
            >
              Cancel onboarding for {onboarding.newHireName}?
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              All pending tasks will be blocked.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={isLoading}>
            No, keep it
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            loading={isLoading}
            className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
          >
            Yes, cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────────────────────────────────────

function Avatar({ name, size = 28, color }) {
  const bg = color || avatarColor(name)
  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0 font-semibold"
      style={{
        width: size,
        height: size,
        backgroundColor: bg + '22',
        color: bg,
        fontSize: size * 0.36,
      }}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Status chip
// ─────────────────────────────────────────────────────────────────────────────

function StatusChip({ status }) {
  const s = STATUS_STYLES[status] || { label: status, bg: 'rgba(100,116,139,0.10)', color: '#475569' }
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
// Select component
// ─────────────────────────────────────────────────────────────────────────────

function SelectField({ value, onChange, options, placeholder, icon: Icon }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--text-secondary)' }}
          aria-hidden="true"
        />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[34px] rounded-[8px] border text-[13px] cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-primary pr-7 appearance-none
          transition-colors"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
          paddingLeft: Icon ? '28px' : '10px',
        }}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'var(--text-secondary)' }}
        aria-hidden="true"
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding table row
// ─────────────────────────────────────────────────────────────────────────────

function OnboardingRow({ onboarding, isHR, onView, onEdit, onCancel }) {
  const [hovered, setHovered] = useState(false)
  const progress = onboarding.progress ?? 0
  const pColor = PROGRESS_COLOR(progress)
  const overdue = isOverdue(onboarding.tasks)
  const noManager = onboarding.warnings?.hasNoManager
  const unassigned = onboarding.warnings?.hasUnassignedTasks

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: hovered ? 'var(--bg-app)' : 'transparent',
        transition: 'background-color 150ms',
      }}
    >
      {/* NAME */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar name={onboarding.newHireName} size={30} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className="text-[13px] font-medium truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {onboarding.newHireName}
              </span>
              {noManager && (
                <span title="No manager assigned" className="cursor-default">
                  <AlertTriangle size={12} style={{ color: '#d97706' }} aria-label="No manager assigned" />
                </span>
              )}
              {unassigned && (
                <span title="Some tasks unassigned" className="cursor-default">
                  <AlertTriangle size={12} style={{ color: '#d97706' }} aria-label="Some tasks unassigned" />
                </span>
              )}
            </div>
            <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
              {onboarding.job || 'New Hire'}
            </p>
          </div>
        </div>
      </td>

      {/* TEMPLATE */}
      <td className="px-4 py-3">
        <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>
          {onboarding.templateName || '—'}
        </span>
      </td>

      {/* MANAGER */}
      <td className="px-4 py-3">
        <span
          className="text-[13px]"
          style={{ color: onboarding.managerName ? 'var(--text-primary)' : 'var(--text-secondary)' }}
        >
          {onboarding.managerName || 'Unassigned'}
        </span>
      </td>

      {/* PROGRESS */}
      <td className="px-4 py-3">
        <div className="min-w-[90px]">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-medium tabular-nums" style={{ color: pColor }}>
              {progress}%
            </span>
            {overdue && (
              <span
                className="inline-flex items-center px-1.5 py-0 rounded text-[10px] font-medium"
                style={{ backgroundColor: 'rgba(220,38,38,0.10)', color: '#dc2626' }}
              >
                Overdue
              </span>
            )}
          </div>
          <div
            className="h-[5px] rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--border-color)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, backgroundColor: pColor }}
            />
          </div>
        </div>
      </td>

      {/* STATUS */}
      <td className="px-4 py-3">
        <StatusChip status={onboarding.status} />
      </td>

      {/* ACTIONS */}
      <td className="px-4 py-3">
        <div
          className="flex items-center gap-1 transition-opacity duration-150"
          style={{ opacity: hovered ? 1 : 0 }}
        >
          <IconBtn onClick={onView} label={`View ${onboarding.newHireName}'s onboarding`} title="View">
            <Eye size={13} aria-hidden="true" />
          </IconBtn>
          {isHR && (
            <>
              <IconBtn onClick={onEdit} label={`Edit ${onboarding.newHireName}'s onboarding`} title="Edit">
                <Pencil size={13} aria-hidden="true" />
              </IconBtn>
              {onboarding.status !== 'cancelled' && onboarding.status !== 'completed' && (
                <IconBtn onClick={onCancel} label={`Cancel ${onboarding.newHireName}'s onboarding`} title="Cancel" danger>
                  <XCircle size={13} aria-hidden="true" />
                </IconBtn>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

function IconBtn({ onClick, label, children, danger = false }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={[
        'inline-flex items-center justify-center h-[26px] w-[26px] rounded-[6px]',
        'cursor-pointer transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        danger
          ? 'hover:bg-red-50 dark:hover:bg-red-950/30 focus-visible:ring-red-500 text-red-500'
          : 'hover:bg-black/5 dark:hover:bg-white/8 focus-visible:ring-primary',
      ].join(' ')}
      style={danger ? undefined : { color: 'var(--text-secondary)' }}
    >
      {children}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Recently Completed Panel
// ─────────────────────────────────────────────────────────────────────────────

function RecentlyCompletedPanel({ onboardings = [] }) {
  // Get most recent onboarding and fetch its recently-completed tasks
  const mostRecentId = onboardings[0]?.id

  const { data, isLoading } = useQuery({
    queryKey: ['recentTasks', mostRecentId],
    queryFn: () =>
      onboardingsApi.getTasks(mostRecentId, { recentlyCompleted: true }).then((r) => r.data),
    enabled: !!mostRecentId,
  })

  const tasks = data?.data ?? []

  return (
    <div
      className="rounded-[10px] border p-4 sticky top-6"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div className="mb-4">
        <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          Recently Completed
        </h3>
        <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Latest task completions across all onboardings
        </p>
      </div>

      {isLoading && (
        <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
          {Array.from({ length: 5 }).map((_, i) => <RecentTaskSkeleton key={i} />)}
        </div>
      )}

      {!isLoading && tasks.length === 0 && (
        <div className="py-8 text-center">
          <CheckCircle2 size={28} className="mx-auto mb-2" style={{ color: 'var(--border-color)' }} aria-hidden="true" />
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            No completed tasks yet
          </p>
        </div>
      )}

      {!isLoading && tasks.length > 0 && (
        <div className="space-y-0">
          {tasks.map((task, i) => (
            <div
              key={task.id ?? i}
              className="flex items-start gap-2.5 py-3"
              style={{ borderBottom: i < tasks.length - 1 ? '1px solid var(--border-color)' : 'none' }}
            >
              <Avatar
                name={task.completedByName || task.assigneeName || '?'}
                size={26}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium leading-snug truncate" style={{ color: 'var(--text-primary)' }}>
                  {task.title}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  in {task.onboardingName || onboardings[0]?.newHireName || 'Unknown'}'s onboarding
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  Completed by {task.completedByName || task.assigneeName || 'Unknown'} ·{' '}
                  {relativeTime(task.completedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({ isHR, onNew }) {
  return (
    <tr>
      <td colSpan={6}>
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-[10px] mb-4"
            style={{ backgroundColor: 'rgba(59,91,219,0.08)' }}
          >
            <Users size={22} className="text-primary" aria-hidden="true" />
          </div>
          <p className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            No onboardings yet
          </p>
          <p className="text-[14px] mb-6 max-w-[280px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {isHR ? 'Launch your first onboarding to get started.' : "Onboardings you're assigned to will appear here."}
          </p>
          {isHR && (
            <Button onClick={onNew} className="gap-1.5">
              <Plus size={15} aria-hidden="true" />
              Start your first onboarding
            </Button>
          )}
        </div>
      </td>
    </tr>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// OnboardingsPage
// ─────────────────────────────────────────────────────────────────────────────

export default function OnboardingsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const isHR = user?.role === 'hr' || user?.role === 'admin'

  // ── Filters state ──────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [managerFilter, setManagerFilter] = useState('')
  const [startDateFilter, setStartDateFilter] = useState('')
  const debouncedSearch = useDebounced(searchInput)

  const hasActiveFilters =
    debouncedSearch || statusFilter !== 'active' || managerFilter || startDateFilter

  const resetFilters = () => {
    setSearchInput('')
    setStatusFilter('active')
    setManagerFilter('')
    setStartDateFilter('')
  }

  // ── Cancel dialog ──────────────────────────────────────────────────────────
  const [cancelTarget, setCancelTarget] = useState(null)

  // ── Query ──────────────────────────────────────────────────────────────────
  const params = useMemo(() => {
    const p = {}
    if (statusFilter && statusFilter !== 'all') p.status = statusFilter
    if (debouncedSearch) p.search = debouncedSearch
    if (managerFilter) p.manager = managerFilter
    if (startDateFilter) p.startDate = startDateFilter
    return p
  }, [statusFilter, debouncedSearch, managerFilter, startDateFilter])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['onboardings', params],
    queryFn: () => onboardingsApi.list(params).then((r) => r.data),
  })

  const onboardings = data?.data ?? []

  // ── Manager options (derived from data) ───────────────────────────────────
  const managerOptions = useMemo(() => {
    const seen = new Set()
    const opts = []
    for (const o of onboardings) {
      if (o.managerName && !seen.has(o.managerName)) {
        seen.add(o.managerName)
        opts.push({ value: o.managerName, label: o.managerName })
      }
    }
    return opts
  }, [onboardings])

  // ── Cancel mutation ────────────────────────────────────────────────────────
  const cancelMutation = useMutation({
    mutationFn: (id) => onboardingsApi.cancel(id),
    onSuccess: () => {
      toast.success('Onboarding cancelled')
      setCancelTarget(null)
      queryClient.invalidateQueries({ queryKey: ['onboardings'] })
    },
    onError: () => toast.error('Failed to cancel onboarding'),
  })

  // ── Render ─────────────────────────────────────────────────────────────────
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

      {cancelTarget && (
        <CancelDialog
          onboarding={cancelTarget}
          isLoading={cancelMutation.isPending}
          onConfirm={() => cancelMutation.mutate(cancelTarget.id)}
          onCancel={() => setCancelTarget(null)}
        />
      )}

      <div className="min-h-screen px-6 py-8" style={{ backgroundColor: 'var(--bg-app)' }}>
        <div className="mx-auto w-full max-w-[1280px]">

          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1
                className="text-[24px] font-semibold leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                Onboardings
              </h1>
              <p className="mt-1 text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                Track every new hire from offer to productive.
              </p>
            </div>
            {isHR && (
              <Button onClick={() => navigate('/onboardings/new')} className="gap-1.5 shrink-0">
                <Plus size={16} aria-hidden="true" />
                New onboarding
              </Button>
            )}
          </div>

          {/* ── Filters bar ─────────────────────────────────────────────── */}
          <div
            className="flex flex-wrap items-center gap-2 mb-4 p-3 rounded-[10px] border"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            {/* Search */}
            <div className="relative flex-1 min-w-[180px] max-w-[280px]">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-secondary)' }}
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="Search new hires…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="Search onboardings"
                className="w-full h-[34px] pl-8 pr-3 rounded-[8px] border text-[13px]
                  focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                style={{
                  backgroundColor: 'var(--bg-app)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            {/* Status filter */}
            <SelectField
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_OPTIONS}
            />

            {/* Manager filter — HR/admin only */}
            {isHR && managerOptions.length > 0 && (
              <SelectField
                value={managerFilter}
                onChange={setManagerFilter}
                options={managerOptions}
                placeholder="All managers"
                icon={Users}
              />
            )}

            {/* Start date */}
            <div className="relative">
              <CalendarDays
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-secondary)' }}
                aria-hidden="true"
              />
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                aria-label="Starting from date"
                className="h-[34px] pl-8 pr-3 rounded-[8px] border text-[13px] cursor-pointer
                  focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  color: startDateFilter ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              />
            </div>

            {/* Reset */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Reset filters
              </Button>
            )}
          </div>

          {/* ── Two-column layout ────────────────────────────────────────── */}
          <div className="flex gap-5 items-start">

            {/* Left — table (70%) */}
            <div className="flex-1 min-w-0">
              <div
                className="rounded-[10px] border overflow-hidden"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                }}
              >
                {/* Error */}
                {!isLoading && isError && (
                  <div
                    className="flex items-center gap-3 px-4 py-6"
                    role="alert"
                    aria-live="assertive"
                  >
                    <AlertCircle size={16} style={{ color: '#dc2626' }} className="shrink-0" aria-hidden="true" />
                    <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                      Failed to load onboardings. Please refresh and try again.
                    </p>
                  </div>
                )}

                <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      {['Name', 'Template', 'Manager', 'Progress', 'Status', ''].map((col) => (
                        <th
                          key={col}
                          className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading &&
                      Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

                    {!isLoading && !isError && onboardings.length === 0 && (
                      <EmptyState isHR={isHR} onNew={() => navigate('/onboardings/new')} />
                    )}

                    {!isLoading && !isError && onboardings.map((o) => (
                      <OnboardingRow
                        key={o.id}
                        onboarding={o}
                        isHR={isHR}
                        onView={() => navigate(`/onboardings/${o.id}`)}
                        onEdit={() => navigate(`/onboardings/${o.id}/edit`)}
                        onCancel={() => setCancelTarget(o)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right — recently completed (30%) */}
            <div className="w-[300px] shrink-0 hidden lg:block">
              <RecentlyCompletedPanel onboardings={onboardings} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
