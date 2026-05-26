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

    // If this is an OAuth callback (token + user in URL),
    // skip the refresh attempt entirely — useOAuthCallback handles it
    const params = new URLSearchParams(window.location.search)
    const hasOAuthParams = params.get('token') && params.get('user')

     const { isAuthenticated, isLoading } = useAuthStore.getState()
    if (isAuthenticated && !isLoading) {
      return
    }

    async function init() {
      try {
        const { data } = await authApi.refresh()
        setAuth(data.user, data.accessToken)
        console.log("auth init success")
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