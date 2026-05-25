import { cn } from '../../utils/cn'
import Spinner from './Spinner'

export default function Button({
  variant = 'primary',
  size = 'default',
  loading = false,
  disabled = false,
  children,
  className,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center font-medium transition-colors ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ' +
    'disabled:pointer-events-none disabled:opacity-50 cursor-pointer'

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover rounded-[6px]',
    secondary:
      'border bg-transparent hover:opacity-80 rounded-[6px]',
    ghost: 'bg-transparent hover:opacity-70 rounded-[6px]',
  }

  const sizes = {
    default: 'h-[36px] px-4 text-[14px]',
    sm: 'h-[28px] px-3 text-[12px]',
    lg: 'h-[44px] px-6 text-[14px]',
  }

  const secondaryStyle =
    variant === 'secondary'
      ? { borderColor: 'var(--border-color)', color: 'var(--text-primary)' }
      : {}
  const ghostStyle =
    variant === 'ghost' ? { color: 'var(--text-primary)' } : {}

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      style={{ ...secondaryStyle, ...ghostStyle }}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size="sm" className="mr-2" />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  )
}
