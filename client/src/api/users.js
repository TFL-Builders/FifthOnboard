import api from './axios'

export const usersApi = {
  list: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  getTasks: (id, params) => api.get(`/users/${id}/tasks`, { params }),
  getDisablePreview: (id) => api.get(`/users/${id}/tasks`, { params: { disabled: true } }),
  disable: (id, data) => api.delete(`/users/${id}`, { data }),
  listPicker: (params) => api.get('/users', { params: { ...params, view: 'picker' } }),
}

export const invitesApi = {
  list: () => api.get('/invites'),
  send: (data) => api.post('/invites', data),
  revoke: (id) => api.delete(`/invites/${id}`),
}
