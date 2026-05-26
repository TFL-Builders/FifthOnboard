import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true, isLoading: false }),

  clearAuth: () =>
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),
}))

function initializeFromOAuthCallback() {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')
  const user = params.get('user')

  if (token && user) {
    try {
      const parsed = JSON.parse(decodeURIComponent(user))
      // Set state directly on the store before React renders
      useAuthStore.setState({
        user: parsed,
        accessToken: token,
        isAuthenticated: true,
        isLoading: false,
      })
      window.history.replaceState({}, '', window.location.pathname)
    } catch (err) {
      console.log("Store: OAuth init failed", err)
    }
  }
}

// Call immediately when this module is imported
initializeFromOAuthCallback()

export default useAuthStore
