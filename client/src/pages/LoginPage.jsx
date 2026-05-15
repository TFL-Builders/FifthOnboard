import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Icon from '../components/Icon';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setAuth } = useAuthStore();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data) {
    setLoading(true);
    try {
      // Mock auth — replace with real API call
      await new Promise((r) => setTimeout(r, 600));
      setAuth(
        { firstName: 'Sarah', lastName: 'Chen', email: data.email, organizationName: 'Acme Corp' },
        'mock-jwt-token',
      );
      const from = params.get('from') || '/dashboard';
      navigate(from, { replace: true });
    } catch {
      toast.error('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-md">
      {/* Decorative gradient */}
      <div className="fixed bottom-0 left-0 w-full h-32 -z-10 pointer-events-none opacity-30 bg-gradient-to-t from-primary-fixed to-transparent" />

      <main className="w-full max-w-[440px] flex flex-col gap-xl">
        {/* Brand */}
        <div className="flex flex-col items-center text-center gap-sm">
          <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center mb-sm">
            <Icon name="explore" className="text-on-primary" size={28} />
          </div>
          <h1 className="text-headline-xl text-on-surface">Sign in</h1>
          <p className="text-body-lg text-on-surface-variant">Welcome back! Please enter your details.</p>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl shadow-card">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-lg">
            <Input
              label="Email"
              type="email"
              placeholder="sarah@company.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="flex flex-col gap-xs">
              <label className="text-label-md text-on-surface-variant">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full h-12 px-md pr-12 bg-white border rounded-lg text-body-md placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all ${errors.password ? 'border-error' : 'border-outline-variant'}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <Icon name={showPw ? 'visibility_off' : 'visibility'} size={20} />
                </button>
              </div>
              {errors.password && <p className="text-label-md text-error">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-sm cursor-pointer">
                <input type="checkbox" className="rounded border-outline-variant text-primary focus:ring-primary" {...register('remember')} />
                <span className="text-label-md text-on-surface-variant">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-label-md text-primary font-semibold hover:text-on-primary-fixed-variant transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="indigo" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>

            <div className="flex items-center gap-md">
              <div className="h-px flex-1 bg-outline-variant" />
              <span className="text-label-md text-outline">OR</span>
              <div className="h-px flex-1 bg-outline-variant" />
            </div>

            <Button type="button" variant="secondary" size="lg" className="w-full">
              <svg width="18" height="18" viewBox="0 0 24 24" className="flex-shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
          </form>
        </div>

        <p className="text-center text-body-md text-on-surface-variant">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-semibold hover:underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </main>
    </div>
  );
}
