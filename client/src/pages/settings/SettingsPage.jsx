import { useState, useEffect, useRef, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Settings,
  Users,
  UserCheck,
  Monitor,
  DollarSign,
  Puzzle,
  ChevronDown,
  X,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { settingsApi } from '../../api/settings'
import api from '../../api/axios'
import Button from '../../components/ui/Button'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DEPARTMENTS = ['hr', 'manager', 'it', 'finance', 'custom']

const DEPT_LABELS = {
  hr: 'HR',
  manager: 'Manager',
  it: 'IT',
  finance: 'Finance',
  custom: 'Custom',
}

const DEPT_ICONS = {
  hr: UserCheck,
  manager: Users,
  it: Monitor,
  finance: DollarSign,
  custom: Puzzle,
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#3b5bdb','#1098ad','#0ca678','#f59f00','#e64980','#7950f2','#f76707','#2f9e44',
]

function avatarColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}

function Avatar({ name, size = 28, color }) {
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

function Bone({ w = '100%', h = 14 }) {
  return (
    <div
      className="rounded animate-pulse"
      style={{ width: w, height: h, backgroundColor: 'var(--border-color)' }}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// UserPicker
// ─────────────────────────────────────────────────────────────────────────────

function UserPicker({ selectedUser, pickerUsers, isLoading: isLoadingUsers, onSelect, onClear, isOpen, onToggle }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) onToggle()
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [isOpen, onToggle])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 h-7 px-2.5 rounded-[6px] text-[12px] font-medium
          cursor-pointer transition-colors
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        style={{
          backgroundColor: 'var(--bg-app)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-secondary)',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--border-color)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-app)')}
      >
        {selectedUser ? 'Change' : 'Assign'}
        <ChevronDown size={11} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-30 mt-1.5 w-[240px] rounded-[10px] border overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
          }}
        >
          <button
            onClick={() => { onClear(); onToggle() }}
            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] cursor-pointer
              transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{
              color: 'var(--text-secondary)',
              borderBottom: '1px solid var(--border-color)',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-app)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X size={12} aria-hidden="true" />
            Clear assignment
          </button>

          <div className="max-h-[200px] overflow-y-auto">
            {isLoadingUsers && (
              <div className="p-3 space-y-2.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full shrink-0 animate-pulse"
                      style={{ backgroundColor: 'var(--border-color)' }}
                    />
                    <Bone w={110} h={12} />
                  </div>
                ))}
              </div>
            )}

            {!isLoadingUsers && (!pickerUsers || pickerUsers.length === 0) && (
              <p
                className="px-3 py-4 text-[12px] text-center"
                style={{ color: 'var(--text-secondary)' }}
              >
                No users found
              </p>
            )}

            {!isLoadingUsers &&
              pickerUsers?.map((u) => (
                <button
                  key={u.id}
                  onClick={() => { onSelect(u); onToggle() }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left cursor-pointer
                    transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-app)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Avatar name={u.name} color={u.avatarColor} size={24} />
                  <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>
                    {u.name}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SettingsPage
// ─────────────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const queryClient = useQueryClient()

  // null = no picker open | '_manager' = manager section | dept string = dept section
  const [openPicker, setOpenPicker] = useState(null)

  // undefined = uninitialized (shows skeleton) | null = cleared | object = user
  const [localManager, setLocalManager] = useState(undefined)
  // { dept: userObj | null }
  const [localDeptMap, setLocalDeptMap] = useState(undefined)

  // ── Fetch settings ────────────────────────────────────────────────────────
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get().then((r) => r.data.data),
  })

  // ── Initialize local state when data arrives ──────────────────────────────
  useEffect(() => {
    if (data !== undefined && localManager === undefined) {
      setLocalManager(data.defaultManagerId ?? null)
      setLocalDeptMap(
        Object.fromEntries(
          DEPARTMENTS.map((d) => [d, data.defaultDepartmentMap?.[d] ?? null])
        )
      )
    }
  }, [data, localManager])

  const initialized = localManager !== undefined && localDeptMap !== undefined

  // ── Fetch all user picker lists ───────────────────────────────────────────
  const { data: pickerLists, isLoading: loadingPickers } = useQuery({
    queryKey: ['users', 'picker', 'settings-all'],
    queryFn: async () => {
      const keys = ['_manager', ...DEPARTMENTS]
      const results = await Promise.all(
        keys.map((key) => {
          const params =
            key === '_manager' || key === 'manager'
              ? { view: 'picker', role: 'manager', status: 'active' }
              : { view: 'picker', department: key, status: 'active' }
          return api.get('/users', { params }).then((r) => ({ key, users: r.data.data || [] }))
        })
      )
      return Object.fromEntries(results.map((r) => [r.key, r.users]))
    },
  })

  // ── Dirty detection ───────────────────────────────────────────────────────
  const isDirty = useMemo(() => {
    if (!initialized || !data) return false
    const origManagerId = data.defaultManagerId?.id ?? null
    const localManagerId = localManager?.id ?? null
    if (origManagerId !== localManagerId) return true
    return DEPARTMENTS.some((dept) => {
      const origId = data.defaultDepartmentMap?.[dept]?.id ?? null
      const localId = localDeptMap?.[dept]?.id ?? null
      return origId !== localId
    })
  }, [initialized, data, localManager, localDeptMap])

  function isManagerModified() {
    if (!initialized || !data) return false
    return (data.defaultManagerId?.id ?? null) !== (localManager?.id ?? null)
  }

  function isDeptModified(dept) {
    if (!initialized || !data) return false
    return (data.defaultDepartmentMap?.[dept]?.id ?? null) !== (localDeptMap?.[dept]?.id ?? null)
  }

  // ── Save mutation ─────────────────────────────────────────────────────────
  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: (body) => settingsApi.update(body),
    onSuccess: () => {
      toast.success('Settings saved')
      setLocalManager(undefined)
      setLocalDeptMap(undefined)
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.error || err?.response?.data?.message || 'Failed to save settings'
      toast.error(msg)
    },
  })

  function handleSave() {
    const body = {}

    const origManagerId = data?.defaultManagerId?.id ?? null
    const localManagerId = localManager?.id ?? null
    if (origManagerId !== localManagerId) {
      body.defaultManagerId = localManagerId
    }

    const changedDepts = DEPARTMENTS.filter((dept) => {
      const origId = data?.defaultDepartmentMap?.[dept]?.id ?? null
      const localId = localDeptMap?.[dept]?.id ?? null
      return origId !== localId
    })

    if (changedDepts.length > 0) {
      body.defaultDepartmentMap = {}
      changedDepts.forEach((dept) => {
        body.defaultDepartmentMap[dept] = localDeptMap?.[dept]?.id ?? null
      })
    }

    save(body)
  }

  function togglePicker(key) {
    setOpenPicker((prev) => (prev === key ? null : key))
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (isError) {
    return (
      <div className="min-h-screen px-6 py-8" style={{ backgroundColor: 'var(--bg-app)' }}>
        <div className="mx-auto w-full max-w-[680px]">
          <div
            className="flex flex-col items-center gap-3 py-20 text-center rounded-[12px] border"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <AlertCircle size={28} style={{ color: 'var(--color-danger)' }} aria-hidden="true" />
            <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
              Failed to load settings
            </p>
            <Button variant="secondary" size="sm" onClick={() => refetch()} className="gap-1.5">
              <RefreshCw size={13} aria-hidden="true" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const showSkeleton = isLoading || !initialized

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

      <div className="min-h-screen px-6 py-8" style={{ backgroundColor: 'var(--bg-app)' }}>
        <div className="mx-auto w-full max-w-[680px]">

          {/* ── Page header ── */}
          <div className="flex items-start justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]"
                style={{ backgroundColor: 'rgba(59,91,219,0.08)' }}
              >
                <Settings size={18} className="text-primary" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-[20px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Settings
                </h1>
                <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  Configure your organization's default assignments
                </p>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              loading={isSaving}
              className="shrink-0"
            >
              Save changes
            </Button>
          </div>

          {/* ── Section 1: Default Manager ── */}
          <div
            className="rounded-[12px] border p-5 mb-4"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                Default Manager
              </h2>
              {isManagerModified() && (
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: '#d97706' }}
                  aria-label="Unsaved change"
                />
              )}
            </div>
            <p className="text-[13px] mb-4" style={{ color: 'var(--text-secondary)' }}>
              Pre-assigned as manager for new onboardings unless overridden
            </p>

            {showSkeleton ? (
              <div className="flex items-center gap-3 p-3 rounded-[10px] border"
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-app)' }}>
                <div className="w-8 h-8 rounded-full animate-pulse shrink-0"
                  style={{ backgroundColor: 'var(--border-color)' }} />
                <Bone w={140} h={13} />
              </div>
            ) : (
              <div
                className="flex items-center justify-between gap-4 p-3 rounded-[10px] border transition-colors"
                style={{
                  borderColor: isManagerModified() ? 'rgba(217,119,6,0.35)' : 'var(--border-color)',
                  backgroundColor: isManagerModified() ? 'rgba(217,119,6,0.03)' : 'var(--bg-app)',
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {localManager ? (
                    <>
                      <Avatar name={localManager.name} color={localManager.avatarColor} size={30} />
                      <span
                        className="text-[13px] font-medium truncate"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {localManager.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                      Not set
                    </span>
                  )}
                </div>

                <UserPicker
                  selectedUser={localManager}
                  pickerUsers={pickerLists?.['_manager']}
                  isLoading={loadingPickers}
                  onSelect={(u) => setLocalManager(u)}
                  onClear={() => setLocalManager(null)}
                  isOpen={openPicker === '_manager'}
                  onToggle={() => togglePicker('_manager')}
                />
              </div>
            )}
          </div>

          {/* ── Section 2: Default Department Assignments ── */}
          <div
            className="rounded-[12px] border p-5"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
            }}
          >
            <h2 className="text-[14px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              Default Department Assignments
            </h2>
            <p className="text-[13px] mb-4" style={{ color: 'var(--text-secondary)' }}>
              These users are pre-assigned when creating new onboardings. You can override them per onboarding.
            </p>

            <div className="space-y-px">
              {DEPARTMENTS.map((dept, idx) => {
                const DeptIcon = DEPT_ICONS[dept]
                const label = DEPT_LABELS[dept]
                const assignedUser = localDeptMap?.[dept] ?? null
                const modified = isDeptModified(dept)

                return (
                  <div
                    key={dept}
                    className="transition-colors"
                    style={{
                      borderRadius: idx === 0 ? '8px 8px 0 0' : idx === DEPARTMENTS.length - 1 ? '0 0 8px 8px' : '0',
                      border: '1px solid var(--border-color)',
                      marginTop: idx === 0 ? 0 : -1,
                    }}
                  >
                    {showSkeleton ? (
                      <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-[8px] animate-pulse shrink-0"
                            style={{ backgroundColor: 'var(--border-color)' }} />
                          <Bone w={80} h={13} />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full animate-pulse"
                            style={{ backgroundColor: 'var(--border-color)' }} />
                          <Bone w={100} h={12} />
                        </div>
                      </div>
                    ) : (
                      <div
                        className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors"
                        style={{
                          backgroundColor: modified ? 'rgba(217,119,6,0.03)' : 'transparent',
                        }}
                      >
                        {/* Left: dept label */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px]"
                            style={{ backgroundColor: 'rgba(59,91,219,0.08)' }}
                          >
                            <DeptIcon size={14} className="text-primary" aria-hidden="true" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="text-[13px] font-medium"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {label}
                            </span>
                            {modified && (
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: '#d97706' }}
                                aria-label="Unsaved change"
                              />
                            )}
                          </div>
                        </div>

                        {/* Right: current user + picker */}
                        <div className="flex items-center gap-3 shrink-0">
                          {assignedUser ? (
                            <div className="flex items-center gap-2">
                              <Avatar
                                name={assignedUser.name}
                                color={assignedUser.avatarColor}
                                size={26}
                              />
                              <span
                                className="text-[13px] hidden sm:block"
                                style={{ color: 'var(--text-secondary)' }}
                              >
                                {assignedUser.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                              Not set
                            </span>
                          )}

                          <UserPicker
                            selectedUser={assignedUser}
                            pickerUsers={pickerLists?.[dept]}
                            isLoading={loadingPickers}
                            onSelect={(u) =>
                              setLocalDeptMap((prev) => ({ ...prev, [dept]: u }))
                            }
                            onClear={() =>
                              setLocalDeptMap((prev) => ({ ...prev, [dept]: null }))
                            }
                            isOpen={openPicker === dept}
                            onToggle={() => togglePicker(dept)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
