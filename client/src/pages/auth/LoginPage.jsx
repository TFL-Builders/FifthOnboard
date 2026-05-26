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

          <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: 'var(--border-color)' }} />
          </div>
          <div className="relative flex justify-center text-[12px]">
            <span className="px-2" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
              or
            </span>
          </div>
        </div>

        
          <a
          href={`${import.meta.env.VITE_API_URL}/auth/google`}
          className="flex items-center justify-center gap-3 w-full rounded-[6px] border px-4 py-2 text-[14px] font-medium auth-google-btn cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </a>
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
