import api from './axios'

export const hirePortalApi = {
  getOnboarding: (token, params) =>
    api.get(`/hire/${token}`, { params }),

  updateTask: (token, taskId, data) =>
    api.patch(`/hire/${token}/tasks/${taskId}`, data),

  signUpload: (token, taskId) =>
    api.post(`/hire/${token}/${taskId}/uploads/sign`),

  postComment: (token, taskId, data) =>
    api.post(`/hire/${token}/tasks/${taskId}/comments`, data),

  getComments: (token, taskId) =>
    api.get(`/hire/${token}/tasks/${taskId}/comments`),
}
