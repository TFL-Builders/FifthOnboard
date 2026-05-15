import { Link } from 'react-router-dom';
import Icon from '../../components/Icon';
import Button from '../../components/ui/Button';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-md">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-error/8 rounded-full flex items-center justify-center mx-auto mb-xl">
          <Icon name="lock" size={48} className="text-error" />
        </div>
        <p className="text-label-md text-error uppercase tracking-widest mb-sm font-bold">403</p>
        <h1 className="text-headline-xl text-on-surface mb-md">Access denied</h1>
        <p className="text-body-lg text-on-surface-variant mb-xl">
          You don't have permission to view this page. Contact your administrator if you believe this is a mistake.
        </p>
        <div className="flex flex-col sm:flex-row gap-sm justify-center">
          <Link to="/dashboard">
            <Button size="lg">
              <Icon name="home" size={18} />
              Go to Dashboard
            </Button>
          </Link>
          <Button variant="secondary" size="lg" onClick={() => window.history.back()}>
            <Icon name="arrow_back" size={18} />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
