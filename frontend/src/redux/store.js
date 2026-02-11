import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import serviceReducer from './slices/serviceSlice';
import appointmentReducer from './slices/appointmentSlice';
import reportReducer from './slices/reportSlice';
import dashboardReducer from './slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    services: serviceReducer,
    appointments: appointmentReducer,
    reports: reportReducer,
    dashboard: dashboardReducer,
  },
});