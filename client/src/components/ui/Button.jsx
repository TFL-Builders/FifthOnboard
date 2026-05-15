import { cn } from '../../utils/cn';

const BASE = 'inline-flex items-center justify-center gap-sm font-semibold text-label-md rounded-lg transition-all duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

const VARIANTS = {
  primary:   'bg-primary text-on-primary hover:bg-[#2F4BC4] focus:ring-primary shadow-sm',
  secondary: 'bg-white border border-outline-variant text-on-surface hover:bg-surface-container-low focus:ring-outline',
  ghost:     'text-primary hover:bg-primary/8 focus:ring-primary',
  danger:    'bg-white border border-error text-error hover:bg-error-container/20 focus:ring-error',
  indigo:    'bg-primary-container text-on-primary hover:bg-primary focus:ring-primary shadow-sm',
};

const SIZES = {
  sm:  'h-8 px-md text-label-md',
  md:  'h-10 px-lg text-label-md',
  lg:  'h-12 px-xl text-body-md',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
