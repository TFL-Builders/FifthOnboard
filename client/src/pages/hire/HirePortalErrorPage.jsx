import { useLocation } from 'react-router-dom'
import { LinkIcon, AlertTriangle } from 'lucide-react'

export default function HirePortalErrorPage() {
  const { state } = useLocation()
  const { reason, status, manager, managerEmail } = state ?? {}

  const title =
    status === 410 ? 'Your invite link has expired' :
    status === 404 ? 'Invite link not found' :
    'Something went wrong'

  const description =
    status === 410 ? 'This portal link has expired. Please contact your manager to get a new one.' :
    status === 404 ? 'This invite link is invalid or has already been used.' :
    reason ?? 'An unexpected error occurred. Please try again or contact your manager.'

  const isExpired = status === 410

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-app)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>

        {/* Icon */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 72, height: 72, borderRadius: '50%',
          background: isExpired ? 'rgba(217,119,6,0.10)' : 'rgba(220,38,38,0.10)',
          marginBottom: 24,
        }}>
          {isExpired
            ? <LinkIcon size={32} color="#D97706" />
            : <AlertTriangle size={32} color="#DC2626" />
          }
        </div>

        {/* Title */}
        <h1 style={{
          margin: '0 0 12px', fontSize: 24, fontWeight: 800,
          color: 'var(--text-primary)', lineHeight: 1.2,
        }}>
          {title}
        </h1>

        {/* Description */}
        <p style={{
          margin: '0 0 28px', fontSize: 15, color: 'var(--text-secondary)',
          lineHeight: 1.6,
        }}>
          {description}
        </p>

        {/* Manager contact */}
        {(manager || managerEmail) && (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: 8, padding: '16px 20px',
          }}>
            <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Contact your manager
            </p>
            {manager && (
              <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                {manager}
              </p>
            )}
            {managerEmail && (
              <a
                href={`mailto:${managerEmail}`}
                style={{ fontSize: 14, color: '#3B5BDB', textDecoration: 'none', fontWeight: 500 }}
              >
                {managerEmail}
              </a>
            )}
          </div>
        )}

        {/* Fallback hint */}
        {!manager && !managerEmail && (
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Please reach out to your manager or HR team directly.
          </p>
        )}
      </div>
    </div>
  )
}
