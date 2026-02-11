import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { appointmentApi } from '../../api/appointmentApi';
import { availabilityApi } from '../../api/availabilityApi';
import toast from 'react-hot-toast';

//! Get user appointments
export const getMyAppointments = createAsyncThunk(
  'appointments/getMyAppointments',
  async (params, { rejectWithValue }) => {
    try {
      const response = await appointmentApi.getMyAppointments(params);
      return response;
    } catch (error) {
      toast.error(error.message || 'Failed to get appointments');
      return rejectWithValue(error.message || 'Failed to get appointments');
    }
  }
);

//! Get provider appointments
export const getProviderAppointments = createAsyncThunk(
  'appointments/getProviderAppointments',
  async (params, { rejectWithValue }) => {
    try {
      const response = await appointmentApi.getProviderAppointments(params);
      return response;
    } catch (error) {
      toast.error(error.message || 'Failed to get provider appointments');
      return rejectWithValue(error.message || 'Failed to get provider appointments');
    }
  }
);

//! Get available time slots
export const getAvailableSlots = createAsyncThunk(
  'appointments/getAvailableSlots',
  async (params, { rejectWithValue }) => {
    try {
      const response = await availabilityApi.getAvailableSlots(params);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      toast.error(error.message || 'Failed to get time slots');
      return rejectWithValue(error.message || 'Failed to get time slots');
    }
  }
);

//! Book appointment
export const bookAppointment = createAsyncThunk(
  'appointments/book',
  async (data, { rejectWithValue }) => {
    try {
      const response = await appointmentApi.bookAppointment(data);
      toast.success('Appointment booked successfully!');
      return response;
    } catch (error) {
      toast.error(error.message || 'Booking failed');
      return rejectWithValue(error.message || 'Booking failed');
    }
  }
);

//! Cancel appointment (User only)
export const cancelAppointment = createAsyncThunk(
  'appointments/cancel',
  async (id, { rejectWithValue }) => {
    try {
      await appointmentApi.cancelAppointment(id);
      toast.success('Appointment cancelled successfully');
      return id;
    } catch (error) {
      toast.error(error.message || 'Cancellation failed');
      return rejectWithValue(error.message || 'Cancellation failed');
    }
  }
);

//! Update appointment status (Provider only)
export const updateStatus = createAsyncThunk(
  'appointments/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await appointmentApi.updateStatus(id, status);
      toast.success(`Appointment status updated to ${status}`);
      return response;
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
      return rejectWithValue(error.message || 'Failed to update status');
    }
  }
);

