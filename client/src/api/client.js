import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('columbus_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem('columbus_token');
      const from = encodeURIComponent(window.location.pathname);
      window.location.href = `/login?from=${from}`;
      toast.error('Your session expired — please sign in again.');
    }
    return Promise.reject(error);
  },
);

export default client;
