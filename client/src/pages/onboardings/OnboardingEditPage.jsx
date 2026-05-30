import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft,
  Lock,
  AlertTriangle,
  User,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { format, parseISO } from 'date-fns'
import { onboardingsApi, usersApi } from '../../api/onboardings'
import useAuthStore from '../../stores/authStore'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Avatar from '../../components/onboardings/Avatar'

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

const schema = z.object({
  newHireName: z.string().min(1, 'Name is required').max(80, 'Max 80 characters'),
  newHireEmail: z.string().min(1, 'Email is required').email('Enter a valid email'),
  job: z.string().max(100, 'Max 100 characters').optional(),
})

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmtDate(d) {
  if (!d) return '—'
  try { return format(typeof d === 'string' ? parseISO(d) : new Date(d), 'MMM d, yyyy') } catch { return '—' }
}

// ─────────────────────────────────────────────────────────────────────────────
// Read-only field
// ─────────────────────────────────────────────────────────────────────────────

function ReadOnlyField({ label, value, children }) {
  return (
    <div>
      <label className="block text-[13px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
        {label}
      </label>
      <div
        className="flex items-center gap-2 h-[36px] px-3 rounded-[6px] border text-[14px]"
        style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
      >
        {children ?? <span>{value}</span>}
        <Lock size={12} className="ml-auto shrink-0" style={{ color: 'var(--text-secondary)' }} aria-hidden="true" />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Manager picker (graceful degradation)
// ─────────────────────────────────────────────────────────────────────────────

function ManagerPicker({ value, onChange }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['managers'],
    queryFn: () => usersApi.listManagers().then((r) => r.data),
    retry: 1,
  })

  const managers = data?.data ?? []

  if (isLoading) {
    return (
      <div className="h-[36px] rounded-[6px] border animate-pulse" style={{ backgroundColor: 'var(--border-color)', borderColor: 'var(--border-color)' }} />
    )
  }

  if (isError || managers.length === 0) {
    return (
      <div
        className="flex items-center gap-2 h-[36px] px-3 rounded-[6px] border text-[13px]"
        style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
      >
        <User size={13} aria-hidden="true" />
        No users found. Org default will be used.
      </div>
    )
  }

  return (
    <div className="relative">
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        aria-label="Select manager"
        className="w-full h-[36px] rounded-[6px] border px-3 pr-8 text-[14px] cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
      >
        <option value="">Select a manager…</option>
        {managers.map((m) => (
          <option key={m.id} value={m.id}>{m.name || m.email}</option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-secondary)' }} aria-hidden="true" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Department user picker
// ─────────────────────────────────────────────────────────────────────────────

function DeptUserPicker({ dept, value, onChange }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['users', dept],
    queryFn: () => usersApi.listByDepartment(dept).then((r) => r.data),
    retry: 1,
  })

  const users = data?.data ?? []

  if (isLoading) {
    return <div className="h-[36px] rounded-[6px] border animate-pulse" style={{ backgroundColor: 'var(--border-color)', borderColor: 'var(--border-color)' }} />
  }

  if (isError || users.length === 0) {
    return (
      <div
        className="flex items-center gap-2 h-[36px] px-3 rounded-[6px] border text-[13px]"
        style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
      >
        <User size={13} aria-hidden="true" />
        No users found. Org default will be used.
      </div>
    )
  }

  return (
    <div className="relative">
      <select
        value={value ?? ''}
        onChange={(e) => onChange(dept, e.target.value || null)}
        aria-label={`Select ${DEPT_LABELS[dept] ?? dept} assignee`}
        className="w-full h-[36px] rounded-[6px] border px-3 pr-8 text-[14px] cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
      >
        <option value="">Select a team member…</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>{u.name || u.email}</option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-secondary)' }} aria-hidden="true" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Confirm changes dialog
// ─────────────────────────────────────────────────────────────────────────────

function ConfirmDialog({ original, updated, managerId, deptAssignments, onConfirm, onCancel, isLoading }) {
  const changes = []

  if (updated.newHireName !== original.newHireName) {
    changes.push({ label: 'Name', from: original.newHireName, to: updated.newHireName })
  }
  if (updated.newHireEmail !== original.newHireEmail) {
    changes.push({ label: 'Email', from: original.newHireEmail || original.email, to: updated.newHireEmail })
  }
  if (updated.job !== (original.job ?? original.jobTitle ?? '')) {
    changes.push({ label: 'Job title', from: original.job ?? original.jobTitle ?? '—', to: updated.job || '—' })
  }
  if (!original.managerId && managerId) {
    changes.push({ label: 'Manager', from: 'Unassigned', to: managerId })
  }
  for (const [dept, userId] of Object.entries(deptAssignments)) {
    if (userId) {
      changes.push({ label: `${DEPT_LABELS[dept] ?? dept} tasks`, from: 'Unassigned', to: userId })
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dlg-title"
    >
      <div
        className="w-full max-w-md rounded-[12px] p-6 space-y-4"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }}
      >
        <h2 id="confirm-dlg-title" className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          Confirm changes to {original.newHireName}&apos;s onboarding
        </h2>

        {changes.length === 0 ? (
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>No changes detected.</p>
        ) : (
          <ul className="space-y-2">
            {changes.map((c, i) => (
              <li key={i} className="text-[13px] flex gap-1.5 flex-wrap">
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{c.label}:</span>
                <span style={{ color: 'var(--text-secondary)' }}>{c.from}</span>
                <span style={{ color: 'var(--text-secondary)' }}>→</span>
                <span className="font-medium" style={{ color: 'var(--color-primary)' }}>{c.to}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            loading={isLoading}
            disabled={changes.length === 0}
          >
            Confirm changes
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section wrapper
// ─────────────────────────────────────────────────────────────────────────────

function Section({ title, subtitle, children }) {
  return (
    <div
      className="rounded-[10px] border p-5"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        {subtitle && <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// OnboardingEditPage
// ─────────────────────────────────────────────────────────────────────────────

export default function OnboardingEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const isHR = user?.role === 'hr' || user?.role === 'admin'

  const [managerId, setManagerId] = useState(null)
  const [deptAssignments, setDeptAssignments] = useState({})
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingValues, setPendingValues] = useState(null)

  // ── Query ─────────────────────────────────────────────────────────────────
  const { data: onboardingData, isLoading, isError } = useQuery({
    queryKey: ['onboarding', id],
    queryFn: () => onboardingsApi.get(id).then((r) => r.data),
  })

  const onboarding = onboardingData?.data ?? onboardingData ?? null

  // ── Form ──────────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (onboarding) {
      reset({
        newHireName: onboarding.newHireName ?? '',
        newHireEmail: onboarding.newHireEmail ?? onboarding.email ?? '',
        job: onboarding.job ?? onboarding.jobTitle ?? '',
      })
      setManagerId(onboarding.managerId ?? null)
    }
  }, [onboarding, reset])

  // Collect unassigned departments from tasks
  const unassignedDepts = (() => {
    if (!onboarding?.warnings?.hasUnassignedTasks) return []
    const tasks = onboarding.tasks ?? []
    const seen = new Set()
    const depts = []
    for (const t of tasks) {
      if (!t.assigneeUserId && t.assigneeDepartment && !seen.has(t.assigneeDepartment)) {
        seen.add(t.assigneeDepartment)
        depts.push(t.assigneeDepartment)
      }
    }
    return depts
  })()

  function handleDeptChange(dept, userId) {
    setDeptAssignments((prev) => ({ ...prev, [dept]: userId }))
  }

  // ── Save mutation ─────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (payload) => onboardingsApi.update(id, payload),
    onSuccess: () => {
      toast.success('Onboarding updated')
      setShowConfirm(false)
      queryClient.invalidateQueries({ queryKey: ['onboarding', id] })
      queryClient.invalidateQueries({ queryKey: ['onboardings'] })
      navigate(`/onboardings/${id}`)
    },
    onError: (err) => {
      const msg = err?.response?.data?.message
      toast.error(msg || 'Failed to save changes')
    },
  })

  function onSubmit(values) {
    setPendingValues(values)
    setShowConfirm(true)
  }

  function handleConfirm() {
    const payload = {
      newHireName: pendingValues.newHireName,
      newHireEmail: pendingValues.newHireEmail,
      job: pendingValues.job,
    }
    if (!onboarding.managerId && managerId) {
      payload.managerId = managerId
    }
    const deptPayload = {}
    for (const [dept, userId] of Object.entries(deptAssignments)) {
      if (userId) deptPayload[dept] = userId
    }
    if (Object.keys(deptPayload).length > 0) {
      payload.departmentAssignments = deptPayload
    }
    saveMutation.mutate(payload)
  }

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!isHR) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-app)' }}>
        <div className="text-center">
          <Lock size={32} className="mx-auto mb-3" style={{ color: 'var(--text-secondary)' }} aria-hidden="true" />
          <p className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>
            You don&apos;t have permission to edit onboardings.
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen px-6 py-8" style={{ backgroundColor: 'var(--bg-app)' }}>
        <div className="mx-auto w-full max-w-[680px] space-y-4 animate-pulse">
          {[200, 160, 140].map((h, i) => (
            <div key={i} className="rounded-[10px] border" style={{ height: h, backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }} />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !onboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-app)' }}>
        <div className="text-center">
          <AlertCircle size={32} className="mx-auto mb-3" style={{ color: '#dc2626' }} aria-hidden="true" />
          <p className="text-[15px] font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Failed to load onboarding</p>
          <Button variant="secondary" onClick={() => navigate('/onboardings')}>Back</Button>
        </div>
      </div>
    )
  }

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

      {showConfirm && pendingValues && (
        <ConfirmDialog
          original={onboarding}
          updated={pendingValues}
          managerId={managerId}
          deptAssignments={deptAssignments}
          isLoading={saveMutation.isPending}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <div className="min-h-screen px-6 py-8" style={{ backgroundColor: 'var(--bg-app)' }}>
        <div className="mx-auto w-full max-w-[680px]">

          {/* Back */}
          <Link
            to={`/onboardings/${id}`}
            className="inline-flex items-center gap-1.5 text-[13px] mb-6 cursor-pointer hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Back to {onboarding.newHireName}
          </Link>

          {/* Page title */}
          <div className="mb-6">
            <h1 className="text-[22px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              Edit Onboarding
            </h1>
            <p className="text-[14px] mt-1" style={{ color: 'var(--text-secondary)' }}>
              Updating {onboarding.newHireName}&apos;s onboarding details
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

            {/* Section 1 — Basic Info */}
            <Section title="Basic Info">
              <div className="space-y-3">
                <Input
                  id="newHireName"
                  label="Full name *"
                  placeholder="Jane Smith"
                  error={errors.newHireName?.message}
                  {...register('newHireName')}
                />
                <Input
                  id="newHireEmail"
                  label="Work email *"
                  type="email"
                  placeholder="jane@company.com"
                  error={errors.newHireEmail?.message}
                  {...register('newHireEmail')}
                />
                <Input
                  id="job"
                  label="Job title"
                  placeholder="e.g. Software Engineer"
                  error={errors.job?.message}
                  {...register('job')}
                />
              </div>
            </Section>

            {/* Section 2 — Template & Start Date (read-only) */}
            <Section
              title="Template & Start Date"
              subtitle="These cannot be changed after an onboarding is created."
            >
              <div className="space-y-3">
                <ReadOnlyField label="Template">
                  <span>{onboarding.templateName || '—'}</span>
                </ReadOnlyField>
                <ReadOnlyField label="Start date">
                  <span>{fmtDate(onboarding.startDate)}</span>
                </ReadOnlyField>
              </div>
            </Section>

            {/* Section 3 — Manager Assignment */}
            <Section title="Manager Assignment">
              {onboarding.managerId ? (
                <ReadOnlyField label="Manager">
                  <Avatar name={onboarding.managerName || 'Manager'} size={20} />
                  <span>{onboarding.managerName || 'Assigned'}</span>
                </ReadOnlyField>
              ) : (
                <>
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-[8px] mb-3 text-[13px]"
                    style={{ backgroundColor: 'rgba(217,119,6,0.08)', color: '#d97706' }}
                    role="alert"
                  >
                    <AlertTriangle size={14} aria-hidden="true" />
                    No manager has been assigned. Assign one below.
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      Manager
                    </label>
                    <ManagerPicker value={managerId} onChange={setManagerId} />
                  </div>
                </>
              )}
            </Section>

            {/* Section 4 — Unassigned Department Roles */}
            {unassignedDepts.length > 0 && (
              <Section
                title="Unassigned Department Roles"
                subtitle="Assign team members to unassigned task departments."
              >
                <div className="space-y-4">
                  {unassignedDepts.map((dept) => (
                    <div key={dept}>
                      <label className="block text-[13px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        {DEPT_LABELS[dept] ?? dept} Tasks
                      </label>
                      <DeptUserPicker
                        dept={dept}
                        value={deptAssignments[dept] ?? null}
                        onChange={handleDeptChange}
                      />
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Footer actions */}
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/onboardings/${id}`)}
              >
                Cancel
              </Button>
              <Button type="submit" className="gap-1.5">
                <CheckCircle2 size={15} aria-hidden="true" />
                Review changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
