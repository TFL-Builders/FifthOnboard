import { cn } from '../../utils/cn';

const VARIANTS = {
  'in-progress': 'bg-[#c9e6ff] text-[#004c6e]',
  overdue:       'bg-error-container text-error',
  completed:     'bg-secondary/10 text-secondary',
  pending:       'bg-surface-container-highest text-on-surface-variant',
  blocked:       'bg-error-container text-on-error-container',
  done:          'bg-green-100 text-green-700',
  active:        'bg-green-100 text-green-800',
  invited:       'bg-amber-100 text-amber-800',
  'new-hire':    'bg-primary-fixed text-on-primary-fixed',
  admin:         'bg-primary/10 text-primary',
  manager:       'bg-secondary/10 text-secondary',
  member:        'bg-surface-container-high text-on-surface-variant',
  standard:      'bg-secondary-container/20 text-secondary',
  mandatory:     'bg-error-container text-on-error-container',
};

export default function Badge({ variant = 'pending', children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-sm py-[2px] rounded-full text-[11px] font-bold uppercase tracking-wider',
        VARIANTS[variant] ?? VARIANTS.pending,
        className,
      )}
    >
      {children}
    </span>
  );
}
