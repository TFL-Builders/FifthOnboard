import { Outlet, Link } from 'react-router-dom';
import Icon from './Icon';
import NetworkBanner from './NetworkBanner';

export default function PortalLayout() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Minimal portal nav */}
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-margin bg-surface-container-lowest border-b border-outline-variant h-[56px]">
        <div className="flex items-center gap-sm">
          <div className="w-7 h-7 bg-primary-container rounded-md flex items-center justify-center">
            <Icon name="explore" className="text-on-primary" size={16} />
          </div>
          <span className="text-headline-md font-bold text-primary">Columbus</span>
        </div>
        <div className="flex items-center gap-sm">
          <button className="p-xs rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors">
            <Icon name="help" size={22} />
          </button>
          <button className="p-xs rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors">
            <Icon name="notifications" size={22} />
          </button>
        </div>
      </nav>

      <NetworkBanner />

      <main className="pt-[56px] min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
