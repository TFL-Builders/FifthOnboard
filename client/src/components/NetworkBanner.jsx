import { useState, useEffect } from 'react';
import Icon from './Icon';

export default function NetworkBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    const goOffline = () => { setOffline(true); setShowRetry(false); };
    const goOnline  = () => { setOffline(false); };
    window.addEventListener('offline', goOffline);
    window.addEventListener('online',  goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online',  goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed top-[56px] left-0 right-0 z-50 bg-error-container border-b border-error/20 px-margin py-sm flex items-center justify-between gap-md">
      <div className="flex items-center gap-sm">
        <Icon name="wifi_off" size={18} className="text-error flex-shrink-0" />
        <span className="text-body-md text-on-error-container">
          You're offline — some features may be unavailable.
        </span>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="text-label-md font-semibold text-error hover:underline flex-shrink-0"
      >
        Retry
      </button>
    </div>
  );
}
