import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { serviceApi } from "../../api/serviceApi";
import toast from "react-hot-toast";

//! Get all services (public)
export const getServices = createAsyncThunk(
  "services/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await serviceApi.getAllServices(params);
      return response;
    } catch (error) {
      toast.error(error.message || "Failed to load services");
      return rejectWithValue(error.message || "Failed to load services");
    }
  },
);

//! Get provider's services
export const getMyServices = createAsyncThunk(
  "services/getMyServices",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await serviceApi.getMyServices(params);
      return response;
    } catch (error) {
      toast.error(error.message || "Failed to load your services");
      return rejectWithValue(error.message || "Failed to load your services");
    }
  },
);

//! Create a new service
export const createService = createAsyncThunk(
  "services/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await serviceApi.createService(data);
      toast.success("Service created successfully");
      return response;
    } catch (error) {
      toast.error(error.message || "Failed to create service");
      return rejectWithValue(error.message || "Failed to create service");
    }
  },
);

//! Update an existing service
export const updateService = createAsyncThunk(
  "services/update",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await serviceApi.updateService(id, data);
      toast.success("Service updated successfully");
      return response;
    } catch (error) {
      toast.error(error.message || "Failed to update service");
      return rejectWithValue(error.message || "Failed to update service");
    }
  },
);

//! Delete a service
export const deleteService = createAsyncThunk(
  "services/delete",
  async (id, { rejectWithValue }) => {
    try {
      await serviceApi.deleteService(id);
      toast.success("Service deleted successfully");
      return id;
    } catch (error) {
      toast.error(error.message || "Failed to delete service");
      return rejectWithValue(error.message || "Failed to delete service");
    }
  },
);

const initialState = {
  allServices: {
    data: [],
    pagination: {
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
      limit: 10,
    },
    loading: false,
    error: null,
    filters: {
      search: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      minPrice: "",
      maxPrice: "",
      providerId: "",
    },
  },

  myServices: {
    data: [],
    pagination: {
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
      limit: 10,
    },
    loading: false,
    error: null,
    filters: {
      search: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      minPrice: "",
      maxPrice: "",
    },
  },

  currentService: null,

  actionLoading: false,
  actionError: null,
};

