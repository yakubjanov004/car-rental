import axios from 'axios';

const BASE_ORIGIN = 'http://127.0.0.1:8000';
const apiClient = axios.create({
  baseURL: `${BASE_ORIGIN}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { BASE_ORIGIN };
export default apiClient;
