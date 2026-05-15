import { useState } from 'react';
import Icon from '../components/Icon';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

const SECTIONS = [
  {
    key: 'preboard',
    icon: 'event_upcoming',
    iconBg: 'bg-tertiary-fixed',
    iconColor: 'text-tertiary',
    label: 'Before Day One',
    tasks: [
      { id: 1, title: 'Sign Employment Agreement',  desc: 'Review and digitally sign your contract.',         status: 'done',    done: true  },
      { id: 2, title: 'Set Up Payroll Information', desc: 'Submit your bank details and tax forms.',          status: 'pending', done: false },
      { id: 3, title: 'Submit Identity Verification',desc: 'Upload a photo of your ID or Passport.',         status: 'pending', done: false },
    ],
    locked: false,
  },
  {
    key: 'week1',
    icon: 'filter_1',
    iconBg: 'bg-primary-fixed',
    iconColor: 'text-primary',
    label: 'Week 1',
    tasks: [],
    locked: true,
    lockedMsg: 'Unlocks on your first day',
    lockedDesc: 'Complete your pre-boarding tasks to get a head start on your first week orientation and hardware setup.',
  },
  {
    key: 'week2',
    icon: 'filter_2',
    iconBg: 'bg-secondary-fixed',
    iconColor: 'text-secondary',
    label: 'Week 2',
    tasks: [
      { id: 10, title: 'Meet Your Mentor', desc: 'Introduction to your team and workflow.', status: 'locked', done: false },
    ],
    locked: true,
    tasksLocked: true,
  },
];

function TaskRow({ task, onToggle, sectionLocked }) {
  const isDone    = task.status === 'done';
  const isLocked  = task.status === 'locked' || sectionLocked;

  return (
    <div
      onClick={() => !isLocked && onToggle(task.id)}
      className={`bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex items-center justify-between transition-colors ${!isLocked ? 'hover:border-primary cursor-pointer group' : 'opacity-50'}`}
    >
      <div className="flex items-center gap-md">
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isDone ? 'border-primary-container bg-primary-container/20' : 'border-outline'}`}>
          {isDone && <Icon name="check" size={14} className="text-primary-container" />}
        </div>
        <div>
          <h3 className={`text-body-lg font-semibold text-on-surface ${isDone ? 'line-through' : ''}`}>{task.title}</h3>
          <p className="text-body-md text-on-surface-variant">{task.desc}</p>
        </div>
      </div>
      <Badge variant={isDone ? 'done' : task.status === 'locked' ? 'pending' : 'pending'} className="flex-shrink-0">
        {isDone ? 'Done' : isLocked ? 'Locked' : 'Pending'}
      </Badge>
    </div>
  );
}

export default function HirePortalPage() {
  const { user } = useAuthStore();
  const [sections, setSections] = useState(SECTIONS);

  function toggleTask(taskId) {
    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        tasks: sec.tasks.map((t) =>
          t.id === taskId ? { ...t, done: !t.done, status: !t.done ? 'done' : 'pending' } : t
        ),
      }))
    );
  }

  const allTasks   = sections.flatMap((s) => s.tasks);
  const doneTasks  = allTasks.filter((t) => t.status === 'done');
  const totalTasks = allTasks.filter((t) => t.status !== 'locked').length;
  const progress   = totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0;

  const firstName = user?.firstName ?? 'David';

  return (
    <div className="pt-[88px] pb-xxl px-md md:px-margin max-w-[720px] mx-auto">
      {/* Welcome */}
      <header className="mb-xl text-center md:text-left">
        <h1 className="text-headline-xl text-on-surface mb-sm">Hi {firstName}, welcome to the team!</h1>
        <p className="text-body-lg text-on-surface-variant">We're thrilled to have you here. Let's get you set up and ready for your first day.</p>
      </header>

      {/* Progress card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg mb-xl">
        <div className="flex justify-between items-center mb-md">
          <span className="text-label-md uppercase tracking-wider text-on-surface-variant">Overall Progress</span>
          <span className="text-headline-md text-primary">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
          <div className="h-full bg-primary-container rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-md flex items-center gap-sm text-on-surface-variant">
          <Icon name="info" size={18} />
          <span className="text-body-md">{doneTasks.length} of {totalTasks} tasks completed. Keep it up!</span>
        </div>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-xl">
        {sections.map((section) => (
          <section key={section.key}>
            <div className="flex items-center gap-sm mb-lg">
              <div className={`w-10 h-10 rounded-lg ${section.iconBg} flex items-center justify-center ${section.iconColor} flex-shrink-0`}>
                <Icon name={section.icon} size={22} />
              </div>
              <h2 className="text-headline-md text-on-surface">{section.label}</h2>
            </div>

            {section.locked && !section.tasksLocked ? (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-md">
                  <Icon name="lock_clock" size={32} className="text-on-surface-variant" />
                </div>
                <h3 className="text-headline-md text-on-surface mb-sm">{section.lockedMsg}</h3>
                <p className="text-body-md text-on-surface-variant max-w-md">{section.lockedDesc}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-md">
                {section.tasks.map((task) => (
                  <TaskRow key={task.id} task={task} onToggle={toggleTask} sectionLocked={section.tasksLocked} />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Footer / buddy */}
      <footer className="mt-xxl pt-xl border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-md">
        <div className="flex items-center gap-sm">
          <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
            SM
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant font-bold">Your Onboarding Buddy</p>
            <p className="text-body-md text-on-surface">Sarah Miller</p>
          </div>
        </div>
        <Button variant="indigo" onClick={() => toast('Message Sarah — coming soon!')}>
          <Icon name="person" size={18} />
          Contact Sarah
        </Button>
      </footer>
    </div>
  );
}
