import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Icon from '../components/Icon';
import Button from '../components/ui/Button';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

const schema = z
  .object({
    password:        z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string(),
    terms:           z.literal(true, { errorMap: () => ({ message: 'Required' }) }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function AcceptInvitationPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const email = params.get('email') ?? 'invited@company.com';
  const orgName = params.get('org') ?? 'Acme Corp';

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setAuth({ firstName: 'New', lastName: 'Member', email, organizationName: orgName }, 'mock-jwt-token');
    toast.success(`Welcome to ${orgName}!`);
    navigate('/dashboard');
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-md">
      <div className="fixed bottom-0 left-0 w-full h-32 -z-10 pointer-events-none opacity-30 bg-gradient-to-t from-primary-fixed to-transparent" />

      <main className="w-full max-w-[440px] flex flex-col gap-xl">
        <div className="flex flex-col items-center text-center gap-sm">
          <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center mb-sm">
            <Icon name="group_add" className="text-on-primary" size={28} />
          </div>
          <h1 className="text-headline-xl text-on-surface">Accept invitation</h1>
          <p className="text-body-lg text-on-surface-variant">
            You've been invited to join <strong>{orgName}</strong> on Columbus.
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl shadow-card">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-lg">
            {/* Read-only email */}
            <div className="flex flex-col gap-xs">
              <label className="text-label-md text-on-surface-variant">Email</label>
              <div className="h-12 px-md flex items-center bg-surface-container-low border border-outline-variant rounded-lg text-body-md text-on-surface-variant">
                {email}
              </div>
            </div>

            <div className="flex flex-col gap-xs">
              <label className="text-label-md text-on-surface-variant">Create password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  className={`w-full h-12 px-md pr-12 bg-white border rounded-lg text-body-md placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all ${errors.password ? 'border-error' : 'border-outline-variant'}`}
                  {...register('password')}
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  <Icon name={showPw ? 'visibility_off' : 'visibility'} size={20} />
                </button>
              </div>
              {errors.password && <p className="text-label-md text-error">{errors.password.message}</p>}
            </div>

            <div className="flex flex-col gap-xs">
              <label className="text-label-md text-on-surface-variant">Confirm password</label>
              <input
                type="password"
                placeholder="Repeat password"
                className={`w-full h-12 px-md bg-white border rounded-lg text-body-md placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all ${errors.confirmPassword ? 'border-error' : 'border-outline-variant'}`}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && <p className="text-label-md text-error">{errors.confirmPassword.message}</p>}
            </div>

            <label className="flex items-start gap-sm cursor-pointer">
              <input type="checkbox" className="mt-0.5 rounded border-outline-variant text-primary focus:ring-primary" {...register('terms')} />
              <span className="text-label-md text-on-surface-variant">
                I agree to the{' '}
                <a href="#" className="text-primary hover:underline">Terms of Service</a> and{' '}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </span>
            </label>
            {errors.terms && <p className="text-label-md text-error -mt-sm">{errors.terms.message}</p>}

            <Button type="submit" variant="indigo" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Joining…' : `Join ${orgName}`}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
