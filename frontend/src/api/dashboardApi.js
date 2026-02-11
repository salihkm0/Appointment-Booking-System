import axiosClient from './axiosClient';

export const dashboardApi = {
  //! User Dashboard
  getUserDashboard: () => axiosClient.get('/dashboard/user'),
  getUserDashboardTrends: (params) => axiosClient.get('/dashboard/user/trends', { params }),
  
  //! Provider Dashboard
  getProviderDashboard: () => axiosClient.get('/dashboard/provider'),
  getProviderDashboardTrends: (params) => axiosClient.get('/dashboard/provider/trends', { params }),
  getProviderDashboardOverview: () => axiosClient.get('/dashboard/provider/overview'),
};