import api from './axios'

export const onboardingsApi = {
  list: (params) => api.get('/onboardings', { params }),
  get: (id) => api.get(`/onboardings/${id}`),
  create: (data) => api.post('/onboardings', data),
  update: (id, data) => api.patch(`/onboardings/${id}`, data),
  cancel: (id) => api.patch(`/onboardings/${id}/cancel`),
  getTasks: (id, params) => api.get(`/onboardings/${id}/tasks`, { params }),
  getComments: (id) => api.get(`/onboardings/${id}/comments`),
  getRecentlyCompleted: (params) =>
    api.get('/onboardings/tasks/recent', { params }),
  inviteToPortal: (id) =>
    api.post(`/onboardings/${id}/invite`),   // Phase 6 — not yet available
  sendReminder: (id) =>
    api.post(`/onboardings/${id}/reminder`), // Phase 6 — not yet available
}

export const tasksApi = {
  update: (id, data) => api.patch(`/tasks/${id}`, data),
  addComment: (id, data) => api.post(`/tasks/${id}/comments`, data),
  getComments: (taskId) => api.get(`/tasks/${taskId}/comments`),
}

export const usersApi = {
  // Phase 7 — not yet available but expected shape:
  // GET /users?department=X&status=active
  listByDepartment: (department) =>
    api.get(`/users`, { params: { department, status: 'active' } }),
  listManagers: () =>
    api.get(`/users`, { params: { role: 'manager', status: 'active' } }),
}
