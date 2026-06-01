import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Clock, Loader2, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  MessageCircle, Paperclip, CalendarDays,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { format, isToday, isPast, parseISO } from 'date-fns'
import { hirePortalApi } from '../../api/hire'

// ─── Constants ───────────────────────────────────────────────────────────────

const PHASE_ORDER = ['pre_start', 'week_1', 'week_2', 'week_3_plus']
const PHASE_LABELS = {
  pre_start: 'Before Day One',
  week_1:    'Week 1',
  week_2:    'Week 2',
  week_3_plus: 'Week 3+',
}

const STATUS_STYLES = {
  pending:     { bg: 'rgba(148,163,184,0.12)', color: '#64748B' },
  in_progress: { bg: 'rgba(14,165,233,0.12)',  color: '#0EA5E9' },
  done:        { bg: 'rgba(22,163,74,0.12)',   color: '#16A34A' },
  blocked:     { bg: 'rgba(220,38,38,0.12)',   color: '#DC2626' },
}

const STATUS_OPTIONS = ['pending', 'in_progress', 'done', 'blocked']
const STATUS_LABELS  = { pending: 'Pending', in_progress: 'In Progress', done: 'Done', blocked: 'Blocked' }
const FILTER_OPTIONS = ['all', 'pending', 'in_progress', 'done', 'blocked']
const FILTER_LABELS  = { all: 'All', ...STATUS_LABELS }

const progressColor = (p) =>
  p === 100 ? '#16A34A' :
  p >= 76   ? '#3B5BDB' :
  p >= 51   ? '#0EA5E9' :
  p >= 26   ? '#D97706' : '#DC2626'

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, avatarColor, size = 32 }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'
  return (
    <div style={{
      width: size, height: size, borderRadius: '9999px',
      backgroundColor: avatarColor ?? '#3B5BDB',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 600, color: '#fff', flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-color)',
      borderRadius: 8, padding: '16px', marginBottom: 8,
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div className="animate-pulse" style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--border-color)', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="animate-pulse" style={{ height: 14, width: '60%', borderRadius: 4, background: 'var(--border-color)', marginBottom: 8 }} />
          <div className="animate-pulse" style={{ height: 12, width: '80%', borderRadius: 4, background: 'var(--border-color)', marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="animate-pulse" style={{ height: 22, width: 80, borderRadius: 9999, background: 'var(--border-color)' }} />
            <div className="animate-pulse" style={{ height: 22, width: 70, borderRadius: 9999, background: 'var(--border-color)' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', padding: '24px 16px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div className="animate-pulse" style={{ height: 14, width: 120, borderRadius: 4, background: 'var(--border-color)', marginBottom: 16 }} />
        <div className="animate-pulse" style={{ height: 32, width: '70%', borderRadius: 4, background: 'var(--border-color)', marginBottom: 8 }} />
        <div className="animate-pulse" style={{ height: 18, width: '40%', borderRadius: 4, background: 'var(--border-color)', marginBottom: 24 }} />
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, padding: 20, marginBottom: 24 }}>
          <div className="animate-pulse" style={{ height: 12, width: '40%', borderRadius: 4, background: 'var(--border-color)', marginBottom: 10 }} />
          <div className="animate-pulse" style={{ height: 10, borderRadius: 9999, background: 'var(--border-color)' }} />
        </div>
        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
      </div>
    </div>
  )
}

// ─── Due Date Pill ────────────────────────────────────────────────────────────
// FIX: backend returns `dueAt`, not `dueDate`

function DueDatePill({ dueAt, status }) {
  if (!dueAt || status === 'done') return null
  let d
  try { d = parseISO(dueAt) } catch { return null }

  let label, color
  if (isToday(d)) {
    label = 'Due today'; color = '#D97706'
  } else if (isPast(d)) {
    label = 'Overdue'; color = '#DC2626'
  } else {
    label = `Due ${format(d, 'MMM d')}`; color = '#64748B'
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 500, color,
      background: color === '#64748B' ? 'rgba(148,163,184,0.12)' : `${color}18`,
      padding: '2px 8px', borderRadius: 9999,
    }}>
      <CalendarDays size={10} />
      {label}
    </span>
  )
}

