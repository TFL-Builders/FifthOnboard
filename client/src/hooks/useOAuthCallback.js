import { useEffect } from 'react'
import useAuthStore from '../stores/authStore'

export function useOAuthCallback() {
  const { setAuth } = useAuthStore()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const user = params.get('user')

    if (token && user) {
      try {
        // store in Zustand
        setAuth(JSON.parse(decodeURIComponent(user)), token)

        // clean URL — remove token from address bar
        window.history.replaceState({}, '', window.location.pathname)
      } catch (err) {
        console.log('OAuth callback parse error:', err)
      }
    }
  }, [])
}