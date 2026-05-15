import { NavLink, useLocation } from 'react-router-dom';
import Icon from './Icon';
import useUiStore from '../stores/uiStore';
import useAuthStore from '../stores/authStore';

const NAV_ITEMS = [
  { to: '/dashboard',   icon: 'dashboard',   label: 'Dashboard' },
  { to: '/onboardings', icon: 'person_add',  label: 'Onboardings' },
  { to: '/templates',   icon: 'description', label: 'Templates' },
  { to: '/people',      icon: 'group',       label: 'People' },
  { to: '/my-tasks',    icon: 'assignment',  label: 'My Tasks' },
];

function NavItem({ to, icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-md px-md py-sm rounded-lg text-label-md font-medium transition-all duration-150 ${
          isActive
            ? 'text-primary font-semibold bg-primary/8 scale-[0.98]'
            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon name={icon} size={20} filled={isActive} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function SideNavBar() {
  const { sidebarOpen, setSidebarOpen } = useUiStore();
  const { user } = useAuthStore();

  function close() { setSidebarOpen(false); }

  const sidebarContent = (
    <div className="flex flex-col h-full p-md gap-sm">
      {/* Org identity */}
      <div className="flex items-center gap-sm px-sm py-md mb-sm">
        <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon name="corporate_fare" className="text-on-primary" size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-label-md font-bold text-on-surface truncate">
            {user?.organizationName ?? 'Your Organization'}
          </p>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">HR Administration</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-xs flex-1">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} onClick={close} />
        ))}

        <div className="mt-auto pt-md border-t border-outline-variant">
          <NavItem to="/settings" icon="settings" label="Settings" onClick={close} />
        </div>
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-[56px] bottom-0 w-[240px] flex-col bg-surface-container-low border-r border-outline-variant z-40">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={close}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`md:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-surface-container-lowest border-r border-outline-variant z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-md h-[56px] border-b border-outline-variant">
          <div className="flex items-center gap-sm">
            <div className="w-7 h-7 bg-primary-container rounded-md flex items-center justify-center">
              <Icon name="explore" className="text-on-primary" size={16} />
            </div>
            <span className="text-headline-md font-bold text-primary">Columbus</span>
          </div>
          <button onClick={close} className="p-xs rounded text-on-surface-variant hover:bg-surface-container-low">
            <Icon name="close" size={20} />
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
}
