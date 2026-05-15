import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

const TEMPLATES = [
  { id: 'eng',    icon: 'engineering', iconBg: 'bg-primary/10',                  iconColor: 'text-primary',   name: 'Software Engineer Onboarding',   tasks: 24, edited: '2 days ago',       badge: 'standard',  badgeLabel: 'Standard' },
  { id: 'sales',  icon: 'payments',    iconBg: 'bg-tertiary-fixed-dim/20',       iconColor: 'text-tertiary',  name: 'Sales & Account Management',     tasks: 18, edited: 'Oct 12, 2023',     badge: 'admin',     badgeLabel: 'Sales Ops' },
  { id: 'design', icon: 'palette',     iconBg: 'bg-secondary-fixed/30',          iconColor: 'text-secondary', name: 'Creative & Design Systems',      tasks: 12, edited: 'Sep 28, 2023',     badge: null,        badgeLabel: null },
  { id: 'legal',  icon: 'balance',     iconBg: 'bg-on-tertiary-fixed-variant/10',iconColor: 'text-on-tertiary-fixed-variant', name: 'Legal & Compliance Core', tasks: 32, edited: 'Yesterday', badge: 'mandatory', badgeLabel: 'Mandatory' },
];

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = TEMPLATES.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-[1200px] mx-auto p-margin">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-lg mb-xxl">
        <div>
          <h1 className="text-headline-xl text-on-surface mb-xs">Onboarding Templates</h1>
          <p className="text-body-md text-on-surface-variant">Standardize the experience for every new hire with reusable task workflows.</p>
        </div>
        <Button onClick={() => navigate('/templates/new')} className="self-start flex-shrink-0">
          <Icon name="add" size={20} />
          New Template
        </Button>
      </div>

      {/* Search & filter bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-lg mb-xl">
        <div className="md:col-span-8 relative">
          <Icon name="search" size={20} className="absolute left-md top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates by name…"
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-[44px] pr-md py-md text-body-md focus:ring-2 focus:ring-primary focus:ring-offset-2 outline-none transition-all"
          />
        </div>
        <div className="md:col-span-4 flex gap-sm">
          <button className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-md text-label-md text-on-surface-variant flex items-center justify-center gap-sm hover:bg-surface-container-low transition-colors">
            <Icon name="filter_list" size={18} />
            Filters
          </button>
          <button className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-md py-md text-label-md text-on-surface-variant flex items-center justify-center gap-sm hover:bg-surface-container-low transition-colors">
            <Icon name="sort" size={18} />
            Latest
          </button>
        </div>
      </div>

      {/* Template list */}
      {filtered.length === 0 ? (
        <div className="mb-xl">
          {/* Empty state — show example card users can clone */}
          <div className="group bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-xl p-lg flex items-center justify-between mb-md">
            <div className="flex items-center gap-lg">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Icon name="engineering" size={28} />
              </div>
              <div>
                <h3 className="text-headline-md text-on-surface">Engineering — Full Time</h3>
                <p className="text-label-md text-on-surface-variant mt-xs">Example template • 20 tasks</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => navigate('/templates/new')}>
              <Icon name="content_copy" size={16} />
              Clone
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-md mb-xl">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="group bg-surface-container-lowest border border-outline-variant rounded-lg p-lg flex items-center justify-between hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-lg">
                <div className={`w-12 h-12 ${t.iconBg} rounded-xl flex items-center justify-center ${t.iconColor} flex-shrink-0`}>
                  <Icon name={t.icon} size={28} />
                </div>
                <div>
                  <h3 className="text-headline-md text-on-surface group-hover:text-primary transition-colors">{t.name}</h3>
                  <div className="flex items-center gap-md mt-xs flex-wrap">
                    <span className="flex items-center gap-xs text-label-md text-on-surface-variant">
                      <Icon name="task_alt" size={16} />
                      {t.tasks} Tasks
                    </span>
                    <span className="w-1 h-1 rounded-full bg-outline-variant" />
                    <span className="text-label-md text-on-surface-variant">Edited {t.edited}</span>
                    {t.badge && (
                      <Badge variant={t.badge} className="ml-sm">{t.badgeLabel}</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-sm flex-shrink-0">
                <button
                  onClick={() => navigate(`/templates/${t.id}`)}
                  className="p-sm text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-full transition-colors"
                >
                  <Icon name="edit" size={20} />
                </button>
                <button className="p-sm text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-full transition-colors">
                  <Icon name="more_vert" size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bento tip / footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        <div className="md:col-span-2 bg-primary-container text-on-primary-container p-xl rounded-xl relative overflow-hidden flex flex-col justify-between min-h-[160px]">
          <div className="relative z-10">
            <h4 className="text-headline-md mb-sm">Pro Tip: Task Automation</h4>
            <p className="text-body-md opacity-90 max-w-md">
              Assign hardware setup tasks only when the employee is marked as an office hire. Use conditional logic to streamline each template.
            </p>
          </div>
          <div className="relative z-10 mt-md">
            <button className="bg-surface-container-lowest text-primary px-md py-sm rounded-lg text-label-md hover:bg-surface-bright transition-colors">
              Learn about Logic
            </button>
          </div>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-on-primary-container/10 rounded-full blur-3xl" />
        </div>
        <div className="bg-surface-container-highest/50 border border-outline-variant border-dashed p-xl rounded-xl flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant mb-md">
            <Icon name="history" size={24} />
          </div>
          <p className="text-label-md text-on-surface-variant mb-xs">Looking for an old version?</p>
          <button className="text-label-md text-primary hover:underline">View Archive</button>
        </div>
      </div>
    </div>
  );
}
