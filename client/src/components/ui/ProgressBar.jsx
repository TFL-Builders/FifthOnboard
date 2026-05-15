import { cn } from '../../utils/cn';

export default function ProgressBar({ value = 0, error = false, className }) {
  const clamp = Math.min(100, Math.max(0, value));
  return (
    <div className={cn('flex items-center gap-sm', className)}>
      <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', error ? 'bg-error' : 'bg-primary')}
          style={{ width: `${clamp}%` }}
        />
      </div>
      <span className="text-[11px] font-mono text-on-surface-variant w-[30px] text-right">{clamp}%</span>
    </div>
  );
}
