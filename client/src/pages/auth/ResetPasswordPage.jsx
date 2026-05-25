import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useSearchParams } from 'react-router-dom'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import AuthLayout from '../../features/auth/AuthLayout'
import AuthCard from '../../features/auth/AuthCard'
import PasswordInput from '../../components/ui/PasswordInput'
import Button from '../../components/ui/Button'
import { authApi } from '../../api/auth'

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export default function ResetPasswordPage() {
  console.log("ResetPasswordPage rendered");
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [done, setDone] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  async function onSubmit(data) {
    setServerError('')
    if (!token) {
      setServerError('Reset link is invalid or has expired. Please request a new one.')
      return
    }
    try {
      await authApi.resetPassword({ token, password: data.password })
      setDone(true)
    } catch (err) {
      setServerError(
        err.response?.data?.error ?? 'Something went wrong. Please try again.',
      )
    }
  }

  if (done) {
    return (
      <AuthLayout>
        <div
          className="rounded-[8px] border p-8 text-center"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-success/10">
              <ShieldCheck size={24} className="text-success" aria-hidden="true" />
            </div>
          </div>
          <h1
            className="text-[20px] font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Password updated
          </h1>
          <p className="text-[14px] mb-6" style={{ color: 'var(--text-secondary)' }}>
            Your password has been reset successfully.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-[14px] text-primary hover:text-primary-hover font-medium transition-colors"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Sign in to Columbus
          </Link>
        </div>
      </AuthLayout>
    )
  }

  if (!token) {
    return (
      <AuthLayout>
        <div
          className="rounded-[8px] border p-8 text-center"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <h1
            className="text-[20px] font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Invalid reset link
          </h1>
          <p className="text-[14px] mb-6" style={{ color: 'var(--text-secondary)' }}>
            This link is invalid or has expired. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="text-[14px] text-primary hover:text-primary-hover font-medium transition-colors"
          >
            Request a new link
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Set a new password"
        description="Choose a strong password for your Columbus account."
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <PasswordInput
            id="password"
            label="New password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <PasswordInput
            id="confirmPassword"
            label="Confirm new password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {serverError && (
            <div
              className="rounded-[8px] border px-4 py-3 text-[13px] text-danger"
              style={{ borderColor: 'rgba(220,38,38,0.25)', backgroundColor: 'rgba(220,38,38,0.05)' }}
              role="alert"
              aria-live="assertive"
            >
              {serverError}
            </div>
          )}

          <Button type="submit" className="w-full mt-2" loading={isSubmitting}>
            Reset password
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
