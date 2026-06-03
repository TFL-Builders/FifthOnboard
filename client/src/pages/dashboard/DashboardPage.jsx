import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Plus,
  FileText,
  UserPlus,
  ArrowRight,
} from 'lucide-react'
import {
  formatDistanceToNow,
  parseISO,
  format,
  isSameMonth,
  isSameYear,
} from 'date-fns'
import { onboardingsApi } from '../../api/onboardings'
import useAuthStore from '../../stores/authStore'
import Button from '../../components/ui/Button'

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens (all progress colors per spec)
// ─────────────────────────────────────────────────────────────────────────────

function progressColor(pct) {
  if (pct <= 25)  return '#DC2626'
  if (pct <= 50)  return '#D97706'
  if (pct <= 75)  return '#0EA5E9'
  if (pct < 100)  return '#3B5BDB'
  return '#16A34A'
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  '#3B5BDB','#1098AD','#0CA678','#F59F00','#E64980','#7950F2','#F76707','#2F9E44',
]

function deterministicColor(str = '') {
  let h = 0
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length]
}

function Avatar({ name, avatarColor, size = 32 }) {
  const initials = name
    ? name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'
  const bg = avatarColor ?? deterministicColor(name ?? '')
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '9999px',
        backgroundColor: bg + '22',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.35, fontWeight: 600, color: bg, flexShrink: 0,
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

function timeGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function relativeTime(dateStr) {
  if (!dateStr) return ''
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
    return formatDistanceToNow(d, { addSuffix: true })
  } catch { return '' }
}

