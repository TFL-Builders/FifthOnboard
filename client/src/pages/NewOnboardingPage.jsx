import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Icon from '../components/Icon';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const schema = z.object({
  firstName:    z.string().min(1, 'Required'),
  lastName:     z.string().min(1, 'Required'),
  email:        z.string().email('Valid email required'),
  role:         z.string().min(1, 'Required'),
  department:   z.string().min(1, 'Required'),
  manager:      z.string().min(1, 'Required'),
  templateId:   z.string().min(1, 'Select a template'),
  startDate:    z.string().min(1, 'Required'),
});

const TEMPLATES = [
  { id: 'eng',     label: 'Software Engineer Onboarding', tasks: 24 },
  { id: 'sales',   label: 'Sales & Account Management',   tasks: 18 },
  { id: 'design',  label: 'Creative & Design Systems',    tasks: 12 },
  { id: 'legal',   label: 'Legal & Compliance Core',      tasks: 32 },
];

const STEP_LABELS = ['New Hire Details', 'Select Template', 'Review & Launch'];

export default function NewOnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { templateId: '' },
  });

  const selectedTemplate = watch('templateId');

  async function onSubmit(data) {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success(`Onboarding created for ${data.firstName} ${data.lastName}!`);
    navigate('/onboardings');
  }

  return (
    <div className="max-w-[640px] mx-auto p-margin">
      {/* Back */}
      <button onClick={() => navigate('/onboardings')} className="flex items-center gap-xs text-primary text-label-md mb-xl hover:text-on-primary-fixed-variant transition-colors">
        <Icon name="arrow_back" size={16} />
        Back to Onboardings
      </button>

      <h1 className="text-headline-xl text-on-surface mb-xs">New Onboarding</h1>
      <p className="text-body-md text-on-surface-variant mb-xl">Set up a new hire's onboarding workflow.</p>

      {/* Stepper */}
      <div className="flex items-center gap-xs mb-xl">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const isActive = step === n;
          const isDone   = step > n;
          return (
            <div key={n} className="flex items-center gap-xs flex-1 last:flex-none">
              <div className="flex items-center gap-sm flex-shrink-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${isDone ? 'bg-primary text-on-primary' : isActive ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                  {isDone ? <Icon name="check" size={14} /> : n}
                </div>
                <span className={`text-label-md hidden sm:block ${isActive ? 'text-on-surface font-semibold' : 'text-on-surface-variant'}`}>{label}</span>
              </div>
              {i < STEP_LABELS.length - 1 && <div className="flex-1 h-px bg-outline-variant" />}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1 */}
        {step === 1 && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl flex flex-col gap-lg">
            <h2 className="text-headline-md text-on-surface">New Hire Details</h2>
            <div className="grid grid-cols-2 gap-md">
              <Input label="First Name" error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Last Name"  error={errors.lastName?.message}  {...register('lastName')} />
            </div>
            <Input label="Work Email" type="email" error={errors.email?.message} {...register('email')} />
            <Input label="Job Title / Role" placeholder="e.g. Senior Software Engineer" error={errors.role?.message} {...register('role')} />
            <div className="grid grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs">
                <label className="text-label-md text-on-surface-variant">Department</label>
                <select className="h-12 px-md bg-white border border-outline-variant rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" {...register('department')}>
                  <option value="">Select department</option>
                  <option>Engineering</option>
                  <option>Marketing</option>
                  <option>Sales</option>
                  <option>Design</option>
                  <option>Legal</option>
                  <option>Operations</option>
                </select>
                {errors.department && <p className="text-label-md text-error">{errors.department.message}</p>}
              </div>
              <Input label="Start Date" type="date" error={errors.startDate?.message} {...register('startDate')} />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="text-label-md text-on-surface-variant">Hiring Manager</label>
              <select className="h-12 px-md bg-white border border-outline-variant rounded-lg text-body-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" {...register('manager')}>
                <option value="">Select manager</option>
                <option>Michael Chen</option>
                <option>Sarah Jenkins</option>
                <option>Elena Rodriguez</option>
                <option>Tom Hardy</option>
              </select>
              {errors.manager && <p className="text-label-md text-error">{errors.manager.message}</p>}
            </div>
            <div className="flex justify-end">
              <Button type="button" onClick={() => setStep(2)}>
                Next
                <Icon name="arrow_forward" size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl flex flex-col gap-lg">
            <h2 className="text-headline-md text-on-surface">Select Template</h2>
            <div className="flex flex-col gap-md">
              {TEMPLATES.map((t) => (
                <label key={t.id} className={`flex items-center justify-between p-lg border rounded-xl cursor-pointer transition-all ${selectedTemplate === t.id ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/40'}`}>
                  <div className="flex items-center gap-md">
                    <input type="radio" value={t.id} className="text-primary focus:ring-primary" {...register('templateId')} />
                    <div>
                      <p className="text-body-md font-semibold text-on-surface">{t.label}</p>
                      <p className="text-label-md text-on-surface-variant">{t.tasks} tasks</p>
                    </div>
                  </div>
                  {selectedTemplate === t.id && <Icon name="check_circle" className="text-primary" size={20} filled />}
                </label>
              ))}
            </div>
            {errors.templateId && <p className="text-label-md text-error">{errors.templateId.message}</p>}
            <div className="flex justify-between">
              <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                <Icon name="arrow_back" size={16} />
                Back
              </Button>
              <Button type="button" onClick={() => setStep(3)}>
                Next
                <Icon name="arrow_forward" size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl flex flex-col gap-lg">
            <h2 className="text-headline-md text-on-surface">Review & Launch</h2>
            <div className="bg-surface-container-low border border-outline-variant rounded-lg p-lg flex flex-col gap-sm">
              <p className="text-label-md font-bold text-on-surface-variant uppercase tracking-wider mb-xs">Summary</p>
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">Name</span>
                <span className="font-medium text-on-surface">{watch('firstName')} {watch('lastName')}</span>
              </div>
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">Role</span>
                <span className="font-medium text-on-surface">{watch('role') || '—'}</span>
              </div>
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">Template</span>
                <span className="font-medium text-on-surface">{TEMPLATES.find((t) => t.id === selectedTemplate)?.label || '—'}</span>
              </div>
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">Start Date</span>
                <span className="font-medium text-on-surface">{watch('startDate') || '—'}</span>
              </div>
              <div className="flex justify-between text-body-md">
                <span className="text-on-surface-variant">Manager</span>
                <span className="font-medium text-on-surface">{watch('manager') || '—'}</span>
              </div>
            </div>
            <p className="text-body-md text-on-surface-variant">
              An invitation email will be sent to <strong>{watch('email')}</strong> with a link to the onboarding portal.
            </p>
            <div className="flex justify-between">
              <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                <Icon name="arrow_back" size={16} />
                Back
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Launching…' : 'Launch Onboarding'}
                {!loading && <Icon name="rocket_launch" size={16} />}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
