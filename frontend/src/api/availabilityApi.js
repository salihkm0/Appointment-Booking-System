import axiosClient from './axiosClient';

export const availabilityApi = {
  setAvailability: (data) => axiosClient.post('/availability/set', data),
  blockDate: (data) => axiosClient.post('/availability/block-date', data),
  getMyAvailability: () => axiosClient.get('/availability/my-availability'),
  
  getAvailableSlots: (params) => {
    console.log('📡 API: Fetching available slots with params:', params);
    return axiosClient.get('/availability/available-slots', { params })
      .then(response => {
        console.log('📡 API Response:', response);
        return response;
      })
      .catch(error => {
        console.error('📡 API Error:', error);
        throw error;
      });
  },
};