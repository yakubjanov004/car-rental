import axios from 'axios';

const BASE_ORIGIN = import.meta.env.VITE_API_BASE_URL || window.location.origin;

const apiClient = axios.create({
  baseURL: `${BASE_ORIGIN}/api/`,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  const lang = localStorage.getItem('rentalcar_lang') || 'uz'; // Dynamic language for backend translation
  
  config.headers['Accept-Language'] = lang;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried refreshing yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const response = await axios.post(`${BASE_ORIGIN}/api/users/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          // Update the header and retry the original request
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // If refresh fails, clear everything and redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/signin';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available
        localStorage.removeItem('access_token');
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export { BASE_ORIGIN };
export default apiClient;
