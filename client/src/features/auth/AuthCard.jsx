export default function AuthCard({ title, description, children }) {
  return (
    <div
      className="rounded-[8px] border px-7 py-7"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div className="mb-6">
        <h1
          className="text-[24px] font-semibold leading-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}
