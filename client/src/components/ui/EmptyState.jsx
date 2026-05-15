import Icon from '../Icon';
import Button from './Button';

export default function EmptyState({ icon, title, description, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center text-center p-xxl bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-xl">
      <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-md text-outline">
        <Icon name={icon} size={40} />
      </div>
      <h3 className="text-headline-md text-on-surface">{title}</h3>
      {description && (
        <p className="text-body-md text-on-surface-variant mt-xs mb-lg max-w-xs">{description}</p>
      )}
      {action && actionLabel && (
        <Button onClick={action}>{actionLabel}</Button>
      )}
    </div>
  );
}
