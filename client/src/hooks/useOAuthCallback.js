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
      const parsed = JSON.parse(decodeURIComponent(user))
      setAuth(parsed, token)
      window.history.replaceState({}, '', window.location.pathname)
    } catch (err) {
    }
  }
}, [])
}