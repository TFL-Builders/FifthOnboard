import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

const INITIAL_TASKS = {
  overdue: [
    { id: 1, title: 'Sign Equipment Rental Agreement', hire: 'Marcus Holloway', due: 'Due 2 days ago',   icon: 'contract', done: false },
    { id: 2, title: 'Verify I-9 Documentation',        hire: 'Elena Rodriguez', due: 'Due yesterday',    icon: 'badge',    done: false },
  ],
  today: [
    { id: 3, title: 'Grant Access to Security Portal', hire: 'James Chen',      due: 'Due by 5:00 PM',   icon: 'shield',   done: false },
  ],
  upcoming: [
    { id: 4, title: 'Schedule 1:1 Introduction',       hire: 'Sarah Jenkins',   due: 'Due Friday, Oct 27', icon: 'handshake', done: false },
    { id: 5, title: 'Confirm Hardware Delivery',        hire: 'Elena Rodriguez', due: 'Due Monday, Oct 30', icon: 'laptop_mac',done: false },
  ],
};

const STATS = [
  { icon: 'trending_up', bg: 'bg-primary', text: 'text-on-primary',             value: '92%',  label: 'Weekly Completion' },
  { icon: 'groups',      bg: 'bg-surface-container-high', text: 'text-secondary', value: '12',   label: 'Active Onboardings', border: true },
  { icon: 'timer',       bg: 'bg-tertiary-container/10',  text: 'text-tertiary',  value: '4.2h', label: 'Avg. Response Time', border: true },
];

function TaskItem({ task, onComplete }) {
  return (
    <div className={`flex items-center justify-between p-lg bg-surface-container-lowest border border-outline-variant rounded-xl hover:border-primary/40 transition-all group ${task.done ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-lg">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${task.done ? 'bg-green-100' : 'bg-primary-container/10'}`}>
          {task.done
            ? <Icon name="check_circle" size={20} className="text-green-600" filled />
            : <Icon name={task.icon} size={20} className="text-primary" />
          }
        </div>
        <div>
          <h3 className={`text-body-lg font-semibold group-hover:text-primary transition-colors ${task.done ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
            {task.title}
          </h3>
          <p className="text-body-md text-on-surface-variant">
            Hire: <span className="font-medium text-on-surface">{task.hire}</span> •{' '}
            <span className="font-medium">{task.due}</span>
          </p>
        </div>
      </div>
      {!task.done && (
        <button
          onClick={() => onComplete(task.id)}
          className="px-md py-sm text-primary text-label-md rounded-lg hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/20 flex-shrink-0"
        >
          Mark Complete
        </button>
      )}
    </div>
  );
}

export default function MyTasksPage() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  function markComplete(id) {
    setTasks((prev) => {
      const updated = {};
      for (const [key, list] of Object.entries(prev)) {
        updated[key] = list.map((t) => t.id === id ? { ...t, done: true } : t);
      }
      return updated;
    });
    toast.success('Task marked complete!');
  }

  const allDone = Object.values(tasks).flat().every((t) => t.done);
  const totalPending = Object.values(tasks).flat().filter((t) => !t.done).length;

  return (
    <div className="max-w-[1200px] mx-auto p-xxl">
      {/* Header */}
      <header className="mb-xl flex flex-col sm:flex-row sm:items-center justify-between gap-md">
        <div>
          <h1 className="text-headline-xl text-on-surface">My Tasks</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            {allDone ? "You're all caught up!" : `You have ${totalPending} pending task${totalPending !== 1 ? 's' : ''} for this week.`}
          </p>
        </div>
        <div className="flex gap-sm">
          <Button variant="secondary" size="sm">
            <Icon name="filter_list" size={18} />
            Filter
          </Button>
          <Button size="sm" onClick={() => toast('New task flow coming soon!')}>
            <Icon name="add" size={18} />
            New Task
          </Button>
        </div>
      </header>

      {allDone ? (
        <div className="flex flex-col items-center justify-center py-xxl text-center mb-xl">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-lg">
            <Icon name="task_alt" size={48} className="text-primary" filled />
          </div>
          <h2 className="text-headline-md text-on-surface mb-sm">You're all caught up!</h2>
          <p className="text-body-lg text-on-surface-variant max-w-md">Everything on your list is done. Take a moment to breathe or check in with your team.</p>
          <Link to="/dashboard">
            <Button className="mt-xl">Go to Dashboard</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-xl mb-xxl">
          {/* Overdue */}
          {tasks.overdue.length > 0 && (
            <section>
              <div className="flex items-center gap-sm mb-lg">
                <Icon name="error_outline" size={22} className="text-error" />
                <h2 className="text-headline-md text-error">Overdue</h2>
                <span className="px-sm py-[2px] bg-error-container text-on-error-container rounded-full text-[11px] font-bold">{tasks.overdue.filter((t) => !t.done).length} TASKS</span>
              </div>
              <div className="flex flex-col gap-md">
                {tasks.overdue.map((t) => <TaskItem key={t.id} task={t} onComplete={markComplete} />)}
              </div>
            </section>
          )}

          {/* Due Today */}
          {tasks.today.length > 0 && (
            <section>
              <div className="flex items-center gap-sm mb-lg">
                <Icon name="event" size={22} className="text-primary" />
                <h2 className="text-headline-md text-on-surface">Due Today</h2>
                <span className="px-sm py-[2px] bg-primary-container/10 text-primary rounded-full text-[11px] font-bold">{tasks.today.filter((t) => !t.done).length} TASK</span>
              </div>
              <div className="flex flex-col gap-md">
                {tasks.today.map((t) => <TaskItem key={t.id} task={t} onComplete={markComplete} />)}
              </div>
            </section>
          )}

          {/* Upcoming */}
          {tasks.upcoming.length > 0 && (
            <section>
              <div className="flex items-center gap-sm mb-lg">
                <Icon name="calendar_today" size={22} className="text-on-surface-variant" />
                <h2 className="text-headline-md text-on-surface">Upcoming</h2>
                <span className="px-sm py-[2px] bg-surface-container-high text-on-surface-variant rounded-full text-[11px] font-bold">{tasks.upcoming.filter((t) => !t.done).length} TASKS</span>
              </div>
              <div className="flex flex-col gap-md">
                {tasks.upcoming.map((t) => <TaskItem key={t.id} task={t} onComplete={markComplete} />)}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Stats bento */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {STATS.map((s) => (
          <div key={s.label} className={`p-lg rounded-2xl ${s.bg} flex flex-col justify-between h-[160px] ${s.border ? 'border border-outline-variant' : 'shadow-lg shadow-primary/10'}`}>
            <Icon name={s.icon} size={32} className={s.text} />
            <div>
              <span className="text-headline-xl text-on-surface block">{s.value}</span>
              <span className="text-label-md text-on-surface-variant uppercase tracking-wider">{s.label}</span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
