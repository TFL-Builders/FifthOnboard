import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import Logo from '../assets/Fifthlab.png'
import { Avatar } from './Avatar'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABELS } from '../lib/usersApi'

const DashboardIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 4H4.66667C4.29848 4 4 4.29848 4 4.66667V9.33333C4 9.70152 4.29848 10 4.66667 10H8C8.36819 10 8.66667 9.70152 8.66667 9.33333V4.66667C8.66667 4.29848 8.36819 4 8 4Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15.333 4H11.9997C11.6315 4 11.333 4.29848 11.333 4.66667V6.66667C11.333 7.03486 11.6315 7.33333 11.9997 7.33333H15.333C15.7012 7.33333 15.9997 7.03486 15.9997 6.66667V4.66667C15.9997 4.29848 15.7012 4 15.333 4Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15.333 10H11.9997C11.6315 10 11.333 10.2985 11.333 10.6667V15.3333C11.333 15.7015 11.6315 16 11.9997 16H15.333C15.7012 16 15.9997 15.7015 15.9997 15.3333V10.6667C15.9997 10.2985 15.7012 10 15.333 10Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 12.6666H4.66667C4.29848 12.6666 4 12.9651 4 13.3333V15.3333C4 15.7015 4.29848 16 4.66667 16H8C8.36819 16 8.66667 15.7015 8.66667 15.3333V13.3333C8.66667 12.9651 8.36819 12.6666 8 12.6666Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const OnboardingsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_457_11465)">
        <path d="M6 16.6667V4.66671C6 4.31309 6.14048 3.97395 6.39052 3.7239C6.64057 3.47385 6.97971 3.33337 7.33333 3.33337H12.6667C13.0203 3.33337 13.3594 3.47385 13.6095 3.7239C13.8595 3.97395 14 4.31309 14 4.66671V16.6667H6Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5.99967 10H4.66634C4.31272 10 3.97358 10.1405 3.72353 10.3905C3.47348 10.6406 3.33301 10.9797 3.33301 11.3333V15.3333C3.33301 15.687 3.47348 16.0261 3.72353 16.2761C3.97358 16.5262 4.31272 16.6667 4.66634 16.6667H5.99967" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 8H15.3333C15.687 8 16.0261 8.14048 16.2761 8.39052C16.5262 8.64057 16.6667 8.97971 16.6667 9.33333V15.3333C16.6667 15.687 16.5262 16.0261 16.2761 16.2761C16.0261 16.5262 15.687 16.6667 15.3333 16.6667H14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.66699 6H11.3337" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.66699 8.66663H11.3337" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.66699 11.3334H11.3337" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.66699 14H11.3337" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        <defs>
        <clipPath id="clip0_457_11465">
        <rect width="16" height="16" fill="white" transform="translate(2 2)"/>
        </clipPath>
        </defs>
    </svg>
);