// ─── Status Icon ──────────────────────────────────────────────────────────────

function StatusIcon({ status }) {
  const sz = 18
  if (status === 'pending')     return <Clock size={sz} color="#64748B" />
  if (status === 'in_progress') return <Loader2 size={sz} color="#0EA5E9" className="animate-spin" />
  if (status === 'done')        return <CheckCircle2 size={sz} color="#16A34A" />
  if (status === 'blocked')     return <XCircle size={sz} color="#DC2626" />
  return null
}

// ─── Comment Section ──────────────────────────────────────────────────────────
// FIX: backend returns { id, author (string), authorColor (string), body, createdAt }
// Not { _id, author: { name, avatarColor } }

function CommentSection({ token, taskId }) {
  const queryClient = useQueryClient()
  const [body, setBody] = useState('')
  const [optimistic, setOptimistic] = useState([])

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['hire-comments', token, taskId],
    queryFn: () => hirePortalApi.getComments(token, taskId).then(r => r.data.data),
  })

  const postMutation = useMutation({
    mutationFn: (payload) => hirePortalApi.postComment(token, taskId, payload),
    onMutate: (payload) => {
      // Match the exact shape the backend returns so rendering is consistent
      const temp = {
        id: `opt-${Date.now()}`,
        author: 'You',
        authorColor: '#3B5BDB',
        body: payload.body,
        createdAt: new Date().toISOString(),
        _optimistic: true,
      }
      setOptimistic(prev => [...prev, temp])
      return temp
    },
    onSuccess: () => {
      setOptimistic([])
      queryClient.invalidateQueries({ queryKey: ['hire-comments', token, taskId] })
      queryClient.invalidateQueries({ queryKey: ['hire', token] })
    },
    onError: (_, __, ctx) => {
      setOptimistic(prev => prev.filter(c => c.id !== ctx.id))
      toast.error('Failed to post comment')
    },
  })

  const allComments = [...comments, ...optimistic]

  const handlePost = () => {
    if (!body.trim()) return
    postMutation.mutate({ body: body.trim() })
    setBody('')
  }

  return (
    <div style={{ borderTop: '1px solid var(--border-color)', marginTop: 12, paddingTop: 12 }}>
      {isLoading ? (
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '4px 0' }}>Loading comments…</div>
      ) : allComments.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '4px 0' }}>No comments yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
          {allComments.map(c => (
            // FIX: use c.id (not c._id); author is a plain string; color is c.authorColor
            <div key={c.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', opacity: c._optimistic ? 0.6 : 1 }}>
              <Avatar name={c.author ?? 'U'} avatarColor={c.authorColor} size={26} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {c.author ?? 'User'}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    {format(parseISO(c.createdAt), 'MMM d, h:mm a')}
                  </span>
                </div>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePost() }}
          placeholder="Add a comment…"
          rows={2}
          style={{
            flex: 1, resize: 'vertical', borderRadius: 6, border: '1px solid var(--border-color)',
            background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: 13,
            padding: '8px 10px', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5,
            minHeight: 60,
          }}
        />
        <button
          onClick={handlePost}
          disabled={!body.trim() || postMutation.isPending}
          style={{
            padding: '8px 14px', borderRadius: 6, border: 'none',
            cursor: body.trim() ? 'pointer' : 'not-allowed',
            background: body.trim() ? '#3B5BDB' : 'var(--border-color)',
            color: body.trim() ? '#fff' : 'var(--text-secondary)',
            fontSize: 13, fontWeight: 600, transition: 'background 0.15s',
            minHeight: 44, flexShrink: 0,
          }}
        >
          Post
        </button>
      </div>
    </div>
  )
}

