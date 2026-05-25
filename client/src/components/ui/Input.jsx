import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

const Input = forwardRef(function Input(
  { label, error, helperText, className, id, ...props },
  ref,
) {
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
      <input
        ref={ref}
        id={id}
        className={cn(
          'flex w-full h-[38px] rounded-[8px] border bg-transparent px-3 text-[14px]',
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
        aria-describedby={
          error ? `${id}-error` : helperText ? `${id}-helper` : undefined
        }
        {...props}
      />
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
      {!error && helperText && (
        <p
          id={`${id}-helper`}
          className="text-[12px]"
          style={{ color: 'var(--text-secondary)' }}
        >
          {helperText}
        </p>
      )}
    </div>
  )
})

export default Input
