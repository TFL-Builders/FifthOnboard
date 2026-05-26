import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '../../utils/cn'

const PasswordInput = forwardRef(function PasswordInput(
  { label, error, id, className, ...props },
  ref,
) {
  const [show, setShow] = useState(false)

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={id}
          className="block text-[12px] font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={show ? 'text' : 'password'}
          className={cn(
            'flex w-full h-[38px] rounded-[8px] border bg-transparent pl-3 pr-10 text-[14px]',
            'transition-colors placeholder:opacity-50',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:border-primary',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-danger focus:ring-danger focus:border-danger'
              : 'border-[var(--border-color)]',
            className,
          )}
          style={{ color: 'var(--text-primary)' }}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:opacity-80"
          style={{ color: 'var(--text-secondary)' }}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? (
            <EyeOff size={16} aria-hidden="true" />
          ) : (
            <Eye size={16} aria-hidden="true" />
          )}
        </button>
      </div>
      {error && (
        <p
          id={`${id}-error`}
          className="text-[12px] text-danger"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  )
})

export default PasswordInput
