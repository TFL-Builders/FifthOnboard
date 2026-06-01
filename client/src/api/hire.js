import axios from 'axios'

const hireApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
})

export const hirePortalApi = {
  getOnboarding: (token, params) =>
    hireApi.get(`/hire/${token}`, { params }),

  updateTask: (token, taskId, data) =>
    hireApi.patch(`/hire/${token}/tasks/${taskId}`, data),

  signUpload: (token, taskId) =>
    hireApi.post(`/hire/${token}/${taskId}/uploads/sign`),

  postComment: (token, taskId, data) =>
    hireApi.post(`/hire/${token}/tasks/${taskId}/comments`, data),

  getComments: (token, taskId) =>
    hireApi.get(`/hire/${token}/tasks/${taskId}/comments`),
}
