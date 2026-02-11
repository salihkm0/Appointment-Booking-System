import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reportApi } from '../../api/reportApi';

//! Get user reports
export const getUserReports = createAsyncThunk(
  'reports/getUserReports',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reportApi.getUserReports();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get user reports');
    }
  }
);

//! Get provider reports
export const getProviderReports = createAsyncThunk(
  'reports/getProviderReports',
  async (params, { rejectWithValue }) => {
    try {
      const response = await reportApi.getProviderReports(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to get provider reports');
    }
  }
);

const reportSlice = createSlice({
  name: 'reports',
  initialState: {
    userReports: null,
    providerReports: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearReports: (state) => {
      state.userReports = null;
      state.providerReports = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserReports.fulfilled, (state, action) => {
        state.loading = false;
        state.userReports = action.payload;
      })
      .addCase(getUserReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(getProviderReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProviderReports.fulfilled, (state, action) => {
        state.loading = false;
        state.providerReports = action.payload;
      })
      .addCase(getProviderReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReports, clearError } = reportSlice.actions;
export default reportSlice.reducer;