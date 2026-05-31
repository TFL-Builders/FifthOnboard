import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Check,
  ChevronRight,
  ChevronLeft,
  FileText,
  Users,
  CalendarDays,
  Copy,
  ExternalLink,
  AlertTriangle,
  Rocket,
  UserCheck,
  ClipboardList,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { format, parseISO, isAfter, startOfDay } from 'date-fns'
import { onboardingsApi } from '../../api/onboardings'
import { getTemplatesForWizard, getTemplateDepartments } from '../../api/templates'
import useAuthStore from '../../stores/authStore'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}

const AVATAR_COLORS = [
  '#3b5bdb','#1098ad','#0ca678','#f59f00','#e64980','#7950f2','#f76707','#2f9e44',
]

function avatarColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function Avatar({ name, size = 30, color }) {
  const bg = color || avatarColor(name || '')
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
      {getInitials(name || '')}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Zod schema — Step 1
// ─────────────────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(80, 'Max 80 characters'),
  workEmail: z.string().min(1, 'Work email is required').email('Enter a valid email'),
  jobTitle: z.string().max(100, 'Max 100 characters').optional(),
})

// ─────────────────────────────────────────────────────────────────────────────
// Step indicator
// ─────────────────────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'New Hire Info', icon: UserCheck },
  { label: 'Choose Template', icon: ClipboardList },
  { label: 'Manager & Teams', icon: Users },
  { label: 'Start Date & Review', icon: CalendarDays },
]

