import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const register = (userData) => api.post('/auth/register', userData);
export const registerAdmin = (userData) => api.post('/auth/register-admin', userData);
export const login = (credentials) => {
  const formData = new FormData();
  formData.append('username', credentials.username);
  formData.append('password', credentials.password);
  return api.post('/auth/login', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// User APIs
export const getCurrentUser = () => api.get('/users/me');
export const getAllUsers = () => api.get('/users/');

// Location APIs
export const createLocation = (locationData) => api.post('/locations/', locationData);
export const getAllLocations = () => api.get('/locations/');
export const updateLocation = (id, locationData) => api.put(`/locations/${id}`, locationData);
export const deleteLocation = (id) => api.delete(`/locations/${id}`);

// Train APIs
export const createTrain = (trainData) => api.post('/trains/', trainData);
export const getAllTrains = () => api.get('/trains/');
export const searchTrains = (params) => api.get('/trains/search', { params });
export const updateTrain = (id, trainData) => api.put(`/trains/${id}`, trainData);
export const deleteTrain = (id) => api.delete(`/trains/${id}`);

// Booking APIs
export const createBooking = (bookingData) => api.post('/bookings/', bookingData);
export const getMyBookings = () => api.get('/bookings/my-bookings');
export const getAllBookings = () => api.get('/bookings/all');
export const cancelBooking = (id) => api.delete(`/bookings/${id}`);

export default api;