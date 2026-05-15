import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const INITIAL_TASKS = [
  { id: 1, title: 'Provision Laptop',          assignee: 'IT Team',    offset: '-3 days' },
  { id: 2, title: 'Welcome Packet Preparation', assignee: 'HR Manager', offset: '-5 days' },
  { id: 3, title: 'Security Badge Issue',       assignee: 'IT',         offset: '0 days'  },
  { id: 4, title: '1-on-1 Meet & Greet',        assignee: 'Manager',    offset: '+1 day'  },
];

const TEMPLATE_META = {
  eng:    { name: 'Software Engineer Onboarding', desc: 'Standard workflow for technical new hires.' },
  sales:  { name: 'Sales & Account Management',   desc: 'Workflow for sales team onboarding.' },
  design: { name: 'Creative & Design Systems',    desc: 'Onboarding for design team members.' },
  legal:  { name: 'Legal & Compliance Core',      desc: 'Mandatory compliance onboarding.' },
};

export default function TemplateEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const meta = TEMPLATE_META[id] ?? { name: 'New Template', desc: 'Custom onboarding workflow.' };

  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [templateName, setTemplateName] = useState(meta.name);
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState(null);

  function updateTask(taskId, field, value) {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, [field]: value } : t));
  }

  function deleteTask(taskId) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }

  function addTask() {
    const newTask = { id: Date.now(), title: '', assignee: '', offset: '0 days' };
    setTasks((prev) => [...prev, newTask]);
  }

  async function save() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    toast.success('Template saved!');
    setSaving(false);
  }

  const preTasks  = tasks.filter((t) => t.offset.startsWith('-'));
  const dayTasks  = tasks.filter((t) => t.offset === '0 days');
  const postTasks = tasks.filter((t) => t.offset.startsWith('+'));

  return (
    <div className="max-w-5xl mx-auto p-margin">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-xl gap-md">
        <div>
          <button onClick={() => navigate('/templates')} className="flex items-center gap-xs text-primary text-label-md mb-sm hover:text-on-primary-fixed-variant transition-colors">
            <Icon name="arrow_back" size={16} />
            Back to Templates
          </button>
          <h1 className="text-headline-xl text-on-surface mb-xs">{templateName}</h1>
          <p className="text-body-md text-on-surface-variant">{meta.desc}</p>
        </div>
        <div className="flex gap-sm flex-shrink-0">
          <Button variant="secondary" size="sm">Duplicate</Button>
          <Button variant="danger" size="sm">Archive</Button>
          <Button onClick={save} disabled={saving} size="sm">
            <Icon name="save" size={16} />
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Template name */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg mb-md">
        <label className="text-label-md text-on-surface-variant mb-xs block">Template Name</label>
        <input
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          className="w-full bg-transparent border-none focus:ring-0 text-headline-md font-semibold text-on-surface outline-none"
        />
      </div>

      {/* Task list */}
      <div className="flex flex-col gap-sm mb-xl">
        {/* Column headers */}
        <div className="hidden md:grid grid-cols-12 gap-md px-md py-sm text-label-md text-on-surface-variant">
          <div className="col-span-1" />
          <div className="col-span-5">Task Title</div>
          <div className="col-span-3">Assigned To</div>
          <div className="col-span-2">Due Offset</div>
          <div className="col-span-1" />
        </div>

        {tasks.map((task) => (
          <div
            key={task.id}
            draggable
            onDragStart={() => setDragId(task.id)}
            onDragEnd={() => setDragId(null)}
            className={`group flex items-center gap-md p-md bg-surface-container-lowest border border-outline-variant rounded-lg hover:border-primary transition-colors ${dragId === task.id ? 'opacity-50' : ''}`}
          >
            <div className="cursor-grab text-outline-variant group-hover:text-outline transition-colors flex-shrink-0">
              <Icon name="drag_indicator" size={20} />
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-md items-center">
              <div className="md:col-span-5">
                <input
                  value={task.title}
                  onChange={(e) => updateTask(task.id, 'title', e.target.value)}
                  placeholder="Task title…"
                  className="w-full bg-transparent border-none focus:ring-0 text-body-lg text-on-surface px-0 py-xs outline-none placeholder:text-outline-variant"
                />
              </div>
              <div className="md:col-span-3">
                <div className="flex items-center gap-sm px-sm py-xs bg-surface-container rounded-lg border border-transparent hover:border-outline-variant transition-colors">
                  <Icon name="person" size={16} className="text-on-surface-variant flex-shrink-0" />
                  <input
                    value={task.assignee}
                    onChange={(e) => updateTask(task.id, 'assignee', e.target.value)}
                    placeholder="Assignee…"
                    className="flex-1 bg-transparent border-none focus:ring-0 text-label-md outline-none min-w-0"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <input
                  value={task.offset}
                  onChange={(e) => updateTask(task.id, 'offset', e.target.value)}
                  placeholder="0 days"
                  className="w-full font-mono text-code-sm text-on-surface-variant bg-transparent border-none focus:ring-0 outline-none"
                />
              </div>
              <div className="md:col-span-2 flex justify-end gap-sm">
                <button className="p-xs text-outline hover:text-primary transition-colors">
                  <Icon name="settings" size={18} />
                </button>
                <button onClick={() => deleteTask(task.id)} className="p-xs text-outline hover:text-error transition-colors">
                  <Icon name="delete" size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add task button */}
        <button
          onClick={addTask}
          className="w-full flex items-center justify-center gap-sm p-xl border-2 border-dashed border-outline-variant rounded-lg text-on-surface-variant hover:border-primary hover:text-primary transition-all group"
        >
          <Icon name="add_circle" size={22} className="group-hover:scale-110 transition-transform" />
          <span className="text-label-md font-bold uppercase tracking-wide">Add New Task</span>
        </button>
      </div>

      {/* Meta details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg">
          <h3 className="text-label-md text-on-surface-variant uppercase tracking-wider mb-md">Timeline Overview</h3>
          <div className="flex flex-col gap-sm">
            <div className="flex justify-between text-body-md">
              <span>Pre-boarding Tasks</span>
              <span className="font-semibold text-primary">{preTasks.length} Tasks</span>
            </div>
            <div className="flex justify-between text-body-md">
              <span>Day 1 Tasks</span>
              <span className="font-semibold text-primary">{dayTasks.length} Tasks</span>
            </div>
            <div className="flex justify-between text-body-md">
              <span>Post-boarding Tasks</span>
              <span className="font-semibold text-primary">{postTasks.length} Tasks</span>
            </div>
          </div>
        </div>
        <div className="col-span-2 bg-primary-container/5 border border-primary-container/20 rounded-lg p-lg flex items-center gap-lg">
          <div>
            <h3 className="text-headline-md text-primary mb-xs">Auto-Assign Logic</h3>
            <p className="text-body-md text-on-surface-variant">
              This template automatically creates tasks for designated roles upon employee activation. Ensure all roles are mapped in Settings.
            </p>
          </div>
          <div className="flex-shrink-0 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon name="smart_toy" size={36} className="text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
