import api from './axios.js'

// GET /templates?filter=active|archived|all
export const listTemplates = (filter = 'active') =>
  api.get('/templates', { params: { filter } })

// GET /templates/:id
export const getTemplate = (id) =>
  api.get(`/templates/${id}`)

// POST /templates
export const createTemplate = (data) =>
  api.post('/templates', data)

// PATCH /templates/:id
export const updateTemplate = (id, data) =>
  api.patch(`/templates/${id}`, data)

// PATCH /templates/:id/archive
export const archiveTemplate = (id) =>
  api.patch(`/templates/${id}/archive`)

// PATCH /templates/:id/unarchive
export const unarchiveTemplate = (id) =>
  api.patch(`/templates/${id}/unarchive`)

// POST /templates/:id/clone
export const cloneTemplate = (id) =>
  api.post(`/templates/${id}/clone`)

// DELETE /templates/:id
export const deleteTemplate = (id) =>
  api.delete(`/templates/${id}`)

// GET /templates/seed — returns the unwrapped seed template object
export const getSeedTemplate = () =>
  api.get('/templates/seed').then((r) => r.data.data)

// GET /templates?filter=active — used by the wizard (active templates with taskCount)
export const getTemplatesForWizard = () =>
  api.get('/templates', { params: { filter: 'active' } })

// GET /templates/:id?departmentsOnly=true
export const getTemplateDepartments = (id) =>
  api.get(`/templates/${id}?departmentsOnly=true`).then((r) => r.data.data.departments)
