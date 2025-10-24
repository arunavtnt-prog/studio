import axios from 'axios';

/**
 * API Service
 *
 * Centralized HTTP client for all API requests.
 * Handles authentication, error handling, and request/response interceptors.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add auth token here)
apiClient.interceptors.request.use(
  (config) => {
    // TODO: Add JWT token from localStorage
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (handle errors globally)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ==================== LEADS ====================
export const leadsAPI = {
  getAll: (params) => apiClient.get('/leads', { params }),
  getById: (id) => apiClient.get(`/leads/${id}`),
  create: (data) => apiClient.post('/leads', data),
  update: (id, data) => apiClient.patch(`/leads/${id}`, data),
  delete: (id) => apiClient.delete(`/leads/${id}`),
  analyze: (id, guidelines) => apiClient.post(`/leads/${id}/analyze`, { guidelines }),
};

// ==================== CLIENTS ====================
export const clientsAPI = {
  getAll: (params) => apiClient.get('/clients', { params }),
  getById: (id) => apiClient.get(`/clients/${id}`),
  create: (data) => apiClient.post('/clients', data),
  update: (id, data) => apiClient.patch(`/clients/${id}`, data),
  delete: (id) => apiClient.delete(`/clients/${id}`),
  updateHealthScore: (id) => apiClient.post(`/clients/${id}/health-score`),
  generateDeliverable: (id, data) => apiClient.post(`/clients/${id}/deliverables`, data),
  getStats: (id) => apiClient.get(`/clients/${id}/stats`),
};

// ==================== HEALTH ====================
export const healthAPI = {
  check: () => apiClient.get('/health'),
};

export default apiClient;
