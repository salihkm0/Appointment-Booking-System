import axiosClient from './axiosClient';

export const reportApi = {
  //! Get user reports
  getUserReports: () => axiosClient.get('/reports/user'),
  
  //! Get provider reports
  getProviderReports: (params) => axiosClient.get('/reports/provider', { params }),
};