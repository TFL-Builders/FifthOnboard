import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { ArrowLeft, MailCheck } from 'lucide-react'
import AuthLayout from '../../features/auth/AuthLayout'
import AuthCard from '../../features/auth/AuthCard'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { authApi } from '../../api/auth'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  async function onSubmit(data) {
    setServerError('')
    try {
      await authApi.forgotPassword(data)
      setSubmitted(true)
    } catch {
      setServerError('Something went wrong. Please try again.')
    }
  }

  if (submitted) {
    return (
      <AuthLayout>
        <div
          className="rounded-[8px] border p-8 text-center"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-success/10">
              <MailCheck size={24} className="text-success" aria-hidden="true" />
            </div>
          </div>
          <h1
            className="text-[20px] font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Check your inbox
          </h1>
          <p className="text-[14px] mb-6" style={{ color: 'var(--text-secondary)' }}>
            If that email exists in our system, you&apos;ll receive a reset link shortly.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-[14px] text-primary hover:text-primary-hover font-medium transition-colors"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Forgot your password?"
        description="Enter your email and we'll send you a reset link."
      >
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
            Send reset link
          </Button>
        </form>
      </AuthCard>

      <p className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-[14px] text-primary hover:text-primary-hover transition-colors"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
