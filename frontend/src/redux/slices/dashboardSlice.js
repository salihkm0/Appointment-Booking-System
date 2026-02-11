import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardApi } from '../../api/dashboardApi';
import toast from 'react-hot-toast';

//! Get User Dashboard
export const getUserDashboard = createAsyncThunk(
  'dashboard/getUserDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getUserDashboard();
      return response.data;
    } catch (error) {
      toast.error(error.message || 'Failed to load user dashboard');
      return rejectWithValue(error.message || 'Failed to load user dashboard');
    }
  }
);

//! Get User Dashboard Trends
export const getUserDashboardTrends = createAsyncThunk(
  'dashboard/getUserDashboardTrends',
  async (params, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getUserDashboardTrends(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load trends');
    }
  }
);

//! Get Provider Dashboard
export const getProviderDashboard = createAsyncThunk(
  'dashboard/getProviderDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getProviderDashboard();
      return response.data;
    } catch (error) {
      toast.error(error.message || 'Failed to load provider dashboard');
      return rejectWithValue(error.message || 'Failed to load provider dashboard');
    }
  }
);

//! Get Provider Dashboard Trends
export const getProviderDashboardTrends = createAsyncThunk(
  'dashboard/getProviderDashboardTrends',
  async (params, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getProviderDashboardTrends(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load provider trends');
    }
  }
);

//! Get Provider Dashboard Overview
export const getProviderDashboardOverview = createAsyncThunk(
  'dashboard/getProviderDashboardOverview',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getProviderDashboardOverview();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load provider overview');
    }
  }
);

const initialState = {
  userDashboard: {
    data: null,
    loading: false,
    error: null
  },
  
  userTrends: {
    data: null,
    loading: false,
    error: null
  },
  
  providerDashboard: {
    data: null,
    loading: false,
    error: null
  },
  
  providerTrends: {
    data: null,
    loading: false,
    error: null
  },
  
  providerOverview: {
    data: null,
    loading: false,
    error: null
  }
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboard: (state) => {
      state.userDashboard = initialState.userDashboard;
      state.providerDashboard = initialState.providerDashboard;
    },
    clearError: (state) => {
      state.userDashboard.error = null;
      state.userTrends.error = null;
      state.providerDashboard.error = null;
      state.providerTrends.error = null;
      state.providerOverview.error = null;
    },
    resetDashboard: () => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserDashboard.pending, (state) => {
        state.userDashboard.loading = true;
        state.userDashboard.error = null;
      })
      .addCase(getUserDashboard.fulfilled, (state, action) => {
        state.userDashboard.loading = false;
        state.userDashboard.data = action.payload;
      })
      .addCase(getUserDashboard.rejected, (state, action) => {
        state.userDashboard.loading = false;
        state.userDashboard.error = action.payload;
      })
      
      .addCase(getUserDashboardTrends.pending, (state) => {
        state.userTrends.loading = true;
        state.userTrends.error = null;
      })
      .addCase(getUserDashboardTrends.fulfilled, (state, action) => {
        state.userTrends.loading = false;
        state.userTrends.data = action.payload;
      })
      .addCase(getUserDashboardTrends.rejected, (state, action) => {
        state.userTrends.loading = false;
        state.userTrends.error = action.payload;
      })
      
      .addCase(getProviderDashboard.pending, (state) => {
        state.providerDashboard.loading = true;
        state.providerDashboard.error = null;
      })
      .addCase(getProviderDashboard.fulfilled, (state, action) => {
        state.providerDashboard.loading = false;
        state.providerDashboard.data = action.payload;
      })
      .addCase(getProviderDashboard.rejected, (state, action) => {
        state.providerDashboard.loading = false;
        state.providerDashboard.error = action.payload;
      })
      
      .addCase(getProviderDashboardTrends.pending, (state) => {
        state.providerTrends.loading = true;
        state.providerTrends.error = null;
      })
      .addCase(getProviderDashboardTrends.fulfilled, (state, action) => {
        state.providerTrends.loading = false;
        state.providerTrends.data = action.payload;
      })
      .addCase(getProviderDashboardTrends.rejected, (state, action) => {
        state.providerTrends.loading = false;
        state.providerTrends.error = action.payload;
      })
      
      .addCase(getProviderDashboardOverview.pending, (state) => {
        state.providerOverview.loading = true;
        state.providerOverview.error = null;
      })
      .addCase(getProviderDashboardOverview.fulfilled, (state, action) => {
        state.providerOverview.loading = false;
        state.providerOverview.data = action.payload;
      })
      .addCase(getProviderDashboardOverview.rejected, (state, action) => {
        state.providerOverview.loading = false;
        state.providerOverview.error = action.payload;
      });
  }
});

export const { clearDashboard, clearError, resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;

export const selectUserDashboard = (state) => state.dashboard.userDashboard;
export const selectUserTrends = (state) => state.dashboard.userTrends;
export const selectProviderDashboard = (state) => state.dashboard.providerDashboard;
export const selectProviderTrends = (state) => state.dashboard.providerTrends;
export const selectProviderOverview = (state) => state.dashboard.providerOverview;

export const selectCurrentDashboard = (state) => {
  const { user } = state.auth;
  
  if (user?.role === 'provider') {
    return {
      data: state.dashboard.providerDashboard.data,
      loading: state.dashboard.providerDashboard.loading,
      error: state.dashboard.providerDashboard.error,
      isProvider: true
    };
  }
  
  return {
    data: state.dashboard.userDashboard.data,
    loading: state.dashboard.userDashboard.loading,
    error: state.dashboard.userDashboard.error,
    isProvider: false
  };
};

export const selectDashboardStats = (state) => {
  const { user } = state.auth;
  const dashboard = selectCurrentDashboard(state);
  
  if (!dashboard.data) return null;
  
  return dashboard.data.stats || {};
};

export const selectRecentAppointments = (state) => {
  const dashboard = selectCurrentDashboard(state);
  
  if (!dashboard.data) return [];
  
  return dashboard.data.recentAppointments || [];
};

export const selectUpcomingAppointments = (state) => {
  const dashboard = selectCurrentDashboard(state);
  
  if (!dashboard.data) return [];
  
  if (dashboard.isProvider) {
    return dashboard.data.todaysSchedule || [];
  }
  
  return dashboard.data.upcomingAppointments || [];
};