import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../api/authApi';
import toast from 'react-hot-toast';

//! User Register
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authApi.register(userData);
      localStorage.setItem('token', response.token);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      return rejectWithValue(error.error || error.message || 'Registration failed');
    }
  }
);

//! User Login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      localStorage.setItem('token', response.token);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue(error.error || error.message || 'Login failed');
    }
  }
);

//! Get Current User (used for app initialization)
export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, skipping getMe');
        return rejectWithValue('No token');
      }
      
      console.log('Getting user info with token...');
      const response = await authApi.getMe();
      console.log('User info received:', response);
      return response;
    } catch (error) {
      console.error('GetMe error:', error);
      localStorage.removeItem('token');
      return rejectWithValue(error.error || error.message || 'Failed to get user info');
    }
  }
);

//! User Logout
export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token');
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    initialized: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setInitialized: (state) => {
      state.initialized = true;
    }
  },
  extraReducers: (builder) => {
    builder
      //! Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        state.initialized = true;
        toast.success('Registration successful!');
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Registration failed');
      })
      
      //! Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        state.initialized = true;
        toast.success('Login successful!');
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Login failed');
      })
      
      //! Get Me - This is called on app initialization
      .addCase(getMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.initialized = true;
        console.log('✅ User loaded from token');
      })
      .addCase(getMe.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.initialized = true;
        console.log('❌ Failed to load user:', action.payload);

        if (action.payload !== 'No token') {
          toast.error('Session expired. Please login again.');
        }
      })
      
      //! Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.initialized = true;
        toast.success('Logged out successfully');
      });
  },
});

export const { clearError, setUser, setInitialized } = authSlice.actions;
export default authSlice.reducer;