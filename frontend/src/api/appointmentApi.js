import axiosClient from './axiosClient';

export const appointmentApi = {
  bookAppointment: (data) => axiosClient.post('/appointments/book', data),
  getMyAppointments: (params = {}) => axiosClient.get('/appointments/my-appointments', { params }),
  getProviderAppointments: (params = {}) => axiosClient.get('/appointments/provider-appointments', { params }),
  cancelAppointment: (id) => axiosClient.put(`/appointments/cancel/${id}`),
  updateStatus: (id, status) => axiosClient.put(`/appointments/update-status/${id}`, { status }),
};