import { cn } from '../../utils/cn'

export default function Spinner({ size = 'default', className }) {
  const sizes = {
    sm: 'h-3.5 w-3.5',
    default: 'h-5 w-5',
    lg: 'h-8 w-8',
  }

  return (
    <svg
      className={cn('animate-spin', sizes[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