// ─── Task Card ────────────────────────────────────────────────────────────────
// FIX: use task.id (not task._id) everywhere — backend shapes id: task._id
// FIX: pass task.id to CommentSection (not task._id)
// FIX: use task.dueAt (not task.dueDate) for DueDatePill

function TaskCard({ task, token }) {
  const queryClient = useQueryClient()
  const [expanded, setExpanded] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(task.status)
  const [blockedReason, setBlockedReason] = useState(task.blockedReason ?? '')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileRef = useRef()

  // FIX: use task.id — not task._id
  const updateMutation = useMutation({
    mutationFn: (data) => hirePortalApi.updateTask(token, task.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hire', token] })
    },
    onError: () => toast.error('Failed to update task'),
  })

  const handleStatusChange = (newStatus) => {
    if (newStatus === selectedStatus) return
    if (newStatus === 'done' && task.requiresUpload && (!task.attachments || task.attachments.length === 0)) {
      toast.error('Upload a file first before marking as done')
      return
    }
    setSelectedStatus(newStatus)
    if (newStatus === 'blocked') return // wait for reason input
    updateMutation.mutate({ status: newStatus })
  }

  const handleBlockedConfirm = () => {
    if (!blockedReason.trim()) {
      toast.error('Please provide a reason for blocking')
      return
    }
    updateMutation.mutate({ status: 'blocked', blockedReason: blockedReason.trim() })
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadProgress(0)
    try {
      // FIX: use task.id — not task._id
      const { data: signData } = await hirePortalApi.signUpload(token, task.id)
      const sig = signData.data
      console.log(sig);

      // FIX: correct field names from backend sign response:
      //   sig.sign            → Cloudinary 'signature' param
      //   sig.cloud_name      → Cloudinary cloud name in the URL
      //   sig.cloudinary_api_key → Cloudinary 'api_key' param
      //   sig.allowed_formats → must be included (it was part of the signature)
      //   sig.folder          → must be included (it was part of the signature)
      //   sig.timestamp       → must be included (it was part of the signature)
      //   VITE_CLOUDINARY_UPLOAD_PRESET → must be included if backend signed with it

      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', sig.cloudinary_api_key)
      formData.append('timestamp', sig.timestamp)
      formData.append('signature', sig.sign)
      formData.append('folder', sig.folder)
      formData.append('allowed_formats', sig.allowed_formats)

      // upload_preset was included in the backend signature string — must match
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      if (uploadPreset) formData.append('upload_preset', uploadPreset)

      const xhr = new XMLHttpRequest()
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100))
      }

      const result = await new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) resolve(JSON.parse(xhr.responseText))
          else reject(new Error(`Cloudinary upload failed: ${xhr.responseText}`))
        }
        xhr.onerror = () => reject(new Error('Upload failed'))
        // FIX: sig.cloud_name — not sig.cloudName
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloud_name}/upload`)
        xhr.send(formData)
      })

      const ext = file.name.split('.').pop().toLowerCase()
      const mimeMap = {
        pdf: 'application/pdf',
        jpg: 'image/jpeg', jpeg: 'image/jpeg',
        png: 'image/png', gif: 'image/gif',
        mp4: 'video/mp4',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      }
      const mimeType = mimeMap[ext] ?? (result.resource_type === 'image' ? 'image/jpeg' : 'application/octet-stream')

      // FIX: use task.id — not task._id
      await hirePortalApi.updateTask(token, task.id, {
        attachment: {
          url: result.secure_url,
          fileName: result.original_filename ?? file.name,
          sizeBytes: result.bytes,
          mimeType,
        },
      })

      toast.success('File uploaded successfully')
      queryClient.invalidateQueries({ queryKey: ['hire', token] })
    } catch (err) {
      console.error(err)
      toast.error('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const s = STATUS_STYLES[task.status]
  const isDone = task.status === 'done'
  const hasDesc = !!task.description

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-color)',
      borderRadius: 8, padding: '14px 16px', marginBottom: 8,
      transition: 'box-shadow 0.15s',
    }}>
      {/* Main row */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ marginTop: 2, flexShrink: 0 }}>
          <StatusIcon status={task.status} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0, fontSize: 14, fontWeight: 600,
            color: 'var(--text-primary)',
            textDecoration: isDone ? 'line-through' : 'none',
            opacity: isDone ? 0.6 : 1,
          }}>
            {task.title}
          </p>

          {/* Description */}
          {hasDesc && (
            <div style={{ marginTop: 4 }}>
              <p style={{
                margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5,
                display: '-webkit-box', WebkitBoxOrient: 'vertical',
                WebkitLineClamp: expanded ? 'unset' : 2, overflow: 'hidden',
              }}>
                {task.description}
              </p>
              {task.description.length > 80 && (
                <button
                  onClick={() => setExpanded(p => !p)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', fontSize: 12, color: '#3B5BDB', fontWeight: 500 }}
                >
                  {expanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          )}

          {/* Meta row */}
          {/* FIX: pass dueAt (not dueDate) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, alignItems: 'center' }}>
            <DueDatePill dueAt={task.dueAt} status={task.status} />
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999,
              background: s.bg, color: s.color,
            }}>
              {STATUS_LABELS[task.status]}
            </span>
          </div>

          {/* Blocked reason */}
          {task.status === 'blocked' && task.blockedReason && (
            <div style={{
              marginTop: 8, padding: '8px 12px', borderRadius: 6,
              background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)',
              fontSize: 12, color: '#DC2626', lineHeight: 1.5,
            }}>
              <strong>Blocked:</strong> {task.blockedReason}
            </div>
          )}

          {/* Attachments — shown even when done */}
          {task.requiresUpload && task.attachments?.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {task.attachments.map((att, i) => (
                <a
                  key={i}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 12, color: '#3B5BDB', textDecoration: 'none',
                  }}
                >
                  <Paperclip size={12} />
                  {att.fileName}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Status selector */}
        <div>
          <p style={{ margin: '0 0 6px', fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Update status
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {STATUS_OPTIONS.map(opt => {
              const ss = STATUS_STYLES[opt]
              const active = selectedStatus === opt
              return (
                <button
                  key={opt}
                  onClick={() => handleStatusChange(opt)}
                  disabled={updateMutation.isPending}
                  style={{
                    padding: '5px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 600,
                    border: active ? `2px solid ${ss.color}` : '2px solid transparent',
                    background: active ? ss.bg : 'var(--bg-app)',
                    color: active ? ss.color : 'var(--text-secondary)',
                    cursor: updateMutation.isPending ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s', minHeight: 32,
                  }}
                >
                  {STATUS_LABELS[opt]}
                </button>
              )
            })}
          </div>

          {/* Blocked reason input — shown only when switching TO blocked */}
          {selectedStatus === 'blocked' && task.status !== 'blocked' && (
            <div style={{ marginTop: 8 }}>
              <input
                type="text"
                placeholder="Reason for blocking (required)"
                value={blockedReason}
                onChange={e => setBlockedReason(e.target.value)}
                style={{
                  width: '100%', borderRadius: 6, border: '1px solid var(--border-color)',
                  background: 'var(--bg-app)', color: 'var(--text-primary)',
                  fontSize: 13, padding: '8px 10px', outline: 'none', fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <button
                  onClick={handleBlockedConfirm}
                  disabled={!blockedReason.trim() || updateMutation.isPending}
                  style={{
                    padding: '6px 14px', borderRadius: 6, border: 'none',
                    background: '#DC2626', color: '#fff', fontSize: 12, fontWeight: 600,
                    cursor: blockedReason.trim() ? 'pointer' : 'not-allowed', minHeight: 32,
                    opacity: blockedReason.trim() ? 1 : 0.5,
                  }}
                >
                  Confirm
                </button>
                <button
                  onClick={() => { setSelectedStatus(task.status); setBlockedReason('') }}
                  style={{
                    padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border-color)',
                    background: 'transparent', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', minHeight: 32,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* File upload — only when requiresUpload and task not yet done */}
        {task.requiresUpload && !isDone && (
          <div>
            <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border-color)',
                background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 500,
                cursor: uploading ? 'not-allowed' : 'pointer', minHeight: 36, transition: 'background 0.15s',
              }}
            >
              <Paperclip size={14} />
              {uploading ? `Uploading… ${uploadProgress}%` : 'Upload file'}
            </button>
            {uploading && (
              <div style={{ marginTop: 6, height: 4, borderRadius: 9999, background: 'var(--border-color)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${uploadProgress}%`, background: '#3B5BDB', borderRadius: 9999, transition: 'width 0.2s' }} />
              </div>
            )}
          </div>
        )}

        {/* Comments toggle */}
        {/* FIX: pass task.id (not task._id) to CommentSection */}
        <button
          onClick={() => setCommentsOpen(p => !p)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 0', background: 'none', border: 'none',
            cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500,
            width: 'fit-content',
          }}
        >
          <MessageCircle size={14} />
          Comments{task.commentCount > 0 ? ` (${task.commentCount})` : ''}
          {commentsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {commentsOpen && <CommentSection token={token} taskId={task.id} />}
      </div>
    </div>
  )
}

