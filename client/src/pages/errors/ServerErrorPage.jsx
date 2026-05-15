import { Link } from 'react-router-dom';
import Icon from '../../components/Icon';
import Button from '../../components/ui/Button';

export default function ServerErrorPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-md">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-error-container/20 rounded-full flex items-center justify-center mx-auto mb-xl">
          <Icon name="cloud_off" size={48} className="text-error" />
        </div>
        <p className="text-label-md text-error uppercase tracking-widest mb-sm font-bold">500</p>
        <h1 className="text-headline-xl text-on-surface mb-md">Something went wrong</h1>
        <p className="text-body-lg text-on-surface-variant mb-xl">
          We're having trouble loading this page. Our team has been notified. Please try again or contact support.
        </p>
        <div className="flex flex-col sm:flex-row gap-sm justify-center">
          <Button size="lg" onClick={() => window.location.reload()}>
            <Icon name="refresh" size={18} />
            Reload Page
          </Button>
          <Link to="/dashboard">
            <Button variant="secondary" size="lg">
              <Icon name="home" size={18} />
              Go to Dashboard
            </Button>
          </Link>
        </div>
        <p className="mt-xl text-label-md text-on-surface-variant">
          Need help?{' '}
          <a href="mailto:support@columbushr.com" className="text-primary hover:underline">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
