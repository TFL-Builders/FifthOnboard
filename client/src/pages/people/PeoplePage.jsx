import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  UserPlus,
  Eye,
  UserX,
  X,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import useAuthStore from '../../stores/authStore'
import Avatar from '../../components/onboardings/Avatar'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import { usersApi, invitesApi } from '../../api/users'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'hr', label: 'HR' },
  { value: 'manager', label: 'Manager' },
  { value: 'task_owner', label: 'Task Owner' },
  { value: 'employee', label: 'Employee' },
]

const DEPT_OPTIONS = [
  { value: '', label: 'All Departments' },
  { value: 'hr', label: 'HR' },
  { value: 'manager', label: 'Manager' },
  { value: 'it', label: 'IT' },
  { value: 'finance', label: 'Finance' },
  { value: 'custom', label: 'Custom' },
]

const INVITE_ROLE_OPTIONS = [
  { value: 'hr', label: 'HR' },
  { value: 'manager', label: 'Manager' },
  { value: 'task_owner', label: 'Task Owner' },
  { value: 'employee', label: 'Employee' },
]

const INVITE_DEPT_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'hr', label: 'HR' },
  { value: 'manager', label: 'Manager' },
  { value: 'it', label: 'IT' },
  { value: 'finance', label: 'Finance' },
  { value: 'custom', label: 'Custom' },
]

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function roleLabelOf(role) {
  const map = { admin: 'Admin', hr: 'HR', manager: 'Manager', task_owner: 'Task Owner', employee: 'Employee' }
  return map[role] ?? role
}

function deptLabelOf(dept) {
  if (!dept) return '—'
  const map = { hr: 'HR', manager: 'Manager', it: 'IT', finance: 'Finance', custom: 'Custom' }
  return map[dept] ?? dept
}

function safeDate(val) {
  if (!val) return null
  try { return typeof val === 'string' ? parseISO(val) : new Date(val) } catch { return null }
}

function fmtDate(val) {
  const d = safeDate(val)
  return d ? format(d, 'MMM d, yyyy') : '—'
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

function SelectFilter({ value, onChange, options, label }) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none h-9 pl-3 pr-8 rounded-[6px] border text-[13px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
        }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }} />
        </svg>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Disable Dialog
// ─────────────────────────────────────────────────────────────────────────────

