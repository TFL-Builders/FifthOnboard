import api from './axios'

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  signup: (data) => api.post('/auth/signup', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: ({ token, password }) =>
    api.post(`/auth/reset-password?token=${encodeURIComponent(token)}`, { password }),
   setup: (data) => api.post('/auth/setup', data),
}
