import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'

const MESSAGES = {
  noManager: 'No manager has been assigned to this onboarding.',
  unassignedTasks: 'Some tasks have no assignee and may be missed.',
}

export default function WarningBadge({ type }) {
  const [show, setShow] = useState(false)
  const message = MESSAGES[type] ?? 'Warning'

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        aria-label={message}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        style={{ backgroundColor: 'rgba(217,119,6,0.10)', color: '#d97706' }}
      >
        <AlertTriangle size={11} aria-hidden="true" />
        <span className="text-[11px] font-medium">
          {type === 'noManager' ? 'No manager' : 'Unassigned tasks'}
        </span>
      </button>

      {show && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-[220px] rounded-[8px] px-3 py-2 text-[12px] leading-relaxed pointer-events-none"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          }}
          role="tooltip"
        >
          {message}
        </div>
      )}
    </div>
  )
}