function DisableDialog({ member, onClose, onSuccess }) {
  const queryClient = useQueryClient()
  const [reassignChoice, setReassignChoice] = useState(null)

  const { data: previewData, isLoading: previewLoading } = useQuery({
    queryKey: ['disable-preview', member.id],
    queryFn: () => usersApi.getDisablePreview(member.id).then(r => r.data.data),
    staleTime: 0,
  })

  const { data: pickerData, isLoading: pickerLoading } = useQuery({
    queryKey: ['users-picker', member.department],
    queryFn: () => usersApi.listPicker({ department: member.department || undefined }).then(r => r.data.data),
    enabled: !!previewData && previewData.totalTaskCount > 0,
    staleTime: 30_000,
  })

  const disableMutation = useMutation({
    mutationFn: () => {
      const reassignTo = reassignChoice === 'UNASSIGNED' ? null : reassignChoice
      return usersApi.disable(member.id, { reassignTo }).then(r => r.data.data)
    },
    onSuccess: (data) => {
      if (data.reassigned) {
        toast.success(`${member.name} disabled. ${data.tasksResolved} tasks reassigned.`)
      } else {
        toast.success(
          data.tasksAffected > 0
            ? `${member.name} disabled. ${data.tasksAffected} tasks left unassigned across ${data.onboardingsAffected} onboardings.`
            : `${member.name} has been disabled.`
        )
      }
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onSuccess?.()
      onClose()
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error ?? 'Failed to disable account.')
    },
  })

  const taskCount = previewData?.totalTaskCount ?? 0
  const onboardingCount = previewData?.affectedOnboardings?.length ?? 0
  const pickerUsers = (pickerData ?? []).filter(u => u.id !== member.id)

  // button enabled when: no tasks, or a choice has been made
  const canConfirm = previewData && (taskCount === 0 || reassignChoice !== null)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="disable-dialog-title"
    >
      <div
        className="w-full max-w-md rounded-[10px] border shadow-xl overflow-hidden"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-[8px]"
              style={{ backgroundColor: 'rgba(220,38,38,0.10)' }}
            >
              <UserX size={17} aria-hidden="true" style={{ color: '#DC2626' }} />
            </div>
            <div>
              <h2 id="disable-dialog-title" className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                Disable Account
              </h2>
              <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                {member.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 items-center justify-center rounded-[6px] cursor-pointer transition-colors hover:bg-black/[0.06] dark:hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X size={16} aria-hidden="true" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {previewLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="default" className="text-primary" />
            </div>
          ) : (
            <>
              {taskCount === 0 ? (
                <p className="text-[14px]" style={{ color: 'var(--text-primary)' }}>
                  This member has no pending tasks.{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>Disable their account?</span>
                </p>
              ) : (
                <>
                  <p className="text-[14px] mb-4" style={{ color: 'var(--text-primary)' }}>
                    <span className="font-semibold">{member.name}</span> has{' '}
                    <span className="font-semibold">{taskCount}</span> unassigned{' '}
                    {taskCount === 1 ? 'task' : 'tasks'} across{' '}
                    <span className="font-semibold">{onboardingCount}</span>{' '}
                    {onboardingCount === 1 ? 'onboarding' : 'onboardings'}.
                  </p>

                  <p className="text-[12px] font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                    REASSIGN THEIR TASKS TO:
                  </p>

                  <div
                    className="rounded-[8px] border overflow-hidden"
                    style={{ borderColor: 'var(--border-color)', maxHeight: 220, overflowY: 'auto' }}
                  >
                    {/* Leave unassigned option */}
                    <button
                      onClick={() => setReassignChoice('UNASSIGNED')}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left cursor-pointer transition-colors"
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: reassignChoice === 'UNASSIGNED'
                          ? 'rgba(59,91,219,0.06)'
                          : 'var(--bg-card)',
                      }}
                      onMouseEnter={e => {
                        if (reassignChoice !== 'UNASSIGNED') e.currentTarget.style.backgroundColor = 'var(--bg-app)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = reassignChoice === 'UNASSIGNED'
                          ? 'rgba(59,91,219,0.06)'
                          : 'var(--bg-card)'
                      }}
                    >
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-full shrink-0 text-[11px] font-semibold"
                        style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                        aria-hidden="true"
                      >
                        —
                      </div>
                      <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                        Leave unassigned
                      </span>
                      {reassignChoice === 'UNASSIGNED' && (
                        <span
                          className="ml-auto text-[11px] font-semibold"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          Selected
                        </span>
                      )}
                    </button>

                    {/* User list */}
                    {pickerLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Spinner size="sm" className="text-primary" />
                      </div>
                    ) : pickerUsers.length === 0 ? (
                      <div className="px-3 py-4 text-center">
                        <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                          No other active members in this department
                        </p>
                      </div>
                    ) : (
                      pickerUsers.map(u => (
                        <button
                          key={u.id}
                          onClick={() => setReassignChoice(u.id)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-left cursor-pointer transition-colors"
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            backgroundColor: reassignChoice === u.id
                              ? 'rgba(59,91,219,0.06)'
                              : 'var(--bg-card)',
                          }}
                          onMouseEnter={e => {
                            if (reassignChoice !== u.id) e.currentTarget.style.backgroundColor = 'var(--bg-app)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = reassignChoice === u.id
                              ? 'rgba(59,91,219,0.06)'
                              : 'var(--bg-card)'
                          }}
                        >
                          <Avatar name={u.name} avatarColor={u.avatarColor} size={28} />
                          <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                            {u.name}
                          </span>
                          {reassignChoice === u.id && (
                            <span
                              className="ml-auto text-[11px] font-semibold"
                              style={{ color: 'var(--color-primary)' }}
                            >
                              Selected
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Warning when leaving unassigned */}
                  {reassignChoice === 'UNASSIGNED' && (
                    <div
                      className="flex items-start gap-2 mt-3 px-3 py-2.5 rounded-[6px]"
                      style={{ backgroundColor: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.20)' }}
                    >
                      <AlertTriangle size={14} aria-hidden="true" style={{ color: '#B45309', marginTop: 1, flexShrink: 0 }} />
                      <p className="text-[12px]" style={{ color: '#92400E' }}>
                        Warnings will appear on{' '}
                        <span className="font-semibold">{onboardingCount}</span>{' '}
                        {onboardingCount === 1 ? 'onboarding' : 'onboardings'} due to unassigned tasks.
                      </p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-5 py-4"
          style={{ borderTop: '1px solid var(--border-color)' }}
        >
          <Button variant="secondary" onClick={onClose} disabled={disableMutation.isPending}>
            Cancel
          </Button>
          <button
            onClick={() => disableMutation.mutate()}
            disabled={!canConfirm || disableMutation.isPending}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-[6px] text-[13px] font-semibold cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: canConfirm && !disableMutation.isPending ? '#DC2626' : undefined,
              color: '#fff',
              '--tw-ring-color': '#DC2626',
            }}
          >
            {disableMutation.isPending && <Spinner size="sm" />}
            Disable account
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Invite Modal
// ─────────────────────────────────────────────────────────────────────────────

function InviteModal({ onClose }) {
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [department, setDepartment] = useState('')
  const [errors, setErrors] = useState({})

  const sendMutation = useMutation({
    mutationFn: () => invitesApi.send({ email, role, department: department || undefined }),
    onSuccess: () => {
      toast.success(`Invite sent to ${email}`)
      queryClient.invalidateQueries({ queryKey: ['invites'] })
      onClose()
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error ?? 'Failed to send invite.')
    },
  })

  function validate() {
    const e = {}
    if (!email) e.email = 'Work email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address.'
    if (!role) e.role = 'Role is required.'
    return e
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setErrors({})
    sendMutation.mutate()
  }

  const inputBase = {
    height: 36,
    borderRadius: 6,
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-app)',
    color: 'var(--text-primary)',
    fontSize: 13,
    padding: '0 12px',
    width: '100%',
    outline: 'none',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-modal-title"
    >
      <div
        className="w-full max-w-[420px] rounded-[10px] border shadow-xl overflow-hidden"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-[8px]"
              style={{ backgroundColor: 'rgba(59,91,219,0.10)' }}
            >
              <UserPlus size={17} aria-hidden="true" style={{ color: '#3B5BDB' }} />
            </div>
            <div>
              <h2 id="invite-modal-title" className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                Invite member
              </h2>
              <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                Send an invite link to their work email
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 items-center justify-center rounded-[6px] cursor-pointer transition-colors hover:bg-black/[0.06] dark:hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X size={16} aria-hidden="true" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="px-5 py-4 space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="invite-email"
                className="block text-[12px] font-medium mb-1.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                Work email <span aria-hidden="true" style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                id="invite-email"
                type="email"
                autoComplete="off"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'invite-email-err' : undefined}
                style={{
                  ...inputBase,
                  borderColor: errors.email ? '#DC2626' : 'var(--border-color)',
                }}
                onFocus={e => { e.target.style.borderColor = '#3B5BDB'; e.target.style.boxShadow = '0 0 0 3px rgba(59,91,219,0.12)' }}
                onBlur={e => { e.target.style.borderColor = errors.email ? '#DC2626' : 'var(--border-color)'; e.target.style.boxShadow = 'none' }}
              />
              {errors.email && (
                <p id="invite-email-err" className="text-[11px] mt-1" style={{ color: '#DC2626' }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label
                htmlFor="invite-role"
                className="block text-[12px] font-medium mb-1.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                Role <span aria-hidden="true" style={{ color: '#DC2626' }}>*</span>
              </label>
              <div className="relative">
                <select
                  id="invite-role"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  aria-invalid={!!errors.role}
                  aria-describedby={errors.role ? 'invite-role-err' : undefined}
                  className="appearance-none w-full h-9 pl-3 pr-8 rounded-[6px] border text-[13px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    borderColor: errors.role ? '#DC2626' : 'var(--border-color)',
                    color: role ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                >
                  <option value="">Select a role…</option>
                  {INVITE_ROLE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }} />
                  </svg>
                </div>
              </div>
              {errors.role && (
                <p id="invite-role-err" className="text-[11px] mt-1" style={{ color: '#DC2626' }}>
                  {errors.role}
                </p>
              )}
            </div>

            {/* Department */}
            <div>
              <label
                htmlFor="invite-dept"
                className="block text-[12px] font-medium mb-1.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                Department
              </label>
              <div className="relative">
                <select
                  id="invite-dept"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="appearance-none w-full h-9 pl-3 pr-8 rounded-[6px] border text-[13px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {INVITE_DEPT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }} />
                  </svg>
                </div>
              </div>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                Used to assign tasks to this person
              </p>
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-end gap-3 px-5 py-4"
            style={{ borderTop: '1px solid var(--border-color)' }}
          >
            <Button variant="secondary" type="button" onClick={onClose} disabled={sendMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={sendMutation.isPending}>
              Send invite
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Members Tab
// ─────────────────────────────────────────────────────────────────────────────

const TH = ['Member', 'Role', 'Department', 'Status', 'Actions']
const TH_NO_ACTIONS = ['Member', 'Role', 'Department', 'Status']

function MemberRowSkeleton({ hasActions }) {
  return (
    <tr className="animate-pulse" style={{ borderBottom: '1px solid var(--border-color)' }}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-full shrink-0" style={{ width: 36, height: 36, backgroundColor: 'var(--border-color)' }} />
          <div className="space-y-1.5">
            <Bone w={110} />
            <Bone w={140} h={11} />
          </div>
        </div>
      </td>
      <td className="px-4 py-3"><Bone w={70} h={20} className="rounded-full" /></td>
      <td className="px-4 py-3"><Bone w={64} /></td>
      <td className="px-4 py-3"><Bone w={56} h={20} className="rounded-full" /></td>
      {hasActions && (
        <td className="px-4 py-3">
          <div className="flex gap-2">
            <Bone w={28} h={28} className="rounded-[6px]" />
            <Bone w={28} h={28} className="rounded-[6px]" />
          </div>
        </td>
      )}
    </tr>
  )
}

function MemberRow({ member, isHR, onView, onDisable }) {
  const navigate = useNavigate()

  function handleRowClick() {
    if (isHR) navigate(`/people/${member.id}`)
  }

  return (
    <tr
      onClick={handleRowClick}
      style={{ borderBottom: '1px solid var(--border-color)', cursor: isHR ? 'pointer' : 'default' }}
      onMouseEnter={e => { if (isHR) e.currentTarget.style.backgroundColor = 'var(--bg-app)' }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      {/* Member */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar name={member.name} avatarColor={member.avatarColor} size={36} />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {member.name}
            </p>
            <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
              {member.email}
            </p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-4 py-3">
        <RoleBadge role={member.role} />
      </td>

      {/* Department */}
      <td className="px-4 py-3">
        <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          {deptLabelOf(member.department)}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusChip status={member.status} />
      </td>

      {/* Actions — HR/admin only */}
      {isHR && (
        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onView(member)}
              aria-label={`View tasks for ${member.name}`}
              title="View tasks"
              className="flex h-7 w-7 items-center justify-center rounded-[6px] cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style={{ border: '1px solid var(--border-color)' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-app)' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <Eye size={14} aria-hidden="true" style={{ color: 'var(--text-secondary)' }} />
            </button>
            {member.status !== 'disabled' && (
              <button
                onClick={() => onDisable(member)}
                aria-label={`Disable ${member.name}`}
                title="Disable account"
                className="flex h-7 w-7 items-center justify-center rounded-[6px] cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                style={{ border: '1px solid rgba(220,38,38,0.30)', '--tw-ring-color': '#DC2626' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <UserX size={14} aria-hidden="true" style={{ color: '#DC2626' }} />
              </button>
            )}
          </div>
        </td>
      )}
    </tr>
  )
}

function MembersTab({ isHR }) {
  const navigate = useNavigate()
  const [search, setSearch]   = useState('')
  const [roleFilter, setRoleFilter]   = useState('')
  const [deptFilter, setDeptFilter]   = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [disableMember, setDisableMember] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['users', statusFilter],
    queryFn: () => usersApi.list({ status: statusFilter }).then(r => r.data.data),
    staleTime: 30_000,
  })

  const members = useMemo(() => {
    let list = data ?? []
    if (roleFilter) list = list.filter(m => m.role === roleFilter)
    if (deptFilter) list = list.filter(m => m.department === deptFilter)
    if (search.trim()) {
      try {
        const re = new RegExp(search.trim(), 'i')
        list = list.filter(m => re.test(m.name))
      } catch {
        // invalid regex — fall back to simple substring
        const q = search.trim().toLowerCase()
        list = list.filter(m => m.name.toLowerCase().includes(q))
      }
    }
    return list
  }, [data, roleFilter, deptFilter, search])

  const isFiltered = search || roleFilter || deptFilter || statusFilter !== 'active'

  function resetFilters() {
    setSearch('')
    setRoleFilter('')
    setDeptFilter('')
    setStatusFilter('active')
  }

  const cols = isHR ? TH : TH_NO_ACTIONS

  return (
    <>
      {/* Filters */}
      <div
        className="flex flex-wrap items-center gap-2.5 px-4 py-3"
        style={{ borderBottom: '1px solid var(--border-color)' }}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-[280px]">
          <svg
            width="14" height="14"
            viewBox="0 0 24 24" fill="none" strokeWidth="2"
            stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-secondary)' }}
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name…"
            aria-label="Search members by name"
            className="w-full h-9 pl-8 pr-3 rounded-[6px] border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        <SelectFilter value={roleFilter} onChange={setRoleFilter} options={ROLE_OPTIONS} label="Filter by role" />
        <SelectFilter value={deptFilter} onChange={setDeptFilter} options={DEPT_OPTIONS} label="Filter by department" />

        {/* Status toggle */}
        <div
          className="flex rounded-[6px] border overflow-hidden"
          style={{ borderColor: 'var(--border-color)' }}
          role="group"
          aria-label="Status filter"
        >
          {['active', 'disabled'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="h-9 px-3.5 text-[12px] font-medium cursor-pointer transition-colors capitalize"
              style={{
                backgroundColor: statusFilter === s ? '#3B5BDB' : 'var(--bg-card)',
                color: statusFilter === s ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Reset */}
        {isFiltered && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 h-9 px-3 rounded-[6px] text-[12px] font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{ color: 'var(--color-primary)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(59,91,219,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <RotateCcw size={12} aria-hidden="true" />
            Reset
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              {cols.map(col => (
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
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <MemberRowSkeleton key={i} hasActions={isHR} />
            ))}

            {!isLoading && members.length === 0 && (
              <tr>
                <td colSpan={cols.length}>
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-[8px] mb-3"
                      style={{ backgroundColor: 'rgba(59,91,219,0.08)' }}
                    >
                      <UserPlus size={20} aria-hidden="true" style={{ color: '#3B5BDB' }} />
                    </div>
                    <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                      No members found
                    </p>
                    {isFiltered && (
                      <button
                        onClick={resetFilters}
                        className="mt-2 text-[12px] cursor-pointer transition-opacity hover:opacity-70"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && members.map(m => (
              <MemberRow
                key={m.id}
                member={m}
                isHR={isHR}
                onView={() => navigate(`/people/${m.id}`)}
                onDisable={() => setDisableMember(m)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Disable dialog */}
      {disableMember && (
        <DisableDialog
          member={disableMember}
          onClose={() => setDisableMember(null)}
        />
      )}
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Invites Tab
// ─────────────────────────────────────────────────────────────────────────────

function InviteRowSkeleton() {
  return (
    <tr className="animate-pulse" style={{ borderBottom: '1px solid var(--border-color)' }}>
      <td className="px-4 py-3"><Bone w={160} /></td>
      <td className="px-4 py-3"><Bone w={64} h={20} className="rounded-full" /></td>
      <td className="px-4 py-3"><Bone w={56} /></td>
      <td className="px-4 py-3"><Bone w={80} /></td>
      <td className="px-4 py-3"><Bone w={80} /></td>
      <td className="px-4 py-3"><Bone w={28} h={28} className="rounded-[6px]" /></td>
    </tr>
  )
}

const INVITE_TH = ['Email', 'Role', 'Department', 'Invited', 'Expires', 'Actions']

function InvitesTab() {
  const queryClient = useQueryClient()
  const [revokeTarget, setRevokeTarget] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['invites'],
    queryFn: () => invitesApi.list().then(r => r.data.data),
    staleTime: 30_000,
  })

  const revokeMutation = useMutation({
    mutationFn: (id) => invitesApi.revoke(id),
    onSuccess: (_, id) => {
      const invite = (data ?? []).find(i => i.id === id)
      toast.success(`Invite for ${invite?.email ?? 'member'} revoked.`)
      queryClient.invalidateQueries({ queryKey: ['invites'] })
      setRevokeTarget(null)
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error ?? 'Failed to revoke invite.')
    },
  })

  const invites = data ?? []

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              {INVITE_TH.map(col => (
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
            {isLoading && Array.from({ length: 3 }).map((_, i) => <InviteRowSkeleton key={i} />)}

            {!isLoading && invites.length === 0 && (
              <tr>
                <td colSpan={INVITE_TH.length}>
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-[8px] mb-3"
                      style={{ backgroundColor: 'rgba(59,91,219,0.08)' }}
                    >
                      <UserPlus size={20} aria-hidden="true" style={{ color: '#3B5BDB' }} />
                    </div>
                    <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                      No pending invites
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && invites.map(inv => (
              <tr
                key={inv.id}
                style={{ borderBottom: '1px solid var(--border-color)' }}
              >
                <td className="px-4 py-3">
                  <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{inv.email}</span>
                </td>
                <td className="px-4 py-3">
                  <RoleBadge role={inv.role} />
                </td>
                <td className="px-4 py-3">
                  <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                    {deptLabelOf(inv.department)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                    {fmtDate(inv.createdAt)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                    {fmtDate(inv.expiresAt)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {revokeTarget === inv.id ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                        Revoke invite for <strong>{inv.email}</strong>?
                      </span>
                      <button
                        onClick={() => revokeMutation.mutate(inv.id)}
                        disabled={revokeMutation.isPending}
                        className="text-[11px] font-semibold cursor-pointer transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50"
                        style={{ color: '#DC2626' }}
                      >
                        {revokeMutation.isPending ? '…' : 'Yes'}
                      </button>
                      <button
                        onClick={() => setRevokeTarget(null)}
                        className="text-[11px] cursor-pointer transition-opacity hover:opacity-70"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRevokeTarget(inv.id)}
                      aria-label={`Revoke invite for ${inv.email}`}
                      title="Revoke invite"
                      className="flex h-7 w-7 items-center justify-center rounded-[6px] cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                      style={{ border: '1px solid rgba(220,38,38,0.30)', '--tw-ring-color': '#DC2626' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.06)' }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                    >
                      <X size={13} aria-hidden="true" style={{ color: '#DC2626' }} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PeoplePage
// ─────────────────────────────────────────────────────────────────────────────

export default function PeoplePage() {
  const user   = useAuthStore(s => s.user)
  const isHR   = ['hr', 'admin'].includes(user?.role)
  const [activeTab, setActiveTab] = useState('members')
  const [showInvite, setShowInvite] = useState(false)

  const tabs = isHR
    ? [{ id: 'members', label: 'Members' }, { id: 'invites', label: 'Invites' }]
    : [{ id: 'members', label: 'Members' }]

  return (
    <div className="min-h-screen px-6 py-8" style={{ backgroundColor: 'var(--bg-app)' }}>
      <div className="mx-auto w-full max-w-[1280px]">

        {/* Page header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-[24px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
              People
            </h1>
            <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>
              Manage your team members and pending invites
            </p>
          </div>
          {isHR && (
            <Button onClick={() => setShowInvite(true)} className="gap-1.5 shrink-0">
              <UserPlus size={15} aria-hidden="true" />
              Invite member
            </Button>
          )}
        </div>

        {/* Card */}
        <div
          className="rounded-[8px] border overflow-hidden"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          {/* Tabs */}
          <div
            className="flex"
            style={{ borderBottom: '1px solid var(--border-color)' }}
            role="tablist"
            aria-label="People sections"
          >
            {tabs.map(tab => (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className="px-5 py-3 text-[13px] font-medium cursor-pointer transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                style={{ color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--text-secondary)' }}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                    aria-hidden="true"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab panels */}
          <div
            role="tabpanel"
            id="tabpanel-members"
            aria-labelledby="tab-members"
            hidden={activeTab !== 'members'}
          >
            <MembersTab isHR={isHR} />
          </div>

          {isHR && (
            <div
              role="tabpanel"
              id="tabpanel-invites"
              aria-labelledby="tab-invites"
              hidden={activeTab !== 'invites'}
            >
              <InvitesTab />
            </div>
          )}
        </div>
      </div>

      {/* Invite modal */}
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </div>
  )
}
