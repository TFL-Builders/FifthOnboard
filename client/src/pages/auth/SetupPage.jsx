import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../features/auth/AuthLayout'
import AuthCard from '../../features/auth/AuthCard'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { authApi } from '../../api/auth'
import useAuthStore from '../../stores/authStore'
import { useOAuthCallback } from '../../hooks/useOAuthCallback'

const schema = z.object({
  organizationName: z
    .string()
    .min(1, 'Organization name is required')
    .max(100, 'Organization name is too long'),
})

export default function SetupPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [serverError, setServerError] = useState('')

  // extract token + user from URL if coming from Google OAuth
  useOAuthCallback()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  async function onSubmit(data) {
    setServerError('')
    try {
      const res = await authApi.setup({ organizationName: data.organizationName })
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
        title="Set up your organization"
        description="Almost there — just tell us your organization name to get started"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            id="organizationName"
            type="text"
            label="Organization name"
            placeholder="Acme Corp"
            autoComplete="organization"
            error={errors.organizationName?.message}
            {...register('organizationName')}
          />

          {serverError && (
            <div
              className="rounded-[8px] border px-4 py-3 text-[13px] text-danger"
              style={{
                borderColor: 'rgba(220,38,38,0.25)',
                backgroundColor: 'rgba(220,38,38,0.05)',
              }}
              role="alert"
              aria-live="assertive"
            >
              {serverError}
            </div>
          )}

          <Button type="submit" className="w-full mt-2" loading={isSubmitting}>
            Continue
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}