import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

const ALL_ONBOARDINGS = [
  { id: '1', name: 'Jordan Smith',  role: 'Senior Frontend Engineer', template: 'Engineering Core',       manager: 'Michael Chen',   progress: 65,  status: 'in-progress', startDate: '2023-11-01', initials: 'JS', initBg: 'bg-secondary-fixed',  initColor: 'text-on-secondary-fixed' },
  { id: '2', name: 'Alex Miller',   role: 'Marketing Specialist',      template: 'GTM Strategy',           manager: 'Sarah Jenkins',  progress: 32,  status: 'overdue',     startDate: '2023-10-15', initials: 'AM', initBg: 'bg-tertiary-fixed',   initColor: 'text-on-tertiary-fixed' },
  { id: '3', name: 'Linda Rivera',  role: 'Product Designer',          template: 'Design System Ops',      manager: 'Elena Rodriguez',progress: 100, status: 'completed',   startDate: '2023-10-01', initials: 'LR', initBg: 'bg-secondary-container',initColor: 'text-on-secondary-container' },
  { id: '4', name: 'David Wright',  role: 'Backend Architect',         template: 'Platform Infrastructure',manager: 'Michael Chen',   progress: 12,  status: 'in-progress', startDate: '2023-11-10', initials: 'DW', initBg: 'bg-primary-fixed',    initColor: 'text-on-primary-fixed' },
  { id: '5', name: 'Maria Santos',  role: 'Data Analyst',              template: 'Data & Analytics',       manager: 'Tom Hardy',      progress: 55,  status: 'in-progress', startDate: '2023-11-05', initials: 'MS', initBg: 'bg-surface-container-high', initColor: 'text-on-surface' },
];

const STATUSES = ['All Statuses', 'In Progress', 'Overdue', 'Completed'];
const MANAGERS = ['Any Manager', 'Michael Chen', 'Sarah Jenkins', 'Elena Rodriguez', 'Tom Hardy'];

export default function OnboardingsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [managerFilter, setManagerFilter] = useState('Any Manager');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);

  function reset() {
    setSearch(''); setStatusFilter('All Statuses'); setManagerFilter('Any Manager'); setDateFilter(''); setPage(1);
  }

  const filtered = ALL_ONBOARDINGS.filter((o) => {
    if (search && !o.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'All Statuses') {
      const map = { 'In Progress': 'in-progress', 'Overdue': 'overdue', 'Completed': 'completed' };
      if (o.status !== map[statusFilter]) return false;
    }
    if (managerFilter !== 'Any Manager' && o.manager !== managerFilter) return false;
    if (dateFilter && o.startDate < dateFilter) return false;
    return true;
  });

  return (
    <div className="p-margin max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-xl gap-md">
        <div>
          <h1 className="text-headline-xl text-on-surface mb-xs">Onboardings</h1>
          <p className="text-body-md text-on-surface-variant">Manage and track all active employee onboarding processes.</p>
        </div>
        <Button onClick={() => navigate('/onboardings/new')} className="self-start md:self-auto flex-shrink-0">
          <Icon name="add" size={20} />
          New Onboarding
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-lg">
        {/* Filter sidebar */}
        <aside className="w-full lg:w-[280px] flex-shrink-0">
          <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl">
            <div className="flex items-center gap-sm mb-md pb-sm border-b border-outline-variant">
              <Icon name="filter_list" size={20} className="text-on-surface-variant" />
              <span className="text-label-md font-bold uppercase tracking-wider text-on-surface-variant">Filters</span>
            </div>

            <div className="flex flex-col gap-lg">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-xs">Search Name</label>
                <div className="relative">
                  <Icon name="search" size={18} className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Employee name…"
                    className="w-full pl-9 pr-sm py-xs bg-surface border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-xs">Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full p-xs bg-surface border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-xs">Hiring Manager</label>
                <select value={managerFilter} onChange={(e) => setManagerFilter(e.target.value)} className="w-full p-xs bg-surface border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                  {MANAGERS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-xs">Start Date (from)</label>
                <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full p-xs bg-surface border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>

              <button onClick={reset} className="w-full py-sm text-primary text-label-md border border-primary hover:bg-primary/5 rounded-lg transition-colors">
                Reset Filters
              </button>
            </div>
          </div>
        </aside>

        {/* Table */}
        <div className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-xxl">
              <EmptyState icon="person_search" title="No results found" description="Try adjusting your filters to find what you're looking for." action={reset} actionLabel="Clear Filters" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                      {['Name', 'Template', 'Manager', 'Progress', 'Status', 'Start Date', ''].map((h) => (
                        <th key={h} className="px-lg py-md text-label-md text-on-surface-variant uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {filtered.map((o) => (
                      <tr
                        key={o.id}
                        className="hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/onboardings/${o.id}`)}
                      >
                        <td className="px-lg py-md">
                          <div className="flex items-center gap-md">
                            <div className={`w-10 h-10 rounded-full ${o.initBg} flex items-center justify-center ${o.initColor} font-semibold text-sm flex-shrink-0`}>
                              {o.initials}
                            </div>
                            <div>
                              <p className="text-body-md font-bold text-on-surface">{o.name}</p>
                              <p className="text-[12px] text-on-surface-variant">{o.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-lg py-md text-body-md text-on-surface">{o.template}</td>
                        <td className="px-lg py-md text-body-md text-on-surface">{o.manager}</td>
                        <td className="px-lg py-md">
                          <div className="w-full max-w-[120px]">
                            <span className={`text-[10px] font-bold block mb-xs ${o.status === 'overdue' ? 'text-error' : o.status === 'completed' ? 'text-secondary' : 'text-primary'}`}>{o.progress}%</span>
                            <div className="h-[6px] w-full bg-surface-container-high rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${o.status === 'overdue' ? 'bg-error' : o.status === 'completed' ? 'bg-secondary' : 'bg-primary'}`} style={{ width: `${o.progress}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-lg py-md">
                          <Badge variant={o.status}>{o.status === 'in-progress' ? 'In Progress' : o.status}</Badge>
                        </td>
                        <td className="px-lg py-md font-mono text-code-sm text-on-surface-variant">{o.startDate}</td>
                        <td className="px-lg py-md text-right">
                          <button className="text-on-surface-variant hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                            <Icon name="more_vert" size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-lg py-md bg-surface-container-low border-t border-outline-variant">
                <span className="text-label-md text-on-surface-variant">Showing 1 to {filtered.length} of {ALL_ONBOARDINGS.length} results</span>
                <div className="flex items-center gap-sm">
                  <button disabled className="p-xs rounded hover:bg-surface-container-high transition-colors disabled:opacity-30">
                    <Icon name="chevron_left" size={20} />
                  </button>
                  <button className="text-label-md font-bold px-sm py-xs bg-primary text-on-primary rounded">1</button>
                  <button className="text-label-md px-sm py-xs hover:bg-surface-container-high rounded transition-colors">2</button>
                  <button className="text-label-md px-sm py-xs hover:bg-surface-container-high rounded transition-colors">3</button>
                  <button className="p-xs rounded hover:bg-surface-container-high transition-colors">
                    <Icon name="chevron_right" size={20} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
