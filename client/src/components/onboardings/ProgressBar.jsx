function progressColor(pct) {
  if (pct >= 80) return '#16a34a'
  if (pct >= 50) return '#2563eb'
  if (pct >= 20) return '#d97706'
  return '#dc2626'
}

export default function ProgressBar({ percent = 0, height = 6, showLabel = false }) {
  const pct = Math.min(100, Math.max(0, percent))
  const color = progressColor(pct)
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-[12px] font-medium tabular-nums" style={{ color }}>
            {pct}%
          </span>
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height, backgroundColor: 'var(--border-color)' }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${pct}% complete`}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
