import api from './axios'

export const settingsApi = {
  get: () => api.get('/dashboard/settings'),
  update: (data) => api.patch('/dashboard/settings', data),
}
