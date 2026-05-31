import axios from 'axios'
import useAuthStore from '../stores/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})
console.log(import.meta.env.VITE_API_URL);
// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Silent refresh logic — one attempt per 401, queues concurrent failures
let isRefreshing = false
let failedQueue = []

function processQueue(error, token = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

     // ← add here
    if (error.response?.status === 403 &&
        error.response?.data?.error === "setup_required") {
      window.location.href = "/setup";
      return Promise.reject(error);
    }

    // don't retry if refresh endpoint itself fails — just clear state.
    // only hard-redirect to /login when the user was on a page that actually
    // requires a session; leave public pages (reset-password, forgot-password,
    // setup, login, signup) alone so they can render themselves unmolested.
    if (original.url?.includes('refresh')) {
      useAuthStore.getState().clearAuth()
      const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password', '/setup']
      const onPublicPath = PUBLIC_PATHS.some((p) =>
        window.location.pathname.startsWith(p),
      )
      if (!onPublicPath) {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    if (!useAuthStore.getState().user) {
      return Promise.reject(error)
    }

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      )
      useAuthStore.getState().setAuth(data.user, data.accessToken)
      original.headers.Authorization = `Bearer ${data.accessToken}`
      processQueue(null, data.accessToken)
      return api(original)
    } catch (refreshError) {
      processQueue(refreshError, null)
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