function safeParseISO(str) {
  if (!str) return null
  try { return typeof str === 'string' ? parseISO(str) : new Date(str) } catch { return null }
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton atoms
// ─────────────────────────────────────────────────────────────────────────────

function Bone({ w, h = 13, className = '' }) {
  return (
    <div
      className={`rounded animate-pulse ${className}`}
      style={{ width: w, height: h, backgroundColor: 'var(--border-color)', flexShrink: 0 }}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat card
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, iconBg, iconColor, label, value, loading }) {
  return (
    <div
      className="rounded-[8px] border p-4 flex items-center gap-4"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      <div
        className="rounded-[8px] flex items-center justify-center shrink-0"
        style={{ width: 44, height: 44, backgroundColor: iconBg }}
      >
        <Icon size={20} aria-hidden="true" style={{ color: iconColor }} />
      </div>
      <div className="min-w-0">
        {loading
          ? <>
              <Bone w={88} h={28} className="mb-1.5" />
              <Bone w={120} h={12} />
            </>
          : <>
              <p
                className="font-semibold leading-none"
                style={{ fontSize: 30, color: 'var(--text-primary)' }}
              >
                {value}
              </p>
              <p
                className="text-[13px] mt-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                {label}
              </p>
            </>
        }
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Active onboardings table
// ─────────────────────────────────────────────────────────────────────────────

const TH_COLS = ['Name', 'Template', 'Progress', 'Status', 'Start Date']

function StatusChip({ status }) {
  const map = {
    active:    { label: 'Active',    bg: 'rgba(34,197,94,0.10)',  color: '#16A34A' },
    completed: { label: 'Completed', bg: 'rgba(59,130,246,0.10)', color: '#2563EB' },
    cancelled: { label: 'Cancelled', bg: 'rgba(239,68,68,0.10)',  color: '#DC2626' },
    archived:  { label: 'Archived',  bg: 'rgba(100,116,139,0.10)',color: '#475569' },
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

function TableRowSkeleton() {
  return (
    <tr className="animate-pulse" style={{ borderBottom: '1px solid var(--border-color)' }}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-full shrink-0" style={{ width: 30, height: 30, backgroundColor: 'var(--border-color)' }} />
          <div className="space-y-1.5">
            <Bone w={120} />
            <Bone w={80} h={11} />
          </div>
        </div>
      </td>
      <td className="px-4 py-3"><Bone w={90} /></td>
      <td className="px-4 py-3">
        <Bone w={100} className="mb-1.5" />
        <Bone w={100} h={5} />
      </td>
      <td className="px-4 py-3"><Bone w={64} h={20} className="rounded-full" /></td>
      <td className="px-4 py-3"><Bone w={80} /></td>
    </tr>
  )
}

function OnboardingRow({ o, onClick }) {
  const pct  = o.progressPercent ?? 0
  const pClr = progressColor(pct)
  const hasWarning = o.warnings?.hasUnassignedTasks || o.warnings?.hasNoManager
  const startDateParsed = safeParseISO(o.startDate)

  return (
    <tr
      onClick={onClick}
      className="cursor-pointer transition-colors"
      style={{ borderBottom: '1px solid var(--border-color)' }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-app)'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      {/* Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar name={o.newHireName} size={30} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                className="text-[13px] font-semibold truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {o.newHireName}
              </span>
              {hasWarning && (
                <span
                  title={[
                    o.warnings?.hasNoManager ? 'No manager assigned' : null,
                    o.warnings?.hasUnassignedTasks ? 'Unassigned tasks' : null,
                  ].filter(Boolean).join(' · ')}
                  aria-label="Warnings present"
                >
                  <AlertTriangle size={12} aria-hidden="true" style={{ color: '#D97706', flexShrink: 0 }} />
                </span>
              )}
            </div>
            <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
              {o.job || 'New Hire'}
            </p>
          </div>
        </div>
      </td>

      {/* Template */}
      <td className="px-4 py-3">
        <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>
          {o.templateName || '—'}
        </span>
      </td>

      {/* Progress */}
      <td className="px-4 py-3">
        <div className="min-w-[100px]">
          <span
            className="text-[12px] font-semibold tabular-nums"
            style={{ color: pClr }}
          >
            {pct}%
          </span>
          <div
            className="mt-1 rounded-full overflow-hidden"
            style={{ height: 6, backgroundColor: 'var(--border-color)' }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${pct}%`, backgroundColor: pClr }}
            />
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusChip status={o.status} />
      </td>

      {/* Start date */}
      <td className="px-4 py-3">
        <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          {startDateParsed ? format(startDateParsed, 'MMM d, yyyy') : '—'}
        </span>
      </td>
    </tr>
  )
}

function ActiveOnboardingsTable({ data, loading, isManager, navigate }) {
  const rows = data.slice(0, 8)

  return (
    <div
      className="rounded-[8px] border overflow-hidden"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3.5"
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        <div>
          <h2 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            {isManager ? 'Your Onboardings' : 'Active Onboardings'}
          </h2>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Currently in progress
          </p>
        </div>
        <button
          onClick={() => navigate('/onboardings')}
          className="flex items-center gap-1 text-[12px] font-medium cursor-pointer transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          style={{ color: 'var(--color-primary)' }}
        >
          View all
          <ArrowRight size={12} aria-hidden="true" />
        </button>
      </div>

      {/* Table */}
      <table className="w-full" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
            {TH_COLS.map(col => (
              <th
                key={col}
                className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: 'var(--text-secondary)' }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)}

          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={5}>
                <div className="flex flex-col items-center justify-center py-14 text-center px-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-[8px] mb-3"
                    style={{ backgroundColor: 'rgba(59,91,219,0.08)' }}
                  >
                    <Users size={20} className="text-primary" aria-hidden="true" />
                  </div>
                  <p className="text-[14px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    No active onboardings
                  </p>
                  <p className="text-[13px] mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {isManager
                      ? 'Onboardings assigned to you will appear here.'
                      : 'Start your first onboarding to get going.'}
                  </p>
                  {!isManager && (
                    <Button size="sm" onClick={() => navigate('/onboardings/new')} className="gap-1.5">
                      <Plus size={14} aria-hidden="true" />
                      New onboarding
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          )}

          {!loading && rows.map(o => (
            <OnboardingRow
              key={o.id}
              o={o}
              onClick={() => navigate(`/onboardings/${o.id}`)}
            />
          ))}
        </tbody>
      </table>

      {/* Footer link */}
      {!loading && data.length > 8 && (
        <div
          className="px-4 py-3 text-center"
          style={{ borderTop: '1px solid var(--border-color)' }}
        >
          <button
            onClick={() => navigate('/onboardings')}
            className="text-[13px] font-medium cursor-pointer transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-primary)' }}
          >
            View all {data.length} onboardings →
          </button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Activity feed
// ─────────────────────────────────────────────────────────────────────────────

function ActivityItemSkeleton() {
  return (
    <div className="flex items-start gap-2.5 py-3 animate-pulse" style={{ borderBottom: '1px solid var(--border-color)' }}>
      <div className="rounded-full shrink-0" style={{ width: 28, height: 28, backgroundColor: 'var(--border-color)' }} />
      <div className="flex-1 space-y-1.5">
        <Bone w="85%" />
        <Bone w="60%" h={11} />
        <Bone w="40%" h={11} />
      </div>
    </div>
  )
}

function ActivityItem({ task, isLast }) {
  const name  = task.completedBy?.name ?? 'Unknown'
  const color = task.completedBy?.avatarColor
  return (
    <div
      className="flex items-start gap-2.5 py-3"
      style={{ borderBottom: isLast ? 'none' : '1px solid var(--border-color)' }}
    >
      <Avatar name={name} avatarColor={color} size={28} />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
          <span style={{ color: 'var(--text-primary)' }}>{name}</span>
          {' '}completed{' '}
          <span className="font-semibold">{task.title}</span>
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          in {task.newHireName ?? 'Unknown'}'s onboarding
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {relativeTime(task.completedAt)}
        </p>
      </div>
    </div>
  )
}

function ActivityFeed({ tasks, loading }) {
  return (
    <div
      className="rounded-[8px] border p-4 sticky top-6"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      <div className="mb-3">
        <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          Recent Activity
        </h3>
        <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Latest task completions
        </p>
      </div>

      {loading && Array.from({ length: 5 }).map((_, i) => (
        <ActivityItemSkeleton key={i} />
      ))}

      {!loading && tasks.length === 0 && (
        <div className="py-10 flex flex-col items-center text-center">
          <CheckCircle2
            size={26}
            className="mb-2"
            style={{ color: 'var(--border-color)' }}
            aria-hidden="true"
          />
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            No recent activity
          </p>
        </div>
      )}

      {!loading && tasks.slice(0, 10).map((task, i, arr) => (
        <ActivityItem
          key={task.id ?? i}
          task={task}
          isLast={i === arr.slice(0, 10).length - 1}
        />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick actions (HR / admin only)
// ─────────────────────────────────────────────────────────────────────────────

function QuickActionCard({ icon: Icon, iconBg, iconColor, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex items-center gap-3 rounded-[8px] border p-4 cursor-pointer text-left w-full',
        'transition-all duration-150',
        'hover:-translate-y-0.5 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
      ].join(' ')}
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      <div
        className="rounded-[8px] flex items-center justify-center shrink-0"
        style={{ width: 36, height: 36, backgroundColor: iconBg }}
      >
        <Icon size={17} aria-hidden="true" style={{ color: iconColor }} />
      </div>
      <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        {label}
      </span>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DashboardPage
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate()
  const user     = useAuthStore(s => s.user)
  const isHR     = ['hr', 'admin'].includes(user?.role)
  const isManager = user?.role === 'manager'

  // ── Data fetching ──────────────────────────────────────────────────────────

  // All onboardings (for stats)
  const { data: allData, isLoading: allLoading } = useQuery({
    queryKey: ['dashboard-all'],
    queryFn: () => onboardingsApi.list({ status: 'all' }).then(r => r.data),
    staleTime: 60_000,
  })

  // Active onboardings (for table)
  const { data: activeData, isLoading: activeLoading } = useQuery({
    queryKey: ['dashboard-active'],
    queryFn: () => onboardingsApi.list({ status: 'active' }).then(r => r.data),
    staleTime: 60_000,
  })

  // Anchor ID for recently completed tasks
  const anchorId = activeData?.data?.[0]?.id

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['dashboard-recent-tasks'],
    queryFn: () =>
      onboardingsApi.getTasks(anchorId, { recentlyCompleted: true }).then(r => r.data),
    enabled: !!anchorId,
    staleTime: 60_000,
  })

  // ── Derived data ───────────────────────────────────────────────────────────

  const all    = allData?.data ?? []
  const active = activeData?.data ?? []
  const tasks  = tasksData?.data ?? []

  const stats = useMemo(() => {
    const now = new Date()

    const activeCount = all.filter(o => o.status === 'active').length

    const completedThisMonth = all.filter(o => {
      if (o.status !== 'completed') return false
      const d = safeParseISO(o.completedAt)
      return d && isSameMonth(d, now) && isSameYear(d, now)
    }).length

    const onTrack = all.filter(
      o => o.status === 'active' && (o.progressPercent ?? 0) >= 50,
    ).length

    const needAttention = all.filter(
      o => o.warnings?.hasUnassignedTasks || o.warnings?.hasNoManager,
    ).length

    return { activeCount, completedThisMonth, onTrack, needAttention }
  }, [all])

  // For managers, filter active list to their onboardings
  const tableRows = useMemo(() => {
    if (isManager && user?.id) {
      return active.filter(o => o.managerId === user.id || o.managerId === undefined)
    }
    return active
  }, [active, isManager, user?.id])

  // ── Greeting / date ────────────────────────────────────────────────────────

  const firstName = user?.name?.split(' ')[0] ?? 'there'
  const today     = format(new Date(), 'EEEE, MMMM d, yyyy')
  const greeting  = timeGreeting()

  return (
    <div className="min-h-screen px-6 py-8" style={{ backgroundColor: 'var(--bg-app)' }}>
      <div className="mx-auto w-full max-w-[1280px]">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1
              className="text-[24px] font-semibold leading-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {greeting}, {firstName}
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {today}
            </p>
            <p className="text-[14px] mt-1" style={{ color: 'var(--text-secondary)' }}>
              Here's what's happening with your onboardings today.
            </p>
          </div>
          {isHR && (
            <Button
              onClick={() => navigate('/onboardings/new')}
              className="gap-1.5 shrink-0"
            >
              <Plus size={16} aria-hidden="true" />
              New onboarding
            </Button>
          )}
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Users}
            iconBg="rgba(59,91,219,0.08)"
            iconColor="#3B5BDB"
            label="Active Onboardings"
            value={stats.activeCount}
            loading={allLoading}
          />
          <StatCard
            icon={CheckCircle2}
            iconBg="rgba(22,163,74,0.08)"
            iconColor="#16A34A"
            label="Completed This Month"
            value={stats.completedThisMonth}
            loading={allLoading}
          />
          <StatCard
            icon={TrendingUp}
            iconBg="rgba(14,165,233,0.08)"
            iconColor="#0EA5E9"
            label="On Track (≥50%)"
            value={stats.onTrack}
            loading={allLoading}
          />
          <StatCard
            icon={AlertTriangle}
            iconBg="rgba(217,119,6,0.08)"
            iconColor="#D97706"
            label="Need Attention"
            value={stats.needAttention}
            loading={allLoading}
          />
        </div>

        {/* ── Main two-column layout ── */}
        <div className="flex gap-5 items-start mb-6">

          {/* Left — 65% table */}
          <div style={{ flex: '0 0 65%', minWidth: 0 }}>
            <ActiveOnboardingsTable
              data={tableRows}
              loading={activeLoading}
              isManager={isManager}
              navigate={navigate}
            />
          </div>

          {/* Right — 35% activity feed */}
          <div style={{ flex: '0 0 35%', minWidth: 0 }}>
            <ActivityFeed
              tasks={tasks}
              loading={tasksLoading || (!anchorId && activeLoading)}
            />
          </div>
        </div>

        {/* ── Quick actions (HR / admin only) ── */}
        {isHR && (
          <div>
            <p
              className="text-[12px] font-semibold uppercase tracking-wide mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              Quick Actions
            </p>
            <div className="grid grid-cols-3 gap-4">
              <QuickActionCard
                icon={Plus}
                iconBg="rgba(59,91,219,0.08)"
                iconColor="#3B5BDB"
                label="New Onboarding"
                onClick={() => navigate('/onboardings/new')}
              />
              <QuickActionCard
                icon={FileText}
                iconBg="rgba(14,165,233,0.08)"
                iconColor="#0EA5E9"
                label="New Template"
                onClick={() => navigate('/templates/new')}
              />
              <QuickActionCard
                icon={UserPlus}
                iconBg="rgba(22,163,74,0.08)"
                iconColor="#16A34A"
                label="Invite Team Member"
                onClick={() => navigate('/people')}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
