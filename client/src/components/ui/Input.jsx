import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Input = forwardRef(({ label, error, hint, className, id, ...props }, ref) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-xs">
      {label && (
        <label htmlFor={inputId} className="text-label-md text-on-surface-variant">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'w-full h-12 px-md bg-white border rounded-lg text-body-md placeholder:text-outline-variant',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all',
          error
            ? 'border-error focus:ring-error'
            : 'border-outline-variant',
          className,
        )}
        {...props}
      />
      {error  && <p className="text-label-md text-error">{error}</p>}
      {!error && hint && <p className="text-label-md text-on-surface-variant">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