const TemplatesIcon = () => (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.3337 1.33337H5.73366C5.46699 1.33337 5.20033 1.46671 5.00033 1.66671C4.80033 1.86671 4.66699 2.13337 4.66699 2.40004V10.9334C4.66699 11.2 4.80033 11.4667 5.00033 11.6667C5.20033 11.8667 5.46699 12 5.73366 12H12.267C12.5337 12 12.8003 11.8667 13.0003 11.6667C13.2003 11.4667 13.3337 11.2 13.3337 10.9334V4.33337L10.3337 1.33337Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 5.06665V13.6C2 13.8666 2.13333 14.1333 2.33333 14.3333C2.53333 14.5333 2.8 14.6666 3.06667 14.6666H9.6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 1.33337V4.66671H13.3333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const PeopleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 16C14 14.9391 13.5786 13.9217 12.8284 13.1716C12.0783 12.4214 11.0609 12 10 12C8.93913 12 7.92172 12.4214 7.17157 13.1716C6.42143 13.9217 6 14.9391 6 16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9.99967 12C11.4724 12 12.6663 10.8061 12.6663 9.33329C12.6663 7.86053 11.4724 6.66663 9.99967 6.66663C8.52692 6.66663 7.33301 7.86053 7.33301 9.33329C7.33301 10.8061 8.52692 12 9.99967 12Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14.6667 4H5.33333C4.59695 4 4 4.59695 4 5.33333V14.6667C4 15.403 4.59695 16 5.33333 16H14.6667C15.403 16 16 15.403 16 14.6667V5.33333C16 4.59695 15.403 4 14.6667 4Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 -0.5 21 21" version="1.1">
        <g stroke="currentColor" strokeWidth="1" fill="none" fillRule="evenodd">
            <g transform="translate(-419.000000, -320.000000)" fill="currentColor">
                <g transform="translate(56.000000, 160.000000)">
                    <path d="M374.55,170 C374.55,170.552 374.0796,171 373.5,171 C372.9204,171 372.45,170.552 372.45,170 C372.45,169.448 372.9204,169 373.5,169 C374.0796,169 374.55,169.448 374.55,170 M378.561,171.358 C378.09585,173.027 376.67835,174.377 374.9259,174.82 C370.9359,175.828 367.3806,172.442 368.439,168.642 C368.90415,166.973 370.32165,165.623 372.0741,165.18 C376.0641,164.172 379.6194,167.558 378.561,171.358 M382.95,169 L381.2112,169 C380.95815,169 380.6106,168.984 380.6127,168.743 C380.61795,167.854 380.3124,166.59 379.6383,165.898 C379.4661,165.721 379.5165,165.559 379.695,165.389 L380.92455,164.281 C381.3351,163.89 381.3351,163.288 380.92455,162.898 C380.51505,162.507 379.84935,162.523 379.43985,162.913 L378.2103,164.092 C378.0318,164.262 377.75565,164.283 377.5446,164.151 C376.7781,163.669 375.91185,163.322 374.9805,163.141 C374.7327,163.092 374.55,162.897 374.55,162.656 L374.55,161 C374.55,160.448 374.0796,160 373.5,160 C372.9204,160 372.45,160.448 372.45,161 L372.45,162.656 C372.45,162.897 372.2673,163.094 372.0195,163.143 C371.08815,163.324 370.2219,163.672 369.4554,164.154 C369.24435,164.287 368.9682,164.27 368.7897,164.1 L367.56015,162.929 C367.15065,162.538 366.48495,162.538 366.07545,162.929 C365.6649,163.319 365.6649,163.953 366.07545,164.343 L367.305,165.514 C367.4835,165.684 367.5108,165.953 367.3617,166.148 C366.843,166.831 366.5112,167.562 366.3621,168.84 C366.33375,169.079 366.04185,169 365.7888,169 L364.05,169 C363.4704,169 363,169.448 363,170 C363,170.552 363.4704,171 364.05,171 L365.7888,171 C366.04185,171 366.34845,171.088 366.39885,171.323 C366.5889,172.21 366.85665,172.872 367.3617,173.602 C367.50135,173.803 367.4835,174.191 367.305,174.361 L366.07545,175.594 C365.6649,175.985 365.6649,176.649 366.07545,177.04 C366.48495,177.43 367.15065,177.446 367.56015,177.055 L368.7897,175.892 C368.9682,175.722 369.24435,175.709 369.4554,175.842 C370.2219,176.323 371.08815,176.674 372.0195,176.855 C372.2673,176.904 372.45,177.103 372.45,177.344 L372.45,179 C372.45,179.552 372.9204,180 373.5,180 C374.0796,180 374.55,179.552 374.55,179 L374.55,177.344 C374.55,177.103 374.7327,176.906 374.9805,176.857 C375.91185,176.676 376.7781,176.327 377.5446,175.846 C377.75565,175.713 378.0318,175.73 378.2103,175.9 L379.43985,177.071 C379.84935,177.462 380.51505,177.462 380.92455,177.071 C381.3351,176.681 381.3351,176.047 380.92455,175.657 L379.695,174.486 C379.5165,174.316 379.49865,174.053 379.6383,173.852 C380.14335,173.122 380.4174,172.714 380.69985,171.91 C380.7807,171.682 380.95815,171 381.2112,171 L382.95,171 C383.5296,171 384,170.552 384,170 C384,169.448 383.5296,169 382.95,169" />
                </g>
            </g>
        </g>
    </svg>
);

const LogoutIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

const CollapseIcon = ({ collapsed }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-transform ${collapsed ? 'rotate-180' : ''}`}>
        <path d="M10 12.5L6 8L10 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// Roles allowed per destination, matching the API's own route guards — kept
// in step with the backend so a role never sees a link that would just 403.
const NAV_ITEMS = [
    { label: 'Dashboard', to: '/dashboard', Icon: DashboardIcon, roles: ['admin', 'hr', 'manager', 'employee', 'task_owner'] },
    { label: 'Onboardings', to: '/onboardings', Icon: OnboardingsIcon, roles: ['admin', 'hr', 'manager'] },
    { label: 'Templates', to: '/templates', Icon: TemplatesIcon, roles: ['admin', 'hr'] },
    { label: 'People', to: '/people', Icon: PeopleIcon, roles: ['admin', 'hr', 'manager'] },
    { label: 'Settings', to: '/settings', Icon: SettingsIcon, roles: ['admin'] },
];

export const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const navItems = NAV_ITEMS.filter((item) => !user || item.roles.includes(user.role)).map((item) =>
        item.to === '/dashboard' && user?.role === 'task_owner' ? { ...item, label: 'My Tasks' } : item
    );

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className={`h-screen shrink-0 flex flex-col justify-between bg-white border-r border-border transition-all duration-200 ${collapsed ? 'w-20' : 'w-64'}`}>
            <div>
                <div className="flex items-center h-16 px-4 overflow-hidden">
                    {!collapsed && <img src={Logo} alt="Fifthlabs Logo" className="h-7 w-auto" />}
                </div>
                <div className="border-t border-border" />

                <nav className="flex flex-col gap-1 p-3">
                    {navItems.map(({ label, to, Icon }) => (
                        <NavLink
                            key={label}
                            to={to}
                            title={collapsed ? label : undefined}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors ${collapsed ? 'justify-center' : ''} ${
                                    isActive
                                        ? 'bg-primary text-white hover:brightness-95'
                                        : 'text-[#64748B] hover:bg-background hover:text-black'
                                }`
                            }
                        >
                            <Icon />
                            {!collapsed && label}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="flex flex-col gap-1 p-3 border-t border-border">
                <div
                    to="/profile-page"
                    className={`flex items-center gap-3 p-2 rounded-xl bg-[#F0F9FF] hover:brightness-95 transition-[filter] ${collapsed ? 'justify-center' : ''}`}
                >
                    <Avatar name={user?.name ?? "?"} size={40} className="border-2 border-primary" />
                    {!collapsed && (
                        <div className="flex flex-col justify-center min-w-0">
                            <div className="text-[14px] text-[#0F1729] truncate">{user?.name}</div>
                            <div className="text-[12px] text-[#64748B]">{ROLE_LABELS[user?.role] ?? user?.role}</div>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={handleLogout}
                    title={collapsed ? 'Log Out' : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] text-red-900 hover:bg-red-50 transition-colors ${collapsed ? 'justify-center' : ''}`}
                >
                    <LogoutIcon />
                    {!collapsed && 'Log Out'}
                </button>

                <button
                    type="button"
                    onClick={() => setCollapsed((prev) => !prev)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[14px] text-[#64748B] hover:bg-background hover:text-black transition-colors ${collapsed ? 'justify-center' : ''}`}
                >
                    <CollapseIcon collapsed={collapsed} />
                    {!collapsed && 'Collapse'}
                </button>
            </div>
        </div>
    )
}
