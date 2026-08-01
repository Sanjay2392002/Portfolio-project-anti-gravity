import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
});

// Add a request interceptor to include the auth token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.method !== 'get') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default axiosInstance;
