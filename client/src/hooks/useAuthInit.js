// hooks/useAuthInit.js
import { useEffect } from 'react'
import { authApi } from '../api/auth'
import useAuthStore from '../stores/authStore'

export function useAuthInit() {
  const { setAuth, clearAuth, setLoading } = useAuthStore()

  useEffect(() => {
    async function init() {
      try {
        const { data } = await authApi.refresh()
        setAuth(data.user, data.accessToken)
      } catch (error) {
        // no valid refresh token — user needs to log in
        clearAuth()
      } finally {
        setLoading(false)
      }
    }

    init()
  }, []) // runs once on mount
}