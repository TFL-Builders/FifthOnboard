import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Icon from '../components/Icon';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const schema = z
  .object({
    password:        z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8)       score++;
  if (/[A-Z]/.test(pw))     score++;
  if (/[0-9]/.test(pw))     score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', 'bg-error', 'bg-tertiary', 'bg-secondary', 'bg-primary'];

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pw, setPw] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const strength = getStrength(pw);

  async function onSubmit() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    toast.success('Password reset! Please sign in.');
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-md">
      <div className="fixed bottom-0 left-0 w-full h-32 -z-10 pointer-events-none opacity-30 bg-gradient-to-t from-primary-fixed to-transparent" />

      <main className="w-full max-w-[440px] flex flex-col gap-xl">
        <div className="flex flex-col items-center text-center gap-sm">
          <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center mb-sm">
            <Icon name="lock" className="text-on-primary" size={28} />
          </div>
          <h1 className="text-headline-xl text-on-surface">Set new password</h1>
          <p className="text-body-lg text-on-surface-variant">Must be at least 8 characters.</p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl shadow-card">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-lg">
            <div className="flex flex-col gap-xs">
              <label className="text-label-md text-on-surface-variant">New password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full h-12 px-md pr-12 bg-white border rounded-lg text-body-md placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all ${errors.password ? 'border-error' : 'border-outline-variant'}`}
                  {...register('password', { onChange: (e) => setPw(e.target.value) })}
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  <Icon name={showPw ? 'visibility_off' : 'visibility'} size={20} />
                </button>
              </div>
              {pw && (
                <div className="flex gap-xs mt-xs">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? STRENGTH_COLORS[strength] : 'bg-surface-container-high'}`} />
                  ))}
                  <span className="text-label-md text-on-surface-variant ml-xs">{STRENGTH_LABELS[strength]}</span>
                </div>
              )}
              {errors.password && <p className="text-label-md text-error">{errors.password.message}</p>}
            </div>

            <div className="flex flex-col gap-xs">
              <label className="text-label-md text-on-surface-variant">Confirm password</label>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full h-12 px-md bg-white border rounded-lg text-body-md placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all ${errors.confirmPassword ? 'border-error' : 'border-outline-variant'}`}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && <p className="text-label-md text-error">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" variant="indigo" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Resetting…' : 'Reset password'}
            </Button>
          </form>
        </div>

        <p className="text-center text-body-md text-on-surface-variant">
          <Link to="/login" className="text-primary font-semibold hover:underline underline-offset-4 flex items-center justify-center gap-xs">
            <Icon name="arrow_back" size={16} />
            Back to sign in
          </Link>
        </p>
      </main>
    </div>
  );
}