// ─── Completion Banner ────────────────────────────────────────────────────────

function CompletionBanner({ status }) {
  return (
    <div style={{
      background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.3)',
      borderRadius: 12, padding: '24px 20px', textAlign: 'center',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'rgba(22,163,74,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <CheckCircle2 size={30} color="#16A34A" />
        </div>
      </div>
      <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#16A34A' }}>
        You're all done! 🎉
      </h3>
      <p style={{ margin: '0 0 8px', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        You've completed all your onboarding tasks. Your team is still wrapping up a few things —
        we'll let you know when everything is ready.
      </p>
      {status && (
        <span style={{
          display: 'inline-block', padding: '3px 10px', borderRadius: 9999,
          background: 'rgba(22,163,74,0.12)', color: '#16A34A', fontSize: 12, fontWeight: 600,
        }}>
          Onboarding status: {status.replace(/_/g, ' ')}
        </span>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HirePortalPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')

  const { data, isLoading, error } = useQuery({
    queryKey: ['hire', token],
    queryFn: () => hirePortalApi.getOnboarding(token).then(r => r.data.data),
    retry: false,
  })

  if (error) {
    const status = error.response?.status
    const reason = error.response?.data?.error ?? 'Something went wrong'
    if (status === 404 || status === 410) {
      navigate('/hire/error', { state: { reason, status } })
      return null
    }
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Something went wrong. Please try again.</p>
      </div>
    )
  }

  if (isLoading || !data) return <PageSkeleton />

  const {
    newHireName, job, status, startDate,
    newHireProgressPercent = 0,
    organizationName, manager, managerEmail, managerAvatarColor,
    tasks = [],
  } = data

  // FIX: backend does NOT return newHireDoneStatus — derive from progress
  const newHireDoneStatus = newHireProgressPercent === 100

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)

  const groupedByPhase = PHASE_ORDER.reduce((acc, phase) => {
    const phaseTasks = filteredTasks.filter(t => t.phase === phase)
    if (phaseTasks.length > 0) acc[phase] = phaseTasks
    return acc
  }, {})

  const pColor = progressColor(newHireProgressPercent)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', padding: '24px 16px 60px' }}>
      <style>{`
        @keyframes scaleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .hire-task-card { animation: fadeIn 0.2s ease; }
        @media (prefers-reduced-motion: reduce) {
          .animate-spin, .animate-pulse, .hire-task-card { animation: none !important; }
        }
      `}</style>

      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Org name */}
        {organizationName && (
          <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {organizationName}
          </p>
        )}

        {/* Welcome heading */}
        <h1 style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
          Welcome, {newHireName}!
        </h1>
        {job && (
          <p style={{ margin: '0 0 20px', fontSize: 15, color: 'var(--text-secondary)', fontWeight: 500 }}>
            {job}
          </p>
        )}

        {/* Meta row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 24 }}>
          {startDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CalendarDays size={14} color="var(--text-secondary)" />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Starting {format(parseISO(startDate), 'MMMM d, yyyy')}
              </span>
            </div>
          )}
          {manager && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar name={manager} avatarColor={managerAvatarColor} size={24} />
              <div>
                <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{manager}</span>
                {managerEmail && (
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 6 }}>{managerEmail}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Status banners */}
        {status === 'cancelled' && (
          <div style={{
            marginBottom: 20, padding: '12px 16px', borderRadius: 8,
            background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)',
            fontSize: 13, color: '#DC2626', fontWeight: 500,
          }}>
            This onboarding has been cancelled. Please contact your manager.
          </div>
        )}
        {status === 'completed' && !newHireDoneStatus && (
          <div style={{
            marginBottom: 20, padding: '12px 16px', borderRadius: 8,
            background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.25)',
            fontSize: 13, color: '#16A34A', fontWeight: 500,
          }}>
            Onboarding complete! Welcome to the team 🎉
          </div>
        )}

        {/* Progress / completion */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: 8, padding: '16px 20px', marginBottom: 24,
        }}>
          {newHireDoneStatus ? (
            <CompletionBanner status={status} />
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Your onboarding progress
                </p>
                <span style={{ fontSize: 15, fontWeight: 700, color: pColor }}>
                  {newHireProgressPercent}%
                </span>
              </div>
              <div style={{ height: 10, borderRadius: 9999, background: 'var(--border-color)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${newHireProgressPercent}%`,
                  background: pColor, borderRadius: 9999, transition: 'width 0.5s ease',
                }} />
              </div>
            </>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 20, scrollbarWidth: 'none' }}>
          {FILTER_OPTIONS.map(f => {
            const active = filter === f
            const ss = f !== 'all' ? STATUS_STYLES[f] : null
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  flexShrink: 0, padding: '6px 14px', borderRadius: 9999,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  border: active ? `2px solid ${f === 'all' ? '#3B5BDB' : ss.color}` : '2px solid var(--border-color)',
                  background: active ? (f === 'all' ? 'rgba(59,91,219,0.10)' : ss.bg) : 'var(--bg-card)',
                  color: active ? (f === 'all' ? '#3B5BDB' : ss.color) : 'var(--text-secondary)',
                  transition: 'all 0.15s', minHeight: 32,
                }}
              >
                {FILTER_LABELS[f]}
              </button>
            )
          })}
        </div>

        {/* Task list grouped by phase */}
        {Object.keys(groupedByPhase).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontSize: 14 }}>
            No tasks match this filter.
          </div>
        ) : (
          PHASE_ORDER.filter(p => groupedByPhase[p]).map(phase => {
            const phaseTasks = groupedByPhase[phase]
            const activeCount = phaseTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length

            return (
              <div key={phase} style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {PHASE_LABELS[phase]}
                  </h2>
                  {activeCount > 0 && (
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 9999,
                      background: 'rgba(59,91,219,0.12)', color: '#3B5BDB',
                    }}>
                      {activeCount}
                    </span>
                  )}
                </div>
                {/* FIX: use task.id as React key (not task._id) */}
                {phaseTasks.map(task => (
                  <div key={task.id} className="hire-task-card">
                    <TaskCard task={task} token={token} />
                  </div>
                ))}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
