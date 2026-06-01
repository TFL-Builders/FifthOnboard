const STATUS_STYLES = {
  // Onboarding statuses
  active:    { label: 'Active',      bg: 'rgba(34,197,94,0.10)',   color: '#16a34a' },
  completed: { label: 'Completed',   bg: 'rgba(59,130,246,0.10)',  color: '#2563eb' },
  archived:  { label: 'Archived',    bg: 'rgba(100,116,139,0.10)', color: '#475569' },
  cancelled: { label: 'Cancelled',   bg: 'rgba(239,68,68,0.10)',   color: '#dc2626' },
  // Task statuses
  pending:    { label: 'Pending',    bg: 'rgba(100,116,139,0.10)', color: '#475569' },
  in_progress:{ label: 'In Progress',bg: 'rgba(59,130,246,0.10)',  color: '#2563eb' },
  done:       { label: 'Done',       bg: 'rgba(34,197,94,0.10)',   color: '#16a34a' },
  blocked:    { label: 'Blocked',    bg: 'rgba(239,68,68,0.10)',   color: '#dc2626' },
}

export { STATUS_STYLES }

export default function StatusChip({ status }) {
  const s = STATUS_STYLES[status] ?? { label: status, bg: 'rgba(100,116,139,0.10)', color: '#475569' }
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  )
}
