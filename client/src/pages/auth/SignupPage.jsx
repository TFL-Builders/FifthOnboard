import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../features/auth/AuthLayout'
import AuthCard from '../../features/auth/AuthCard'
import Input from '../../components/ui/Input'
import PasswordInput from '../../components/ui/PasswordInput'
import Button from '../../components/ui/Button'
import { authApi } from '../../api/auth'
import useAuthStore from '../../stores/authStore'

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    organizationName: z.string().min(1, 'Organization name is required').max(100),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export default function SignupPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  async function onSubmit(data) {
    setServerError('')
    try {
      const res = await authApi.signup({
        name: data.name,
        email: data.email,
        password: data.password,
        organizationName: data.organizationName,
      })
      setAuth(res.data.user, res.data.accessToken)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setServerError(
        err.response?.data?.error ?? 'Something went wrong. Please try again.',
      )
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Create your account"
        description="Start onboarding your team with Columbus"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            id="name"
            type="text"
            label="Full name"
            placeholder="Jane Smith"
            autoComplete="name"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            id="organizationName"
            type="text"
            label="Organization name"
            placeholder="Acme Corp"
            autoComplete="organization"
            error={errors.organizationName?.message}
            {...register('organizationName')}
          />

          <Input
            id="email"
            type="email"
            label="Work email"
            placeholder="you@company.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <PasswordInput
            id="password"
            label="Password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <PasswordInput
            id="confirmPassword"
            label="Confirm password"
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
            Create account
          </Button>
        </form>
      </AuthCard>

      <p className="mt-6 text-center text-[14px]" style={{ color: 'var(--text-secondary)' }}>
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-primary hover:text-primary-hover font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
