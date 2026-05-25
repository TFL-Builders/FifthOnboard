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

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default function LoginPage() {
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
      const res = await authApi.login(data)
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
      <AuthCard title="Welcome back" description="Sign in to your Columbus account">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            id="email"
            type="email"
            label="Email address"
            placeholder="you@company.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="space-y-1">
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="password"
                className="block text-[12px] font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[12px] text-primary hover:text-primary-hover transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

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
            Sign in
          </Button>
        </form>
      </AuthCard>

      <p className="mt-6 text-center text-[14px]" style={{ color: 'var(--text-secondary)' }}>
        Don&apos;t have an account?{' '}
        <Link
          to="/signup"
          className="text-primary hover:text-primary-hover font-medium transition-colors"
        >
          Sign up
        </Link>
      </p>
    </AuthLayout>
  )
}