const serviceSlice = createSlice({
  name: "services",
  initialState,
  reducers: {
    clearServiceError: (state) => {
      state.allServices.error = null;
      state.myServices.error = null;
      state.actionError = null;
    },

    resetServices: (state) => {
      state.allServices = initialState.allServices;
      state.myServices = initialState.myServices;
    },

    setCurrentService: (state, action) => {
      state.currentService = action.payload;
    },

    clearCurrentService: (state) => {
      state.currentService = null;
    },

    setMyServicesPage: (state, action) => {
      state.myServices.pagination.currentPage = action.payload;
    },

    setAllServicesPage: (state, action) => {
      state.allServices.pagination.currentPage = action.payload;
    },

    setMyServicesFilters: (state, action) => {
      state.myServices.filters = {
        ...state.myServices.filters,
        ...action.payload,
      };

      state.myServices.pagination.currentPage = 1;
    },

    setAllServicesFilters: (state, action) => {
      state.allServices.filters = {
        ...state.allServices.filters,
        ...action.payload,
      };

      state.allServices.pagination.currentPage = 1;
    },

    resetMyServicesFilters: (state) => {
      state.myServices.filters = initialState.myServices.filters;
      state.myServices.pagination.currentPage = 1;
    },

    resetAllServicesFilters: (state) => {
      state.allServices.filters = initialState.allServices.filters;
      state.allServices.pagination.currentPage = 1;
    },

    resetActionState: (state) => {
      state.actionLoading = false;
      state.actionError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getServices.pending, (state) => {
        state.allServices.loading = true;
        state.allServices.error = null;
      })

      .addCase(getServices.fulfilled, (state, action) => {
        state.allServices.loading = false;

        if (action.payload && typeof action.payload === "object") {
          if (action.payload.success && action.payload.data) {
            state.allServices.data = action.payload.data || [];
            state.allServices.pagination =
              action.payload.pagination || initialState.allServices.pagination;
          } else if (Array.isArray(action.payload)) {
            state.allServices.data = action.payload;
            state.allServices.pagination = initialState.allServices.pagination;
          } else if (action.payload.data && action.payload.pagination) {
            state.allServices.data = action.payload.data || [];
            state.allServices.pagination =
              action.payload.pagination || initialState.allServices.pagination;
          } else {
            state.allServices.data = Array.isArray(action.payload)
              ? action.payload
              : [];
            state.allServices.pagination = initialState.allServices.pagination;
          }
        } else {
          state.allServices.data = [];
          state.allServices.pagination = initialState.allServices.pagination;
        }
      })

      .addCase(getServices.rejected, (state, action) => {
        state.allServices.loading = false;
        state.allServices.error = action.payload;
        state.allServices.data = [];
      })

      .addCase(getMyServices.pending, (state) => {
        state.myServices.loading = true;
        state.myServices.error = null;
      })

      .addCase(getMyServices.fulfilled, (state, action) => {
        state.myServices.loading = false;

        if (action.payload && typeof action.payload === "object") {
          if (action.payload.success && action.payload.data) {
            state.myServices.data = action.payload.data || [];
            state.myServices.pagination =
              action.payload.pagination || initialState.myServices.pagination;
          } else if (Array.isArray(action.payload)) {
            state.myServices.data = action.payload;
            state.myServices.pagination = initialState.myServices.pagination;
          } else if (action.payload.data && action.payload.pagination) {
            state.myServices.data = action.payload.data || [];
            state.myServices.pagination =
              action.payload.pagination || initialState.myServices.pagination;
          } else {
            state.myServices.data = Array.isArray(action.payload)
              ? action.payload
              : [];
            state.myServices.pagination = initialState.myServices.pagination;
          }
        } else {
          state.myServices.data = [];
          state.myServices.pagination = initialState.myServices.pagination;
        }
      })
      .addCase(getMyServices.rejected, (state, action) => {
        state.myServices.loading = false;
        state.myServices.error = action.payload;
        state.myServices.data = [];
      })

      .addCase(createService.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })

      .addCase(createService.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload) {
          state.myServices.data.unshift(action.payload);
          state.myServices.pagination.totalItems += 1;
        }
      })

      .addCase(createService.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      .addCase(updateService.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })

      .addCase(updateService.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload) {
          const index = state.myServices.data.findIndex(
            (s) => s._id === action.payload._id,
          );
          if (index !== -1) {
            state.myServices.data[index] = action.payload;
          }
        }
      })

      .addCase(updateService.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      })

      .addCase(deleteService.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })

      .addCase(deleteService.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.myServices.data = state.myServices.data.filter(
          (s) => s._id !== action.payload,
        );
        state.myServices.pagination.totalItems = Math.max(
          0,
          state.myServices.pagination.totalItems - 1,
        );
      })

      .addCase(deleteService.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload;
      });
  },
});

export const {
  clearServiceError,
  resetServices,
  setCurrentService,
  clearCurrentService,
  setMyServicesPage,
  setAllServicesPage,
  setMyServicesFilters,
  setAllServicesFilters,
  resetMyServicesFilters,
  resetAllServicesFilters,
  resetActionState,
} = serviceSlice.actions;

export default serviceSlice.reducer;

//! Selectors
export const selectAllServices = (state) => state.services.allServices;
export const selectMyServices = (state) => state.services.myServices;
export const selectCurrentService = (state) => state.services.currentService;
export const selectServicesLoading = (state) =>
  state.services.allServices.loading || state.services.myServices.loading;
export const selectActionLoading = (state) => state.services.actionLoading;

export const selectServicesArray = (state) => state.services.allServices.data;
