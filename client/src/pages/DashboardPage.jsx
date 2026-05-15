import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';
import useAuthStore from '../stores/authStore';

const STATS = [
  { label: 'Active Onboardings', value: '24', sub: '+3 this week',   subColor: 'text-secondary', subBg: 'bg-secondary-fixed/30', icon: 'person_add',   iconColor: 'text-primary' },
  { label: 'Overdue Tasks',       value: '7',  sub: 'Requires attention', subColor: 'text-error',    subBg: 'bg-error-container',   icon: 'warning',      iconColor: 'text-error' },
  { label: 'Avg. Time to Complete', value: '12.4', sub: 'days',      subColor: 'text-on-surface-variant', subBg: '',              icon: 'schedule',     iconColor: 'text-tertiary' },
];

const ONBOARDINGS = [
  { id: '1', name: 'Alex Rivera',   template: 'Software Engineer',  manager: 'Sarah Chen',   progress: 65,  status: 'in-progress', startDate: 'Oct 12, 2023' },
  { id: '2', name: 'Jordan Smith',  template: 'Product Designer',   manager: 'Marcus T.',    progress: 40,  status: 'overdue',     startDate: 'Oct 05, 2023' },
  { id: '3', name: 'Elena Petrova', template: 'Marketing Lead',     manager: 'Jessica Wu',   progress: 90,  status: 'in-progress', startDate: 'Oct 14, 2023' },
  { id: '4', name: 'David Miller',  template: 'Sales Account Exec', manager: 'Tom Hardy',    progress: 12,  status: 'in-progress', startDate: 'Oct 20, 2023' },
];

const ACTIVITY = [
  { icon: 'check_circle', color: 'text-primary',   bg: 'bg-primary-container/20',   text: <><strong>Sarah Chen</strong> completed 'IT Setup'</>,              time: '2 hours ago' },
  { icon: 'person_add',   color: 'text-secondary', bg: 'bg-secondary-container/20', text: <><strong>Marcus T.</strong> added a note to Jordan Smith</>,        time: '5 hours ago' },
  { icon: 'history',      color: 'text-error',     bg: 'bg-error-container/20',     text: <><strong>Deadline Missed</strong>: Employee Handbook Review</>,     time: 'Yesterday at 4:30 PM' },
  { icon: 'person_add',   color: 'text-primary',   bg: 'bg-primary-container/20',   text: <><strong>New Onboarding</strong>: Elena Petrova</>,                 time: 'Oct 14, 10:00 AM' },
];

function initials(name) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="p-margin lg:p-xxl max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xl">
        <div>
          <h1 className="text-headline-xl text-on-surface">HR Dashboard</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">Overview of all active recruitment and onboarding cycles.</p>
        </div>
        <Button onClick={() => navigate('/onboardings/new')} className="self-start md:self-auto flex-shrink-0">
          <Icon name="add" size={18} />
          New Onboarding
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
        {STATS.map((s) => (
          <div key={s.label} className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex flex-col gap-md">
            <div className="flex items-center justify-between">
              <span className="text-label-md text-on-surface-variant">{s.label}</span>
              <Icon name={s.icon} size={22} className={s.iconColor} />
            </div>
            <div className="flex items-baseline gap-sm">
              <span className="text-headline-xl text-on-surface">{s.value}</span>
              {s.subBg ? (
                <span className={`text-[12px] font-medium px-sm py-[2px] rounded-full ${s.subColor} ${s.subBg}`}>{s.sub}</span>
              ) : (
                <span className={`text-label-md ${s.subColor}`}>{s.sub}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-xl">
        {/* Table */}
        <div className="xl:col-span-3">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
            <div className="px-lg py-md border-b border-outline-variant flex items-center justify-between">
              <h2 className="text-headline-md text-on-surface">Active Onboardings</h2>
              <Link to="/onboardings" className="text-label-md text-primary hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low">
                    {['Name', 'Template', 'Manager', 'Progress', 'Status', 'Start Date'].map((h) => (
                      <th key={h} className="px-lg py-md text-label-md text-on-surface-variant border-b border-outline-variant">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {ONBOARDINGS.map((o) => (
                    <tr
                      key={o.id}
                      className="hover:bg-surface-container-low transition-colors cursor-pointer"
                      onClick={() => navigate(`/onboardings/${o.id}`)}
                    >
                      <td className="px-lg py-md text-body-md text-on-surface font-medium">{o.name}</td>
                      <td className="px-lg py-md text-body-md text-on-surface-variant">{o.template}</td>
                      <td className="px-lg py-md text-body-md text-on-surface-variant">{o.manager}</td>
                      <td className="px-lg py-md min-w-[160px]">
                        <ProgressBar value={o.progress} error={o.status === 'overdue'} />
                      </td>
                      <td className="px-lg py-md">
                        <Badge variant={o.status}>{o.status === 'in-progress' ? 'In Progress' : o.status}</Badge>
                      </td>
                      <td className="px-lg py-md text-body-md text-on-surface-variant">{o.startDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty state (hidden when there's data) */}
          <div className="hidden mt-xxl flex flex-col items-center text-center p-xxl bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-xl">
            <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-md text-outline">
              <Icon name="group_add" size={40} />
            </div>
            <h3 className="text-headline-md text-on-surface">No onboardings yet</h3>
            <p className="text-body-md text-on-surface-variant mt-xs mb-lg max-w-xs">Start your first onboarding flow from a template or create one from scratch.</p>
            <div className="flex flex-col sm:flex-row gap-sm">
              <Button onClick={() => navigate('/onboardings/new')}>Start your first one</Button>
              <Button variant="secondary" onClick={() => navigate('/templates')}>
                <Icon name="description" size={16} />
                Create a template first
              </Button>
            </div>
          </div>
        </div>

        {/* Activity */}
        <div className="xl:col-span-1">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
            <h2 className="text-headline-md text-on-surface mb-md">Recent Activity</h2>
            <div className="flex flex-col gap-lg">
              {ACTIVITY.map((a, i) => (
                <div key={i} className="flex gap-md">
                  <div className="relative flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full ${a.bg} flex items-center justify-center ${a.color}`}>
                      <Icon name={a.icon} size={18} />
                    </div>
                    {i < ACTIVITY.length - 1 && (
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-8 bg-outline-variant" />
                    )}
                  </div>
                  <div>
                    <p className="text-body-md text-on-surface leading-snug">{a.text}</p>
                    <p className="text-[12px] text-on-surface-variant mt-xs">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
