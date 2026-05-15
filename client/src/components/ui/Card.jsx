import { cn } from '../../utils/cn';

export default function Card({ className, children, ...props }) {
  return (
    <div
      className={cn('bg-surface-container-lowest border border-outline-variant rounded-xl', className)}
      {...props}
    >
      {children}
    </div>
  );
}
