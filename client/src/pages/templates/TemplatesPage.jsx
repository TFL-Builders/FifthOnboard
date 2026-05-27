import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Pencil,
  Copy,
  Archive,
  ArchiveRestore,
  Trash2,
  FileText,
  AlertCircle,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import {
  listTemplates,
  cloneTemplate,
  archiveTemplate,
  unarchiveTemplate,
  deleteTemplate,
} from '../../api/templates'
import useAuthStore from '../../stores/authStore'
import Button from '../../components/ui/Button'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const FILTERS = [
  { key: 'active',   label: 'Active'   },
  { key: 'archived', label: 'Archived' },
  { key: 'all',      label: 'All'      },
]

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton row — shown while loading
// ─────────────────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div
      className="flex items-center justify-between px-4 py-4 animate-pulse"
      style={{ borderBottom: '1px solid var(--border-color)' }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className="h-8 w-8 shrink-0 rounded-[6px]"
          style={{ backgroundColor: 'var(--border-color)' }}
        />
        <div className="space-y-1.5 flex-1 min-w-0">
          <div
            className="h-[13px] w-48 rounded"
            style={{ backgroundColor: 'var(--border-color)' }}
          />
          <div
            className="h-[11px] w-32 rounded"
            style={{ backgroundColor: 'var(--border-color)' }}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4 shrink-0">
        {[52, 52, 72].map((w, i) => (
          <div
            key={i}
            className="h-[28px] rounded-[6px]"
            style={{ width: w, backgroundColor: 'var(--border-color)' }}
          />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete confirmation dialog
// ─────────────────────────────────────────────────────────────────────────────

function DeleteDialog({ template, onConfirm, onCancel, isLoading }) {
  const [input, setInput] = useState('')
  const confirmed = input.trim() === template.name

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div
        className="w-full max-w-sm rounded-[8px] p-6 space-y-4"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        }}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(220,38,38,0.10)' }}
          >
            <Trash2 size={16} className="text-danger" aria-hidden="true" />
          </div>
          <div>
            <h2
              id="delete-dialog-title"
              className="text-[15px] font-semibold leading-snug"
              style={{ color: 'var(--text-primary)' }}
            >
              Delete template
            </h2>
            <p
              className="mt-1 text-[13px] leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              This cannot be undone. Type{' '}
              <span
                className="font-mono font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                {template.name}
              </span>{' '}
              to confirm.
            </p>
          </div>
        </div>

        {/* Confirm input */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={template.name}
          autoFocus
          aria-label="Type template name to confirm deletion"
          className="w-full h-[38px] rounded-[8px] border px-3 text-[14px] outline-none
            focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
            transition-shadow"
          style={{
            backgroundColor: 'var(--bg-app)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
        />

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={!confirmed || isLoading}
            loading={isLoading}
            className="bg-danger hover:bg-red-700 focus-visible:ring-danger"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Single template row
// ─────────────────────────────────────────────────────────────────────────────

function TemplateRow({
  template,
  filter,
  isAdmin,
  onPreview,
  onEdit,
  onClone,
  onArchive,
  onUnarchive,
  onDelete,
}) {
  const taskCount = template.taskCount ?? template.tasks?.length ?? 0
  const updatedLabel = template.updatedAt === 0 
  ? 'Today' 
  : template.updatedAt === 1 
  ? 'Yesterday'
  : `${template.updatedAt} days ago`
  return (
    <div
      className="flex items-center justify-between px-4 py-3.5 transition-colors"
      style={{ borderBottom: '1px solid var(--border-color)' }}
    >
      {/* Left: icon + name + meta */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px]"
          style={{ backgroundColor: 'rgba(59,91,219,0.08)' }}
        >
          <FileText size={15} className="text-primary" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <button
            onClick={onPreview}
            aria-label={`Preview ${template.name}`}
            className="text-[14px] font-medium truncate text-left cursor-pointer
              hover:underline transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1
              rounded-[2px]"
            style={{ color: 'var(--text-primary)' }}
          >
            {template.name}
          </button>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {taskCount === 1 ? '1 task' : `${taskCount} tasks`}
            {updatedLabel ? ` · Updated ${updatedLabel}` : ''}
          </p>
        </div>
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-1 ml-4 shrink-0">
        {/* Edit */}
        <ActionBtn
          onClick={onEdit}
          icon={<Pencil size={13} aria-hidden="true" />}
          label={`Edit ${template.name}`}
        >
          Edit
        </ActionBtn>

        {/* Clone */}
        <ActionBtn
          onClick={onClone}
          icon={<Copy size={13} aria-hidden="true" />}
          label={`Clone ${template.name}`}
        >
          Clone
        </ActionBtn>

        {/* Archive / Unarchive */}
        {filter === 'archived' ? (
          <ActionBtn
            onClick={onUnarchive}
            icon={<ArchiveRestore size={13} aria-hidden="true" />}
            label={`Unarchive ${template.name}`}
          >
            Unarchive
          </ActionBtn>
        ) : (
          <ActionBtn
            onClick={onArchive}
            icon={<Archive size={13} aria-hidden="true" />}
            label={`Archive ${template.name}`}
          >
            Archive
          </ActionBtn>
        )}

        {/* Delete — admin only */}
        {isAdmin && (
          <ActionBtn
            onClick={onDelete}
            icon={<Trash2 size={13} aria-hidden="true" />}
            label={`Delete ${template.name}`}
            danger
          >
            Delete
          </ActionBtn>
        )}
      </div>
    </div>
  )
}

// Small action button used in each row
function ActionBtn({ onClick, icon, label, children, danger = false }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={[
        'inline-flex items-center gap-1.5 h-[28px] px-2.5 rounded-[6px]',
        'text-[12px] font-medium cursor-pointer transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        danger
          ? 'text-danger hover:bg-red-50 dark:hover:bg-red-950/30 focus-visible:ring-danger'
          : 'hover:bg-black/5 dark:hover:bg-white/8 focus-visible:ring-primary',
      ].join(' ')}
      style={danger ? undefined : { color: 'var(--text-secondary)' }}
    >
      {icon}
      {children}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({ onCreateClick }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-[8px] mb-4"
        style={{ backgroundColor: 'rgba(59,91,219,0.08)' }}
      >
        <FileText size={22} className="text-primary" aria-hidden="true" />
      </div>
      <p
        className="text-[15px] font-semibold mb-1"
        style={{ color: 'var(--text-primary)' }}
      >
        No templates yet
      </p>
      <p
        className="text-[14px] mb-6 max-w-[280px] leading-relaxed"
        style={{ color: 'var(--text-secondary)' }}
      >
        Build a reusable onboarding checklist your whole team can use.
      </p>
      <Button onClick={onCreateClick} className="gap-1.5">
        <Plus size={15} aria-hidden="true" />
        Create your first template
      </Button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TemplatesPage
// ─────────────────────────────────────────────────────────────────────────────

export default function TemplatesPage() {
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()
  const user         = useAuthStore((s) => s.user)
  const isAdmin      = user?.role === 'admin'

  const [filter, setFilter]           = useState('active')
  const [deleteTarget, setDeleteTarget] = useState(null)

  // ── Query ──────────────────────────────────────────────────────────────────
  const { data, isLoading, isError } = useQuery({
    queryKey: ['templates', filter],
    queryFn:  () => listTemplates(filter).then((r) => r.data),
  })

  // Normalise: API may return { templates: [...] } or [...]
  const templates = data?.data ?? []

  // ── Invalidate helper ──────────────────────────────────────────────────────
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['templates', filter] })

  // ── Mutations ──────────────────────────────────────────────────────────────
  const cloneMutation = useMutation({
    mutationFn: (id) => cloneTemplate(id),
    onSuccess:  () => { toast.success('Template cloned'); invalidate() },
    onError:    () => toast.error('Failed to clone template'),
  })

  const archiveMutation = useMutation({
    mutationFn: (id) => archiveTemplate(id),
    onSuccess:  () => { toast.success('Template archived'); invalidate() },
    onError:    () => toast.error('Failed to archive template'),
  })

  const unarchiveMutation = useMutation({
    mutationFn: (id) => unarchiveTemplate(id),
    onSuccess:  () => { toast.success('Template restored'); invalidate() },
    onError:    () => toast.error('Failed to restore template'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTemplate(id),
    onSuccess:  () => {
      toast.success('Template deleted')
      setDeleteTarget(null)
      invalidate()
    },
    onError: () => toast.error('Failed to delete template'),
  })

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Toast provider — renders into a portal, safe to mount here */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background:  'var(--bg-card)',
            color:        'var(--text-primary)',
            border:      '1px solid var(--border-color)',
            fontSize:    '14px',
            borderRadius: '8px',
          },
          error: { duration: Infinity },
        }}
      />

      {/* Delete confirmation */}
      {deleteTarget && (
        <DeleteDialog
          template={deleteTarget}
          isLoading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Page wrapper */}
      <div
        className="min-h-screen px-6 py-8"
        style={{ backgroundColor: 'var(--bg-app)' }}
      >
        <div className="mx-auto w-full max-w-[1280px]">

          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1
                className="text-[24px] font-semibold leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                Templates
              </h1>
              <p
                className="mt-1 text-[14px]"
                style={{ color: 'var(--text-secondary)' }}
              >
                Reusable onboarding checklists for your organization
              </p>
            </div>

            <Button
              onClick={() => navigate('/templates/new')}
              className="gap-1.5 shrink-0"
            >
              <Plus size={16} aria-hidden="true" />
              New template
            </Button>
          </div>

          {/* ── Card ────────────────────────────────────────────────────── */}
          <div
            className="rounded-[8px] border overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor:     'var(--border-color)',
            }}
          >
            {/* Filter tabs */}
            <div
              className="flex items-center gap-0.5 px-4"
              style={{ borderBottom: '1px solid var(--border-color)' }}
              role="tablist"
              aria-label="Filter templates"
            >
              {FILTERS.map(({ key, label }) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={filter === key}
                  onClick={() => setFilter(key)}
                  className={[
                    'relative h-10 px-3 text-[13px] font-medium cursor-pointer',
                    'transition-colors focus-visible:outline-none focus-visible:ring-2',
                    'focus-visible:ring-primary focus-visible:ring-offset-1',
                  ].join(' ')}
                  style={{
                    color: filter === key
                      ? 'var(--color-primary)'
                      : 'var(--text-secondary)',
                  }}
                >
                  {label}
                  {filter === key && (
                    <span
                      className="absolute bottom-0 inset-x-0 h-[2px] rounded-full bg-primary"
                      aria-hidden="true"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* ── Loading ─────────────────────────────────────────────── */}
            {isLoading && (
              <div>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </div>
            )}

            {/* ── Error ───────────────────────────────────────────────── */}
            {!isLoading && isError && (
              <div
                className="flex items-center gap-3 px-4 py-6"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle
                  size={16}
                  className="text-danger shrink-0"
                  aria-hidden="true"
                />
                <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                  Failed to load templates. Please refresh and try again.
                </p>
              </div>
            )}

            {/* ── Empty state ──────────────────────────────────────────── */}
            {!isLoading && !isError && templates.length === 0 && (
              <EmptyState onCreateClick={() => navigate('/templates/new')} />
            )}

            {/* ── Template list ────────────────────────────────────────── */}
            {!isLoading && !isError && templates.length > 0 && (
              <div role="list" aria-label="Templates">
                {templates.map((template) => (
                  <div key={template.id} role="listitem">
                    <TemplateRow
                      template={template}
                      filter={filter}
                      isAdmin={isAdmin}
                      onPreview={() => navigate(`/templates/${template.id}/preview`)}
                      onEdit={() => navigate(`/templates/${template.id}`)}
                      onClone={() => cloneMutation.mutate(template.id)}
                      onArchive={() => archiveMutation.mutate(template.id)}
                      onUnarchive={() => unarchiveMutation.mutate(template.id)}
                      onDelete={() => setDeleteTarget(template)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
