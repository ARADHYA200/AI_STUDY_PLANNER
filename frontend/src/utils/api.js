import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for response handling and token refresh/logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if we're not already on a public page
      const publicPages = ['/login', '/register', '/'];
      if (!publicPages.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }

    // Format error message for easier consumption
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject({ ...error, message });
  }
);

export default api;
