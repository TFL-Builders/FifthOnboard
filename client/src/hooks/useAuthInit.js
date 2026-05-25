// hooks/useAuthInit.js
import { useEffect } from 'react'
import { authApi } from '../api/auth'
import useAuthStore from '../stores/authStore'

let initialized = false;

export function useAuthInit() {
  const { setAuth, clearAuth, setLoading } = useAuthStore()

  useEffect(() => {
    if (initialized) return // ← skip if already ran
    initialized = true;
    async function init() {
      try {
        const { data } = await authApi.refresh()
        setAuth(data.user, data.accessToken)
        console.log("auth init success")
      } catch (error) {
        // no valid refresh token — user needs to log in
        clearAuth()
         console.log("auth init failed - cleared")
      } finally {
        setLoading(false)
      }
    }

    init()
  }, []) // runs once on mount
}