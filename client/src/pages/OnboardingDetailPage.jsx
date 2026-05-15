import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const TASK_STATUS = {
  done:        { icon: 'check', border: 'border-primary', bg: 'bg-primary', text: 'text-white' },
  'in-progress':{ icon: '',    border: 'border-outline-variant', bg: 'bg-white', text: '' },
  pending:     { icon: '',      border: 'border-outline-variant', bg: 'bg-white', text: '' },
  blocked:     { icon: 'priority_high', border: 'border-error', bg: 'bg-error/10', text: 'text-error' },
};

const TASKS = [
  { id: 1, title: 'Sign Employment Contract',       meta: 'Legal & HR Department • Completed Oct 02',   status: 'done',        badge: 'done' },
  { id: 2, title: 'Set up Development Environment', meta: 'Engineering Team • Due in 2 days',           status: 'in-progress', badge: 'in-progress' },
  { id: 3, title: 'Introduction to Project Mercury', meta: 'Product Team • Scheduled for next week',    status: 'pending',     badge: 'pending' },
  { id: 4, title: 'Security Access Pass Issuance',  meta: 'Facilities • Waiting for background check',  status: 'blocked',     badge: 'blocked' },
];

const AUDIT = [
  { icon: 'check_circle', color: 'text-green-700', bg: 'bg-green-100', text: <>Task <strong>Contract Signing</strong> marked as done</>,    time: 'Oct 02, 2023 • 09:45 AM' },
  { icon: 'edit',         color: 'text-blue-700',  bg: 'bg-blue-100',  text: <><strong>Admin</strong> updated onboarding template</>,        time: 'Oct 01, 2023 • 03:20 PM' },
  { icon: 'person_add',   color: 'text-purple-700',bg: 'bg-purple-100',text: <>Onboarding flow created</>,                                    time: 'Sep 30, 2023 • 11:00 AM' },
];

export default function OnboardingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState(TASKS);

  function toggleDone(taskId) {
    setTasks((prev) =>
      prev.map((t) => t.id === taskId
        ? { ...t, status: t.status === 'done' ? 'in-progress' : 'done', badge: t.status === 'done' ? 'in-progress' : 'done' }
        : t
      )
    );
  }

  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const progress = Math.round((doneCount / tasks.length) * 100);

  return (
    <div className="max-w-[1200px] mx-auto p-margin flex flex-col gap-xl">
      {/* Back */}
      <button onClick={() => navigate('/onboardings')} className="flex items-center gap-xs text-primary text-label-md hover:text-on-primary-fixed-variant transition-colors self-start">
        <Icon name="arrow_back" size={16} />
        Back to Onboardings
      </button>

      {/* Hero */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-lg bg-surface-container-lowest p-xl rounded-xl border border-outline-variant">
        <div className="flex items-center gap-lg">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-surface-container-high flex items-center justify-center flex-shrink-0">
            <span className="text-headline-xl font-bold text-on-surface-variant">JD</span>
          </div>
          <div>
            <div className="flex items-center gap-sm mb-xs flex-wrap">
              <h1 className="text-headline-xl text-on-surface">John Doe</h1>
              <Badge variant="new-hire">New Hire</Badge>
            </div>
            <p className="text-body-md text-on-surface-variant">Senior Software Engineer • Engineering Team</p>
            <p className="text-label-md text-outline flex items-center gap-xs mt-xs">
              <Icon name="calendar_today" size={16} />
              Start Date: October 12, 2023
            </p>
          </div>
        </div>
        <div className="w-full md:w-64">
          <div className="flex justify-between items-center mb-xs">
            <span className="text-label-md font-semibold text-on-surface">Overall Progress</span>
            <span className="text-label-md font-bold text-primary">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </section>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Tasks */}
        <div className="lg:col-span-8 flex flex-col gap-lg">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
            <div className="p-lg border-b border-outline-variant flex items-center justify-between bg-surface-container-low/30">
              <h2 className="text-headline-md text-on-surface">Onboarding Tasks</h2>
              <Button size="sm">
                <Icon name="add" size={18} />
                Add Task
              </Button>
            </div>
            <div className="divide-y divide-outline-variant">
              {tasks.map((task) => {
                const s = TASK_STATUS[task.status];
                return (
                  <div key={task.id} className="p-lg flex items-center justify-between hover:bg-surface-container-lowest transition-colors gap-md">
                    <div className="flex items-center gap-lg">
                      <button
                        onClick={() => toggleDone(task.id)}
                        className={`w-6 h-6 rounded flex-shrink-0 border-2 ${s.border} ${s.bg} ${s.text} flex items-center justify-center transition-all`}
                      >
                        {s.icon && <Icon name={s.icon} size={16} />}
                      </button>
                      <div>
                        <h3 className={`text-body-lg font-semibold ${task.status === 'done' ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                          {task.title}
                        </h3>
                        <p className="text-label-md text-on-surface-variant">{task.meta}</p>
                      </div>
                    </div>
                    <Badge variant={task.badge} className="flex-shrink-0">
                      {task.badge === 'in-progress' ? 'In Progress' : task.badge}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: Audit Log */}
        <div className="lg:col-span-4 flex flex-col gap-lg">
          {/* Audit Log */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant">
            <div className="p-lg border-b border-outline-variant bg-surface-container-low/30">
              <h2 className="text-label-md font-bold text-on-surface uppercase tracking-wider">Audit Log</h2>
            </div>
            <div className="p-lg flex flex-col gap-lg">
              {AUDIT.map((a, i) => (
                <div key={i} className="flex gap-md relative">
                  {i < AUDIT.length - 1 && (
                    <div className="absolute left-3 top-7 bottom-0 w-px bg-outline-variant" />
                  )}
                  <div className={`w-6 h-6 rounded-full ${a.bg} flex items-center justify-center z-10 flex-shrink-0`}>
                    <Icon name={a.icon} size={14} className={a.color} />
                  </div>
                  <div>
                    <p className="text-label-md text-on-surface">{a.text}</p>
                    <span className="text-[10px] text-outline">{a.time}</span>
                  </div>
                </div>
              ))}
              {AUDIT.length === 0 && (
                <p className="text-body-md text-on-surface-variant italic">Nothing happened yet. Actions will appear here as the onboarding progresses.</p>
              )}
            </div>
          </div>

          {/* Quick info card */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg flex flex-col gap-md">
            <h2 className="text-label-md font-bold text-on-surface uppercase tracking-wider">Onboarding Info</h2>
            <div className="flex flex-col gap-sm">
              <div className="flex items-center justify-between">
                <span className="text-label-md text-on-surface-variant">Manager</span>
                <span className="text-body-md text-on-surface font-medium">Sarah Chen</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-label-md text-on-surface-variant">Template</span>
                <span className="text-body-md text-on-surface font-medium">Software Engineer</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-label-md text-on-surface-variant">Department</span>
                <span className="text-body-md text-on-surface font-medium">Engineering</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-label-md text-on-surface-variant">Status</span>
                <Badge variant="in-progress">In Progress</Badge>
              </div>
            </div>
            <div className="pt-sm border-t border-outline-variant flex flex-col gap-sm">
              <Button variant="indigo" size="sm" className="w-full">Send Reminder</Button>
              <Button variant="secondary" size="sm" className="w-full">
                <Icon name="send" size={16} />
                Invite to Portal
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
