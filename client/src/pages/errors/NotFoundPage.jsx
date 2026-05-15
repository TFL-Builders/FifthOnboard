import { Link } from 'react-router-dom';
import Icon from '../../components/Icon';
import Button from '../../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-md">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-primary/8 rounded-full flex items-center justify-center mx-auto mb-xl">
          <Icon name="search_off" size={48} className="text-primary" />
        </div>
        <p className="text-label-md text-primary uppercase tracking-widest mb-sm font-bold">404</p>
        <h1 className="text-headline-xl text-on-surface mb-md">Page not found</h1>
        <p className="text-body-lg text-on-surface-variant mb-xl">
          The page you're looking for doesn't exist or has been moved.
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
