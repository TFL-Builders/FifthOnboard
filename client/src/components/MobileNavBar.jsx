import { NavLink } from 'react-router-dom';
import Icon from './Icon';

const ITEMS = [
  { to: '/dashboard',   icon: 'dashboard',  label: 'Home' },
  { to: '/onboardings', icon: 'person_add', label: 'Onboard' },
  { to: '/my-tasks',    icon: 'assignment', label: 'Tasks' },
  { to: '/settings',    icon: 'settings',   label: 'Settings' },
];

export default function MobileNavBar() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-surface-container-lowest border-t border-outline-variant flex items-center justify-around z-50 shadow-bottom pb-safe">
      {ITEMS.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-[2px] px-sm py-xs transition-colors ${
              isActive ? 'text-primary' : 'text-on-surface-variant'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon name={icon} size={22} filled={isActive} />
              <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