const initialState = {
  userAppointments: {
    data: [],
    pagination: {
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
      limit: 10
    },
    stats: {
      total: 0,
      today: 0,
      upcoming: 0,
      past: 0,
      booked: 0,
      completed: 0,
      cancelled: 0,
      noShow: 0
    },
    loading: false,
    error: null,
    filters: {
      type: 'upcoming',
      status: '',
      startDate: '',
      endDate: '',
      sortBy: 'date',
      sortOrder: 'asc'
    }
  },
  
  providerAppointments: {
    data: [],
    pagination: {
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
      limit: 10
    },
    stats: {
      total: 0,
      today: 0,
      upcoming: 0,
      past: 0,
      booked: 0,
      completed: 0,
      cancelled: 0,
      noShow: 0,
      pastBooked: 0,
      totalRevenue: 0
    },
    loading: false,
    error: null,
    filters: {
      date: '',
      status: '',
      startDate: '',
      endDate: '',
      userId: '',
      serviceId: '',
      sortBy: 'date',
      sortOrder: 'asc'
    }
  },
  
  availableSlots: [],
  slotsLoading: false,
  slotsError: null,
  
  actionLoading: false,
  actionError: null
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearSlots: (state) => {
      state.availableSlots = [];
      state.slotsError = null;
    },
    
    clearError: (state) => {
      state.userAppointments.error = null;
      state.providerAppointments.error = null;
      state.slotsError = null;
      state.actionError = null;
    },
    
    setUserAppointmentsPage: (state, action) => {
      state.userAppointments.pagination.currentPage = action.payload;
    },

    setProviderAppointmentsPage: (state, action) => {
      state.providerAppointments.pagination.currentPage = action.payload;
    },

    setUserAppointmentsFilters: (state, action) => {
      state.userAppointments.filters = {
        ...state.userAppointments.filters,
        ...action.payload
      };
    },

    setProviderAppointmentsFilters: (state, action) => {
      state.providerAppointments.filters = {
        ...state.providerAppointments.filters,
        ...action.payload
      };
    },

    resetUserAppointmentsFilters: (state) => {
      state.userAppointments.filters = initialState.userAppointments.filters;
      state.userAppointments.pagination.currentPage = 1;
    },

    resetProviderAppointmentsFilters: (state) => {
      state.providerAppointments.filters = initialState.providerAppointments.filters;
      state.providerAppointments.pagination.currentPage = 1;
    },

    updateAppointmentInList: (state, action) => {
      const updatedAppointment = action.payload;

      state.userAppointments.data = state.userAppointments.data.map(app => 
        app._id === updatedAppointment._id ? updatedAppointment : app
      );

      state.providerAppointments.data = state.providerAppointments.data.map(app => 
        app._id === updatedAppointment._id ? updatedAppointment : app
      );
    },

    resetActionState: (state) => {
      state.actionLoading = false;
      state.actionError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMyAppointments.pending, (state) => {
        state.userAppointments.loading = true;
        state.userAppointments.error = null;
      })

      .addCase(getMyAppointments.fulfilled, (state, action) => {
        state.userAppointments.loading = false;

        if (action.payload && typeof action.payload === 'object') {
          if (Array.isArray(action.payload)) {
            state.userAppointments.data = action.payload;
            state.userAppointments.pagination = initialState.userAppointments.pagination;
          } else if (action.payload.data && action.payload.pagination) {
            state.userAppointments.data = action.payload.data || [];
            state.userAppointments.pagination = action.payload.pagination || initialState.userAppointments.pagination;
            state.userAppointments.stats = action.payload.stats || initialState.userAppointments.stats;
          } else {
            state.userAppointments.data = Array.isArray(action.payload) ? action.payload : [];
            state.userAppointments.pagination = initialState.userAppointments.pagination;
          }
        } else {
          state.userAppointments.data = [];
          state.userAppointments.pagination = initialState.userAppointments.pagination;
        }
      })

      .addCase(getMyAppointments.rejected, (state, action) => {
        state.userAppointments.loading = false;
        state.userAppointments.error = action.payload;
      })

      .addCase(getProviderAppointments.pending, (state) => {
        state.providerAppointments.loading = true;
        state.providerAppointments.error = null;
      })

      .addCase(getProviderAppointments.fulfilled, (state, action) => {
        state.providerAppointments.loading = false;

        if (action.payload && typeof action.payload === 'object') {
          if (Array.isArray(action.payload)) {
            state.providerAppointments.data = action.payload;
            state.providerAppointments.pagination = initialState.providerAppointments.pagination;
          } else if (action.payload.data && action.payload.pagination) {
            state.providerAppointments.data = action.payload.data || [];
            state.providerAppointments.pagination = action.payload.pagination || initialState.providerAppointments.pagination;
            state.providerAppointments.stats = action.payload.stats || initialState.providerAppointments.stats;
          } else {
            state.providerAppointments.data = Array.isArray(action.payload) ? action.payload : [];
            state.providerAppointments.pagination = initialState.providerAppointments.pagination;
          }
        } else {
          state.providerAppointments.data = [];
          state.providerAppointments.pagination = initialState.providerAppointments.pagination;
        }
      })

      .addCase(getProviderAppointments.rejected, (state, action) => {
        state.providerAppointments.loading = false;
        state.providerAppointments.error = action.payload;
      })

      .addCase(getAvailableSlots.pending, (state) => {
        state.slotsLoading = true;
        state.slotsError = null;
      })

      .addCase(getAvailableSlots.fulfilled, (state, action) => {
        state.slotsLoading = false;
        state.availableSlots = action.payload || [];
      })

      .addCase(getAvailableSlots.rejected, (state, action) => {
        state.slotsLoading = false;
        state.slotsError = action.payload;
      })

      .addCase(bookAppointment.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })

      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload) {
          state.userAppointments.data.unshift(action.payload);
          state.userAppointments.pagination.totalItems += 1;
          state.userAppointments.stats.total += 1;
          state.userAppointments.stats.upcoming += 1;
          state.userAppointments.stats.booked += 1;
        }
      })

      .addCase(bookAppointment.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      .addCase(cancelAppointment.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })

      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.actionLoading = false;
        const appointmentId = action.payload;

        const appointment = state.userAppointments.data.find(app => app._id === appointmentId);
        if (appointment) {
          appointment.status = 'cancelled';
          appointment.cancelledBy = 'user';

          state.userAppointments.stats.booked -= 1;
          state.userAppointments.stats.cancelled += 1;
          state.userAppointments.stats.upcoming -= 1;
        }
      })

      .addCase(cancelAppointment.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      .addCase(updateStatus.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })

      .addCase(updateStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload) {
          const index = state.providerAppointments.data.findIndex(app => app._id === action.payload._id);
          if (index !== -1) {
            const oldStatus = state.providerAppointments.data[index].status;
            const newStatus = action.payload.status;

            state.providerAppointments.data[index] = action.payload;

            if (oldStatus !== newStatus) {
              if (oldStatus === 'booked') state.providerAppointments.stats.booked -= 1;
              else if (oldStatus === 'completed') state.providerAppointments.stats.completed -= 1;
              else if (oldStatus === 'cancelled') state.providerAppointments.stats.cancelled -= 1;
              else if (oldStatus === 'no-show') state.providerAppointments.stats.noShow -= 1;
              

              if (newStatus === 'booked') state.providerAppointments.stats.booked += 1;
              else if (newStatus === 'completed') {
                state.providerAppointments.stats.completed += 1;
                if (action.payload.service?.price) {
                  state.providerAppointments.stats.totalRevenue += parseFloat(action.payload.service.price) || 0;
                }
              }
              else if (newStatus === 'cancelled') state.providerAppointments.stats.cancelled += 1;
              else if (newStatus === 'no-show') state.providerAppointments.stats.noShow += 1;

              if (oldStatus === 'booked') {
                const appointmentDate = new Date(action.payload.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (appointmentDate < today) {
                  state.providerAppointments.stats.pastBooked -= 1;
                }
              }
            }
          }
        }
      })
      
      .addCase(updateStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });
  }
});

