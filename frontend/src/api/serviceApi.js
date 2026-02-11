import axiosClient from './axiosClient';

export const serviceApi = {
  getAllServices: (params = {}) => axiosClient.get('/services', { params }),
  getMyServices: (params = {}) => axiosClient.get('/services/my-services', { params }),
  createService: (data) => axiosClient.post('/services', data),
  updateService: (id, data) => axiosClient.put(`/services/${id}`, data),
  deleteService: (id) => axiosClient.delete(`/services/${id}`),
};