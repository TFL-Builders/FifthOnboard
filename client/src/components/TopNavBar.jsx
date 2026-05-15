import { Link, useNavigate } from 'react-router-dom';
import Icon from './Icon';
import useAuthStore from '../stores/authStore';
import useUiStore from '../stores/uiStore';
import { useState, useRef, useEffect } from 'react';

export default function TopNavBar() {
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUiStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = user
    ? (user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')
    : 'U';

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-margin bg-surface-container-lowest border-b border-outline-variant h-[56px]">
      {/* Left: logo + mobile hamburger */}
      <div className="flex items-center gap-md">
        <button
          className="md:hidden p-xs rounded text-on-surface-variant hover:bg-surface-container-low transition-colors"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <Icon name="menu" size={22} />
        </button>
        <Link to="/dashboard" className="flex items-center gap-sm">
          <div className="w-7 h-7 bg-primary-container rounded-md flex items-center justify-center">
            <Icon name="explore" className="text-on-primary" size={18} />
          </div>
          <span className="text-headline-md font-bold text-primary">Columbus</span>
        </Link>
      </div>

      {/* Right: notifications, help, avatar */}
      <div className="flex items-center gap-sm">
        <button className="p-xs rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors hidden sm:flex">
          <Icon name="notifications" size={22} />
        </button>
        <button className="p-xs rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors hidden sm:flex">
          <Icon name="help" size={22} />
        </button>

        {/* Avatar dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs border border-outline-variant overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-xs font-semibold">{initials}</span>
            )}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 w-48 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-float py-xs z-50">
              <div className="px-md py-sm border-b border-outline-variant">
                <p className="text-body-md font-semibold text-on-surface truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-label-md text-on-surface-variant truncate">{user?.email}</p>
              </div>
              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-sm px-md py-sm text-body-md text-on-surface hover:bg-surface-container-low transition-colors"
              >
                <Icon name="settings" size={18} className="text-on-surface-variant" />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-sm px-md py-sm text-body-md text-error hover:bg-error-container/20 transition-colors"
              >
                <Icon name="logout" size={18} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
