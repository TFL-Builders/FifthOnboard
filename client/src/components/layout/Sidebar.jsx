import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FileText,
  UserCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
} from 'lucide-react'
import useAuthStore from '../../stores/authStore'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#3b5bdb','#1098ad','#0ca678','#f59f00','#e64980','#7950f2','#f76707','#2f9e44',
]

function avatarColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

function roleLabel(role) {
  if (role === 'hr') return 'HR'
  if (role === 'admin') return 'Admin'
  if (role === 'manager') return 'Manager'
  if (role === 'task_owner') return 'Task Owner'
  if (role === 'employee') return 'Employee'
  return role ?? ''
}

// ─────────────────────────────────────────────────────────────────────────────
// Nav items config
// ─────────────────────────────────────────────────────────────────────────────

const NAV_ALL = [
  { label: 'Dashboard',   to: '/dashboard',   Icon: LayoutDashboard },
  { label: 'Onboardings', to: '/onboardings',  Icon: Users           },
]

const NAV_HR_ADMIN = [
  { label: 'Templates',   to: '/templates',   Icon: FileText  },
  { label: 'People',      to: '/people',      Icon: UserCheck },
  { label: 'Settings',    to: '/settings',    Icon: Settings  },
]

const NAV_TASK_OWNER = [
  { label: 'My Tasks', to: '/my-tasks', Icon: CheckSquare },
]

// ─────────────────────────────────────────────────────────────────────────────
// NavItem
// ─────────────────────────────────────────────────────────────────────────────

function NavItem({ to, Icon, label, collapsed }) {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        [
          'relative flex items-center gap-3 h-10 rounded-[6px] cursor-pointer',
          'transition-colors duration-200 select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
          collapsed ? 'justify-center px-0' : 'px-3',
          isActive
            ? 'border-l-2 border-primary text-primary'
            : 'text-[var(--text-secondary)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] border-l-2 border-transparent',
        ].join(' ')
      }
      style={({ isActive }) =>
        isActive
          ? { backgroundColor: 'rgba(59,91,219,0.08)', color: 'var(--color-primary)' }
          : undefined
      }
      aria-label={label}
    >
      {({ isActive }) => (
        <>
          <Icon
            size={20}
            aria-hidden="true"
            style={{ color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)', flexShrink: 0 }}
          />
          {!collapsed && (
            <span
              className="text-[13px] font-medium truncate"
              style={{ color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)' }}
            >
              {label}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'sidebar_collapsed'
const W_EXPANDED = 220
const W_COLLAPSED = 56

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'true' } catch { return false }
  })
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const isHRAdmin = ['hr', 'admin'].includes(user?.role)
  const isTaskOwner = ['task_owner', 'employee'].includes(user?.role)
  const navItems = isTaskOwner
    ? NAV_TASK_OWNER
    : isHRAdmin
      ? [...NAV_ALL, ...NAV_HR_ADMIN]
      : NAV_ALL

  const displayName = user?.name ?? user?.email ?? 'User'
  const color = user?.avatarColor ?? avatarColor(displayName)
  const initials = getInitials(displayName)

  function toggle() {
    setCollapsed((v) => {
      const next = !v
      try { localStorage.setItem(STORAGE_KEY, String(next)) } catch {}
      return next
    })
  }

  function handleLogout() {
    clearAuth()
    navigate('/login', { replace: true })
  }

  return (
    <aside
      style={{
        width: collapsed ? W_COLLAPSED : W_EXPANDED,
        minWidth: collapsed ? W_COLLAPSED : W_EXPANDED,
        backgroundColor: 'var(--bg-card)',
        borderRight: '1px solid var(--border-color)',
        transition: 'width 200ms ease, min-width 200ms ease',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflow: 'hidden',
      }}
      aria-label="Main navigation"
    >
      {/* ── Branding ── */}
      <div
        className="flex items-center shrink-0"
        style={{
          height: 56,
          paddingLeft: collapsed ? 0 : 16,
          paddingRight: collapsed ? 0 : 16,
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        {collapsed ? (
          <span
            className="text-[16px] font-bold"
            style={{ color: 'var(--color-primary)' }}
            aria-label="Columbus"
          >
            C
          </span>
        ) : (
          <span
            className="text-[15px] font-bold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            <span style={{ color: 'var(--color-primary)' }}>Columbus</span>
          </span>
        )}
      </div>

      {/* ── Nav links ── */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ padding: collapsed ? '12px 8px' : '12px 10px' }}
      >
        <div className="flex flex-col gap-0.5">
          {navItems.map(({ to, Icon, label }) => (
            <NavItem key={to} to={to} Icon={Icon} label={label} collapsed={collapsed} />
          ))}
        </div>
      </nav>

      {/* ── Bottom section ── */}
      <div
        style={{
          borderTop: '1px solid var(--border-color)',
          padding: collapsed ? '10px 8px' : '10px 10px',
        }}
      >
        {/* User row */}
        <div
          className={[
            'flex items-center gap-2.5 rounded-[6px] px-2 py-2 mb-1',
            collapsed ? 'justify-center px-0' : '',
          ].join(' ')}
          title={collapsed ? displayName : undefined}
        >
          {/* Avatar */}
          <div
            className="flex items-center justify-center rounded-full shrink-0 font-semibold text-[11px]"
            style={{
              width: 28,
              height: 28,
              backgroundColor: color + '22',
              color: color,
            }}
            aria-hidden="true"
          >
            {initials}
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p
                className="text-[12px] font-medium truncate leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {displayName}
              </p>
              <span
                className="inline-block text-[10px] font-medium px-1.5 py-0 rounded-full mt-0.5"
                style={{
                  backgroundColor: 'rgba(59,91,219,0.10)',
                  color: 'var(--color-primary)',
                }}
              >
                {roleLabel(user?.role)}
              </span>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Log out' : undefined}
          aria-label="Log out"
          className={[
            'w-full flex items-center gap-2.5 h-8 rounded-[6px] cursor-pointer',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
            'hover:bg-red-50 dark:hover:bg-red-950/20',
            collapsed ? 'justify-center px-0' : 'px-2',
          ].join(' ')}
        >
          <LogOut size={16} aria-hidden="true" style={{ color: '#dc2626', flexShrink: 0 }} />
          {!collapsed && (
            <span className="text-[12px] font-medium" style={{ color: '#dc2626' }}>
              Log out
            </span>
          )}
        </button>

        {/* Toggle collapse */}
        <button
          onClick={toggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={[
            'w-full flex items-center gap-2.5 h-8 rounded-[6px] cursor-pointer mt-1',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
            'hover:bg-black/[0.04] dark:hover:bg-white/[0.04]',
            collapsed ? 'justify-center px-0' : 'px-2',
          ].join(' ')}
        >
          {collapsed ? (
            <ChevronRight size={14} aria-hidden="true" style={{ color: 'var(--text-secondary)' }} />
          ) : (
            <>
              <ChevronLeft size={14} aria-hidden="true" style={{ color: 'var(--text-secondary)' }} />
              <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