export const {
  clearSlots,
  clearError,
  setUserAppointmentsPage,
  setProviderAppointmentsPage,
  setUserAppointmentsFilters,
  setProviderAppointmentsFilters,
  resetUserAppointmentsFilters,
  resetProviderAppointmentsFilters,
  updateAppointmentInList,
  resetActionState
} = appointmentSlice.actions;

export default appointmentSlice.reducer;

export const selectUserAppointments = (state) => state.appointments.userAppointments;
export const selectProviderAppointments = (state) => state.appointments.providerAppointments;
export const selectAvailableSlots = (state) => state.appointments.availableSlots;
export const selectSlotsLoading = (state) => state.appointments.slotsLoading;
export const selectAppointmentsLoading = (state) => 
  state.appointments.userAppointments.loading || state.appointments.providerAppointments.loading;
export const selectActionLoading = (state) => state.appointments.actionLoading;

export const selectCurrentAppointments = (state) => {
  const { user } = state.auth;
  const { userAppointments, providerAppointments } = state.appointments;
  
  if (user?.role === 'provider') {
    return {
      ...providerAppointments,
      isProvider: true
    };
  }
  
  return {
    ...userAppointments,
    isProvider: false
  };
};

export const selectAppointmentStats = (state) => {
  const { user } = state.auth;
  const { userAppointments, providerAppointments } = state.appointments;
  
  if (user?.role === 'provider') {
    return providerAppointments.stats;
  }
  
  return userAppointments.stats;
};

export const selectPastBookedAppointments = (state) => {
  const { user } = state.auth;
  if (user?.role !== 'provider') return 0;
  
  return state.appointments.providerAppointments.stats.pastBooked || 0;
};

export const selectAppointmentById = (id) => (state) => {
  const allAppointments = [
    ...state.appointments.userAppointments.data,
    ...state.appointments.providerAppointments.data
  ];
  return allAppointments.find(appointment => appointment._id === id);
};