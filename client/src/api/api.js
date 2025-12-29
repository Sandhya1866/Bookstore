import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// Books API
export const booksAPI = {
  getAll: (params = {}) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
};

// Orders API
export const ordersAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getUserOrders: () => api.get('/orders'),
};

// Admin API
export const adminAPI = {
  createBook: (bookData) => api.post('/admin/books', bookData),
  updateBook: (id, bookData) => api.put(`/admin/books/${id}`, bookData),
  deleteBook: (id) => api.delete(`/admin/books/${id}`),
  getOrders: () => api.get('/admin/orders'),
};

// Utility API
export const utilityAPI = {
  seedDatabase: () => api.post('/seed'),
};

export default api;