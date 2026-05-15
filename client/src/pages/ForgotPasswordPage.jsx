import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Icon from '../components/Icon';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const schema = z.object({ email: z.string().email('Enter a valid email') });

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, getValues, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setSent(true);
    setLoading(false);
    toast.success('Reset link sent!');
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-md">
      <div className="fixed bottom-0 left-0 w-full h-32 -z-10 pointer-events-none opacity-30 bg-gradient-to-t from-primary-fixed to-transparent" />

      <main className="w-full max-w-[440px] flex flex-col gap-xl">
        <div className="flex flex-col items-center text-center gap-sm">
          <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center mb-sm">
            <Icon name="lock_reset" className="text-on-primary" size={28} />
          </div>
          <h1 className="text-headline-xl text-on-surface">Forgot password?</h1>
          <p className="text-body-lg text-on-surface-variant">
            No worries — we'll send you reset instructions.
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl shadow-card">
          {sent ? (
            <div className="flex flex-col items-center text-center gap-lg">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="mark_email_read" className="text-primary" size={32} />
              </div>
              <div>
                <h2 className="text-headline-md text-on-surface mb-xs">Check your email</h2>
                <p className="text-body-md text-on-surface-variant">
                  We sent a reset link to <strong>{getValues('email')}</strong>. It expires in 30 minutes.
                </p>
              </div>
              <Button variant="secondary" size="lg" className="w-full" onClick={() => setSent(false)}>
                Didn't receive it? Resend
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-lg">
              <Input
                label="Email"
                type="email"
                placeholder="sarah@company.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <Button type="submit" variant="indigo" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Sending…' : 'Send reset link'}
              </Button>
            </form>
          )}
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
