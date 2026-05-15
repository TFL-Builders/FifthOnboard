import { useState } from 'react';
import Icon from '../components/Icon';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const MEMBERS = [
  { id: 1, name: 'Marcus Chen',     email: 'marcus.chen@acme.co',    role: 'Admin',   status: 'active',  lastActive: '2 mins ago',         initials: 'MC' },
  { id: 2, name: 'Sarah Jenkins',   email: 's.jenkins@acme.co',      role: 'Manager', status: 'active',  lastActive: 'Yesterday, 4:22 PM', initials: 'SJ' },
  { id: 3, name: 'Lucas Wright',    email: 'l.wright@acme.co',        role: 'Member',  status: 'invited', lastActive: 'Invited 2d ago',      initials: 'LW' },
  { id: 4, name: 'David Kim',       email: 'd.kim@acme.co',           role: 'Member',  status: 'active',  lastActive: 'Oct 12, 2023',       initials: 'DK' },
  { id: 5, name: 'Elena Rodriguez', email: 'e.rodriguez@acme.co',     role: 'Manager', status: 'active',  lastActive: 'Oct 10, 2023',       initials: 'ER' },
];

const STATUS_BADGE = { active: 'active', invited: 'invited' };
const ROLE_BADGE   = { Admin: 'admin', Manager: 'manager', Member: 'member' };

const ROLES   = ['Any Role',   'Admin', 'Manager', 'Member'];
const STATUSES = ['All Status', 'Active', 'Invited'];

export default function PeoplePage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Any Role');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const filtered = MEMBERS.filter((m) => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter !== 'Any Role' && m.role !== roleFilter) return false;
    if (statusFilter !== 'All Status' && m.status !== statusFilter.toLowerCase()) return false;
    return true;
  });

  const roleCounts = { Admins: MEMBERS.filter((m) => m.role === 'Admin').length, Managers: MEMBERS.filter((m) => m.role === 'Manager').length, Members: MEMBERS.filter((m) => m.role === 'Member').length };

  return (
    <div className="p-margin max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-xl gap-md">
        <div>
          <h1 className="text-headline-xl text-on-surface">People</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            Manage your organization's members and their access roles. Totaling <strong className="text-on-surface">{MEMBERS.length} members</strong>.
          </p>
        </div>
        <Button onClick={() => toast.success('Invite sent!')} className="self-start flex-shrink-0">
          <Icon name="add" size={18} />
          Invite Member
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-lg mb-lg">
        <div className="md:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex items-center gap-md">
          <Icon name="search" size={20} className="text-outline flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name, email or role…"
            className="bg-transparent border-none focus:ring-0 w-full text-body-md outline-none"
          />
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex items-center justify-between cursor-pointer">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-transparent border-none focus:ring-0 text-label-md text-on-surface-variant w-full outline-none cursor-pointer">
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex items-center justify-between">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="bg-transparent border-none focus:ring-0 text-label-md text-on-surface-variant w-full outline-none cursor-pointer">
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
          <Icon name="filter_list" size={18} className="text-outline flex-shrink-0 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden mb-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low/30">
              {['Name', 'Role', 'Status', 'Last Active', 'Actions'].map((h, i) => (
                <th key={h} className={`px-lg py-md text-label-md text-on-surface-variant uppercase tracking-wider ${i === 4 ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-lg py-xxl text-center text-body-md text-on-surface-variant">No members match your filters.</td>
              </tr>
            ) : filtered.map((m) => (
              <tr key={m.id} className="hover:bg-surface-container-low/20 transition-colors group">
                <td className="px-lg py-md">
                  <div className="flex items-center gap-md">
                    <div className="h-10 w-10 rounded-full border border-outline-variant overflow-hidden bg-surface-container flex items-center justify-center flex-shrink-0">
                      <span className="text-on-surface-variant font-bold text-sm">{m.initials}</span>
                    </div>
                    <div>
                      <div className="text-body-md font-semibold text-on-surface">{m.name}</div>
                      <div className="text-label-md text-on-surface-variant">{m.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-lg py-md text-body-md text-on-surface">{m.role}</td>
                <td className="px-lg py-md">
                  <Badge variant={STATUS_BADGE[m.status]}>{m.status}</Badge>
                </td>
                <td className="px-lg py-md text-body-md text-on-surface-variant">{m.lastActive}</td>
                <td className="px-lg py-md text-right">
                  <button className="text-outline hover:text-primary transition-colors">
                    <Icon name="more_vert" size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <footer className="px-lg py-md flex items-center justify-between border-t border-outline-variant bg-surface-container-low/10">
          <span className="text-label-md text-on-surface-variant">Showing {filtered.length} of {MEMBERS.length} members</span>
          <div className="flex items-center gap-sm">
            <button disabled className="p-xs rounded border border-outline-variant hover:bg-surface-container-low disabled:opacity-30">
              <Icon name="chevron_left" size={18} />
            </button>
            <button className="px-sm py-xs rounded bg-primary/10 text-primary font-bold text-xs">1</button>
            <button className="px-sm py-xs rounded hover:bg-surface-container-low text-on-surface-variant text-xs">2</button>
            <button className="p-xs rounded border border-outline-variant hover:bg-surface-container-low">
              <Icon name="chevron_right" size={18} />
            </button>
          </div>
        </footer>
      </div>

      {/* Insights */}
      <div className="flex flex-col md:flex-row gap-lg">
        <div className="flex-1 p-lg bg-indigo-50 border border-primary/10 rounded-xl relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-headline-md text-primary mb-xs">Invite Growth</h3>
            <p className="text-body-md text-on-primary-fixed-variant max-w-xs">
              You've invited 12 new members this month. That's a 24% increase from last month.
            </p>
          </div>
          <Icon name="trending_up" size={120} className="absolute -bottom-4 -right-4 opacity-10 text-primary group-hover:scale-110 transition-transform" />
        </div>
        <div className="w-full md:w-[320px] p-lg bg-surface-container border border-outline-variant rounded-xl">
          <h3 className="text-label-md font-bold text-on-surface uppercase tracking-widest mb-md">Role Distribution</h3>
          <div className="flex flex-col gap-md">
            {Object.entries(roleCounts).map(([role, count]) => (
              <div key={role} className="flex flex-col gap-xs">
                <div className="flex justify-between text-label-md">
                  <span className="text-on-surface-variant">{role}</span>
                  <span className="text-on-surface">{count}</span>
                </div>
                <div className="h-1 w-full bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(count / MEMBERS.length) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
