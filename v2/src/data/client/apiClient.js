import axios from 'axios';

/**
 * Single axios instance for API calls.
 *
 * Configure base URL via REACT_APP_API_BASE_URL.
 * In production, the auth interceptor will attach the JWT.
 */
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('osiris.token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear and redirect
      localStorage.removeItem('osiris.token');
      localStorage.removeItem('osiris.currentUser');
      // window.location.href = '/login';  // enable when API auth lands
    }
    return Promise.reject(error);
  }
);

export default apiClient;