function StepIndicator({ currentStep }) {
  return (
    <nav aria-label="Wizard steps" className="mb-8">
      <ol className="flex items-center gap-0">
        {STEPS.map((step, i) => {
          const done = i < currentStep
          const active = i === currentStep
          return (
            <li key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5 min-w-[72px]">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-200"
                  style={{
                    borderColor: done || active ? 'var(--color-primary)' : 'var(--border-color)',
                    backgroundColor: done
                      ? 'var(--color-primary)'
                      : active
                      ? 'rgba(59,91,219,0.08)'
                      : 'transparent',
                  }}
                  aria-current={active ? 'step' : undefined}
                >
                  {done ? (
                    <Check size={16} className="text-white" aria-hidden="true" />
                  ) : (
                    <span
                      className="text-[13px] font-semibold"
                      style={{ color: active ? 'var(--color-primary)' : 'var(--text-secondary)' }}
                    >
                      {i + 1}
                    </span>
                  )}
                </div>
                <span
                  className="text-[11px] font-medium text-center leading-tight hidden sm:block"
                  style={{
                    color: active
                      ? 'var(--color-primary)'
                      : done
                      ? 'var(--text-primary)'
                      : 'var(--text-secondary)',
                  }}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div
                  className="flex-1 h-[2px] mx-2 rounded-full transition-colors duration-200"
                  style={{
                    backgroundColor: i < currentStep ? 'var(--color-primary)' : 'var(--border-color)',
                  }}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Navigation footer
// ─────────────────────────────────────────────────────────────────────────────

function WizardNav({ step, totalSteps, onBack, onNext, nextDisabled, nextLabel = 'Next', isSubmitting }) {
  return (
    <div className="flex items-center justify-between mt-8 pt-5" style={{ borderTop: '1px solid var(--border-color)' }}>
      <Button
        variant="secondary"
        onClick={onBack}
        disabled={step === 0}
        className="gap-1.5"
      >
        <ChevronLeft size={15} aria-hidden="true" />
        Back
      </Button>
      <Button
        onClick={onNext}
        disabled={nextDisabled || isSubmitting}
        loading={isSubmitting}
        className="gap-1.5"
      >
        {nextLabel}
        {!isSubmitting && step < totalSteps - 1 && <ChevronRight size={15} aria-hidden="true" />}
      </Button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — New Hire Info
// ─────────────────────────────────────────────────────────────────────────────

function Step1({ data, onComplete }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: data,
  })

  return (
    <form onSubmit={handleSubmit(onComplete)} noValidate>
      <div className="space-y-4 max-w-lg">
        <Input
          id="fullName"
          label="Full name *"
          placeholder="Jane Smith"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <Input
          id="workEmail"
          label="Work email *"
          type="email"
          placeholder="jane@company.com"
          error={errors.workEmail?.message}
          {...register('workEmail')}
        />
        <Input
          id="jobTitle"
          label="Job title"
          placeholder="e.g. Software Engineer"
          helperText="Optional"
          error={errors.jobTitle?.message}
          {...register('jobTitle')}
        />
      </div>

      <div className="flex justify-end mt-8 pt-5" style={{ borderTop: '1px solid var(--border-color)' }}>
        <Button type="submit" className="gap-1.5">
          Next
          <ChevronRight size={15} aria-hidden="true" />
        </Button>
      </div>
    </form>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Choose Template
// ─────────────────────────────────────────────────────────────────────────────

function Step2({ selectedId, onSelect, onBack, onNext }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['templates', 'wizard'],
    queryFn: () => getTemplatesForWizard().then((r) => r.data),
  })

  const templates = data?.data ?? []
  const navigate = useNavigate()

  return (
    <div>
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[10px] border p-4 animate-pulse h-[90px]"
              style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
            >
              <div className="h-[14px] rounded mb-2" style={{ width: '60%', backgroundColor: 'var(--border-color)' }} />
              <div className="h-[11px] rounded" style={{ width: '40%', backgroundColor: 'var(--border-color)' }} />
            </div>
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <p className="text-[14px] text-center py-8" style={{ color: 'var(--text-secondary)' }}>
          Failed to load templates. Please refresh.
        </p>
      )}

      {!isLoading && !isError && templates.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <FileText size={32} className="mb-3" style={{ color: 'var(--border-color)' }} aria-hidden="true" />
          <p className="text-[14px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            No templates yet
          </p>
          <p className="text-[13px] mb-4" style={{ color: 'var(--text-secondary)' }}>
            Create one first to use in onboardings.
          </p>
          <Button variant="secondary" size="sm" onClick={() => navigate('/templates/new')} className="gap-1.5">
            <ExternalLink size={13} aria-hidden="true" />
            Create template
          </Button>
        </div>
      )}

      {!isLoading && !isError && templates.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map((t) => {
            const taskCount = t.taskCount ?? t.tasks?.length ?? 0
            const selected = selectedId === t.id
            return (
              <button
                key={t.id}
                onClick={() => onSelect(t)}
                className="rounded-[10px] border p-4 text-left cursor-pointer transition-all duration-150
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                style={{
                  backgroundColor: selected ? 'rgba(59,91,219,0.06)' : 'var(--bg-app)',
                  borderColor: selected ? 'var(--color-primary)' : 'var(--border-color)',
                  borderWidth: selected ? '2px' : '1px',
                }}
                aria-pressed={selected}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px]"
                    style={{ backgroundColor: selected ? 'rgba(59,91,219,0.12)' : 'rgba(59,91,219,0.06)' }}
                  >
                    <FileText size={15} className="text-primary" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-[13px] font-semibold truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {t.name}
                    </p>
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {taskCount === 1 ? '1 task' : `${taskCount} tasks`}
                    </p>
                  </div>
                  {selected && (
                    <div
                      className="ml-auto shrink-0 flex h-5 w-5 items-center justify-center rounded-full"
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                      <Check size={11} className="text-white" aria-hidden="true" />
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      <WizardNav
        step={1}
        totalSteps={4}
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!selectedId}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — Manager & Department Mapping
// ─────────────────────────────────────────────────────────────────────────────

function Step3({ hireName, templateId, managerName, deptAssignments, onManagerChange, onDeptChange, onBack, onNext }) {
  const { data: deptData, isLoading: deptLoading } = useQuery({
    queryKey: ['templateDepts', templateId],
    queryFn: () => getTemplateDepartments(templateId),
    enabled: !!templateId,
  })

  // Filter out 'new_hire'
  const departments = (Array.isArray(deptData) ? deptData : []).filter(
    (d) => d !== 'new_hire' && d !== 'new-hire',
  )

  const hasUnassigned = departments.some((d) => !deptAssignments[d])
  const hasNoManager = !managerName

  return (
    <div>
      {/* Section A — Manager */}
      <div className="mb-6">
        <h3 className="text-[14px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          Who is {hireName || 'the new hire'}'s manager?
        </h3>
        <p className="text-[13px] mb-3" style={{ color: 'var(--text-secondary)' }}>
          Manager assignment is not yet available — you can assign one later.
        </p>
        <div
          className="flex items-center gap-3 p-3 rounded-[10px] border"
          style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
        >
          <div
            className="h-9 w-9 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--border-color)' }}
            aria-hidden="true"
          >
            <Users size={16} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <div>
            <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
              No managers found. You can assign one later.
            </p>
          </div>
        </div>
      </div>

      {/* Section B — Departments */}
      <div>
        <h3 className="text-[14px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          Department task assignments
        </h3>
        <p className="text-[13px] mb-3" style={{ color: 'var(--text-secondary)' }}>
          Map departments from the selected template to assignees.
        </p>

        {deptLoading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[72px] rounded-[10px] border animate-pulse"
                style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
              />
            ))}
          </div>
        )}

        {!deptLoading && departments.length === 0 && (
          <div
            className="flex items-center gap-3 p-4 rounded-[10px] border"
            style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border-color)' }}
          >
            <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
              No department mappings required for this template.
            </p>
          </div>
        )}

        {!deptLoading && departments.length > 0 && (
          <div className="space-y-2">
            {departments.map((dept) => {
              const assigned = deptAssignments[dept]
              return (
                <div
                  key={dept}
                  className="flex items-center justify-between gap-4 p-3.5 rounded-[10px] border"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: assigned ? 'var(--border-color)' : 'rgba(217,119,6,0.35)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px]"
                      style={{ backgroundColor: 'rgba(59,91,219,0.08)' }}
                    >
                      <Users size={14} className="text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium capitalize" style={{ color: 'var(--text-primary)' }}>
                        {dept.replace(/_/g, ' ')} Department
                      </p>
                      {!assigned && (
                        <p className="text-[11px]" style={{ color: '#d97706' }}>
                          Unassigned — assign now
                        </p>
                      )}
                      {assigned && (
                        <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                          Assigned: {assigned}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                      No users found, using org default
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Warnings */}
        <div className="mt-4 space-y-2">
          {hasUnassigned && (
            <div
              className="flex items-start gap-2.5 p-3 rounded-[8px]"
              style={{ backgroundColor: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.25)' }}
            >
              <AlertTriangle size={14} style={{ color: '#d97706' }} className="mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-[13px]" style={{ color: '#92400e' }}>
                Some tasks will be unassigned. You can assign them later from the onboarding detail page.
              </p>
            </div>
          )}
          {hasNoManager && (
            <div
              className="flex items-start gap-2.5 p-3 rounded-[8px]"
              style={{ backgroundColor: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.25)' }}
            >
              <AlertTriangle size={14} style={{ color: '#d97706' }} className="mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-[13px]" style={{ color: '#92400e' }}>
                No manager assigned. This onboarding will be flagged with a warning.
              </p>
            </div>
          )}
        </div>
      </div>

      <WizardNav step={2} totalSteps={4} onBack={onBack} onNext={onNext} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 4 — Start Date & Review
// ─────────────────────────────────────────────────────────────────────────────

function Step4({ formData, template, managerName, deptAssignments, onBack, onSubmit, isSubmitting }) {
  const [startDate, setStartDate] = useState(formData.startDate || '')
  const [dateError, setDateError] = useState('')

  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')

  const handleNext = () => {
    if (!startDate) {
      setDateError('Start date is required')
      return
    }
    const chosen = parseISO(startDate)
    if (!isAfter(chosen, startOfDay(today))) {
      setDateError('Start date must be in the future')
      return
    }
    setDateError('')
    onSubmit({ startDate })
  }

  const taskCount = template?.taskCount ?? template?.tasks?.length ?? 0
  const deptEntries = Object.entries(deptAssignments)

  return (
    <div>
      {/* Section A — Start date */}
      <div className="mb-8">
        <h3 className="text-[14px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          Start date
        </h3>
        <p className="text-[13px] mb-3" style={{ color: 'var(--text-secondary)' }}>
          Tasks will be scheduled relative to this date.
        </p>
        <div className="max-w-[220px]">
          <input
            type="date"
            value={startDate}
            min={todayStr}
            onChange={(e) => { setStartDate(e.target.value); setDateError('') }}
            aria-label="Start date"
            className="w-full h-[38px] px-3 rounded-[8px] border text-[14px] cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            style={{
              backgroundColor: 'var(--bg-app)',
              borderColor: dateError ? '#dc2626' : 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          />
          {dateError && (
            <p className="mt-1 text-[12px] text-red-500" role="alert">{dateError}</p>
          )}
        </div>
      </div>

      {/* Section B — Review card */}
      <div>
        <h3 className="text-[14px] font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Review
        </h3>
        <div
          className="rounded-[12px] border divide-y overflow-hidden"
          style={{ borderColor: 'var(--border-color)' }}
        >
          {/* New hire */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Avatar name={formData.fullName} size={32} />
            <div>
              <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                {formData.fullName}
              </p>
              <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                {formData.jobTitle || 'New Hire'} · {formData.workEmail}
              </p>
            </div>
          </div>

          {/* Template */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px]"
              style={{ backgroundColor: 'rgba(59,91,219,0.08)' }}
            >
              <FileText size={14} className="text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                {template?.name}
              </p>
              <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                {taskCount === 1 ? '1 task' : `${taskCount} tasks`}
              </p>
            </div>
          </div>

          {/* Manager */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: managerName ? 'rgba(59,91,219,0.08)' : 'rgba(217,119,6,0.08)' }}
            >
              <Users
                size={14}
                style={{ color: managerName ? 'var(--color-primary)' : '#d97706' }}
                aria-hidden="true"
              />
            </div>
            <div>
              <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>Manager</p>
              <p
                className="text-[13px] font-medium"
                style={{ color: managerName ? 'var(--text-primary)' : '#d97706' }}
              >
                {managerName || 'Unassigned'}
              </p>
            </div>
          </div>

          {/* Department assignments */}
          {deptEntries.length > 0 && deptEntries.map(([dept, assignee]) => (
            <div key={dept} className="flex items-center justify-between px-4 py-3.5">
              <div>
                <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                  {dept.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </p>
                <p
                  className="text-[13px] font-medium"
                  style={{ color: assignee ? 'var(--text-primary)' : '#d97706' }}
                >
                  {assignee || 'Unassigned'}
                </p>
              </div>
              {!assignee && (
                <AlertTriangle size={14} style={{ color: '#d97706' }} aria-label="Unassigned" />
              )}
            </div>
          ))}

          {/* Start date */}
          {startDate && (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px]"
                style={{ backgroundColor: 'rgba(34,197,94,0.08)' }}
              >
                <CalendarDays size={14} style={{ color: '#16a34a' }} aria-hidden="true" />
              </div>
              <div>
                <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>Start date</p>
                <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                  {format(parseISO(startDate), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation prompt */}
      <div
        className="mt-6 p-4 rounded-[12px]"
        style={{ backgroundColor: 'rgba(59,91,219,0.05)', border: '1px solid rgba(59,91,219,0.15)' }}
      >
        <p className="text-[14px] font-medium mb-4 text-center" style={{ color: 'var(--text-primary)' }}>
          Ready to launch{' '}
          <span style={{ color: 'var(--color-primary)' }}>{formData.fullName}</span>'s onboarding
          {taskCount > 0 ? ` with ${taskCount} task${taskCount !== 1 ? 's' : ''}` : ''}?
        </p>
        <div className="flex items-center gap-3 justify-between pt-4" style={{ borderTop: '1px solid rgba(59,91,219,0.15)' }}>
          <Button variant="secondary" onClick={onBack} className="gap-1.5">
            <ChevronLeft size={15} aria-hidden="true" />
            Back
          </Button>
          <Button
            size="lg"
            onClick={handleNext}
            loading={isSubmitting}
            disabled={isSubmitting}
            className="gap-2"
          >
            <Rocket size={15} aria-hidden="true" />
            Launch onboarding
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Portal token modal
// ─────────────────────────────────────────────────────────────────────────────

function PortalTokenModal({ hireName, token, onboardingId, onClose }) {
  const [copied, setCopied] = useState(false)
  const portalUrl = `${window.location.origin}/hire/${token}`
  const navigate = useNavigate()

  const handleCopy = () => {
    navigator.clipboard.writeText(portalUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGo = () => {
    onClose()
    navigate(`/onboardings/${onboardingId}`)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.50)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="portal-modal-title"
    >
      <div
        className="w-full max-w-md rounded-[14px] p-6 space-y-4"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.14)',
        }}
      >
        {/* Header */}
        <div className="text-center">
          <div
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(34,197,94,0.12)' }}
          >
            <Rocket size={22} style={{ color: '#16a34a' }} aria-hidden="true" />
          </div>
          <h2
            id="portal-modal-title"
            className="text-[17px] font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Onboarding Launched!
          </h2>
          <p className="mt-1 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            Share this portal link with {hireName}:
          </p>
        </div>

        {/* Portal link */}
        <div
          className="flex items-center gap-2 p-3 rounded-[8px]"
          style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)' }}
        >
          <p
            className="flex-1 text-[13px] font-mono truncate"
            style={{ color: 'var(--color-primary)' }}
          >
            {portalUrl}
          </p>
          <button
            onClick={handleCopy}
            aria-label="Copy portal link"
            className="shrink-0 flex items-center gap-1.5 h-[30px] px-2.5 rounded-[6px] text-[12px] font-medium
              cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/8
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{ color: copied ? '#16a34a' : 'var(--text-secondary)' }}
          >
            <Copy size={13} aria-hidden="true" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Warning */}
        <div
          className="flex items-start gap-2 px-3 py-2.5 rounded-[8px]"
          style={{ backgroundColor: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.25)' }}
        >
          <AlertTriangle size={13} style={{ color: '#d97706' }} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-[12px]" style={{ color: '#92400e' }}>
            This link won't be shown again. Copy it before closing.
          </p>
        </div>

        {/* Actions */}
        <Button onClick={handleGo} className="w-full gap-1.5">
          <ExternalLink size={14} aria-hidden="true" />
          Go to onboarding
        </Button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// OnboardingWizardPage
// ─────────────────────────────────────────────────────────────────────────────

export default function OnboardingWizardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isHR = user?.role === 'hr' || user?.role === 'admin'

  // Redirect non-HR
  useEffect(() => {
    if (user && !isHR) {
      navigate('/onboardings', { replace: true })
    }
  }, [user, isHR, navigate])

  const [step, setStep] = useState(0)

  // Wizard state
  const [hireInfo, setHireInfo] = useState({ fullName: '', workEmail: '', jobTitle: '' })
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [managerName, setManagerName] = useState('')
  const [deptAssignments, setDeptAssignments] = useState({})

  // Portal modal
  const [portalData, setPortalData] = useState(null)

  const createMutation = useMutation({
    mutationFn: (payload) => onboardingsApi.create(payload),
    onSuccess: (res) => {
      const d = res.data?.data ?? res.data ?? {}
      toast.success(`${hireInfo.fullName}'s onboarding has been launched!`)
      if (d.hirePortalToken) {
        setPortalData({ id: d.id, token: d.hirePortalToken })
      } else {
        navigate(`/onboardings/${d.id}`)
      }
    },
    onError: (err) => {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Failed to create onboarding'
      toast.error(msg)
    },
  })

  const handleStep1Complete = (data) => {
    setHireInfo(data)
    setStep(1)
  }

  const handleStep4Submit = ({ startDate }) => {
    createMutation.mutate({
      newHireName: hireInfo.fullName,
      newHireEmail: hireInfo.workEmail,
      job: hireInfo.jobTitle || undefined,
      templateId: selectedTemplate?.id,
      startDate,
      departmentMap: deptAssignments,
    })
  }

  if (!user) return null

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

      {portalData && (
        <PortalTokenModal
          hireName={hireInfo.fullName}
          token={portalData.token}
          onboardingId={portalData.id}
          onClose={() => setPortalData(null)}
        />
      )}

      <div className="min-h-screen px-6 py-8" style={{ backgroundColor: 'var(--bg-app)' }}>
        <div className="mx-auto w-full max-w-[720px]">

          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/onboardings')}
              className="flex items-center gap-1.5 text-[13px] mb-4 cursor-pointer
                hover:opacity-70 transition-opacity
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ChevronLeft size={14} aria-hidden="true" />
              Back to onboardings
            </button>
            <h1 className="text-[22px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              New onboarding
            </h1>
            <p className="mt-1 text-[14px]" style={{ color: 'var(--text-secondary)' }}>
              Set up a new hire's onboarding journey in a few steps.
            </p>
          </div>

          {/* Step indicator */}
          <StepIndicator currentStep={step} />

          {/* Step card */}
          <div
            className="rounded-[12px] border p-6"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
            }}
          >
            <h2 className="text-[16px] font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>
              {STEPS[step].label}
            </h2>

            {step === 0 && (
              <Step1 data={hireInfo} onComplete={handleStep1Complete} />
            )}

            {step === 1 && (
              <Step2
                selectedId={selectedTemplate?.id}
                onSelect={setSelectedTemplate}
                onBack={() => setStep(0)}
                onNext={() => setStep(2)}
              />
            )}

            {step === 2 && (
              <Step3
                hireName={hireInfo.fullName}
                templateId={selectedTemplate?.id}
                managerName={managerName}
                deptAssignments={deptAssignments}
                onManagerChange={setManagerName}
                onDeptChange={(dept, val) =>
                  setDeptAssignments((prev) => ({ ...prev, [dept]: val }))
                }
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            )}

            {step === 3 && (
              <Step4
                formData={hireInfo}
                template={selectedTemplate}
                managerName={managerName}
                deptAssignments={deptAssignments}
                onBack={() => setStep(2)}
                onSubmit={handleStep4Submit}
                isSubmitting={createMutation.isPending}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
