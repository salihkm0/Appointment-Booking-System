import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyAppointments,
  getProviderAppointments,
  cancelAppointment,
  updateStatus,
  setUserAppointmentsPage,
  setProviderAppointmentsPage,
} from "../redux/slices/appointmentSlice";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import AppointmentCard from "../components/ui/AppointmentCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { Calendar, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const MyAppointments = () => {
  const [viewType, setViewType] = useState("upcoming");
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const currentAppointments = useSelector((state) => {
    const { userAppointments, providerAppointments } = state.appointments;
    return user?.role === "provider" ? providerAppointments : userAppointments;
  });

  const {
    data: appointments = [],
    pagination,
    stats,
    loading,
    error,
  } = currentAppointments;

  const isProvider = user?.role === "provider";

  const fetchAppointments = async (page = 1) => {
    try {
      setRefreshing(true);

      const params = {
        page,
        limit: 10,
      };

      if (!isProvider) {
        params.type = viewType;
      }

      if (isProvider) {
        await dispatch(getProviderAppointments(params)).unwrap();
      } else {
        await dispatch(getMyAppointments(params)).unwrap();
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error(error.message || "Failed to load appointments");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppointments(1);
  }, [dispatch, isProvider, viewType]);

  const handlePageChange = (page) => {
    if (isProvider) {
      dispatch(setProviderAppointmentsPage(page));
    } else {
      dispatch(setUserAppointmentsPage(page));
    }
    fetchAppointments(page);
  };

  const handleRefresh = () => {
    fetchAppointments(pagination.currentPage);
    toast.success("Appointments refreshed");
  };

  const handleCancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await dispatch(cancelAppointment(id)).unwrap();
        toast.success("Appointment cancelled successfully");
      } catch (error) {
        toast.error(error.message || "Failed to cancel appointment");
      }
    }
  };

  const handleStatusUpdate = async (id, status) => {
    let confirmMessage = "";
    switch (status) {
      case "completed":
        confirmMessage = "Mark this appointment as completed?";
        break;
      case "cancelled":
        confirmMessage = "Cancel this appointment?";
        break;
      default:
        confirmMessage = `Update status to ${status}?`;
    }

    if (window.confirm(confirmMessage)) {
      try {
        await dispatch(updateStatus({ id, status })).unwrap();
        toast.success(`Appointment marked as ${status}`);
      } catch (error) {
        toast.error(error.message || "Failed to update status");
      }
    }
  };

  const userTabs = [
    { id: "upcoming", label: "Upcoming", count: stats?.upcoming || 0 },
    { id: "past", label: "Past", count: stats?.past || 0 },
    { id: "all", label: "All", count: stats?.total || 0 },
  ];

  const userStatCards = [
    { label: "Total", value: stats?.total || 0, color: "text-primary-600" },
    { label: "Upcoming", value: stats?.upcoming || 0, color: "text-green-600" },
    { label: "Past", value: stats?.past || 0, color: "text-gray-600" },
  ];

  const providerStatCards = [
    { label: "Total", value: stats?.total || 0, color: "text-primary-600" },
    { label: "Today", value: stats?.today || 0, color: "text-blue-600" },
    { label: "Upcoming", value: stats?.upcoming || 0, color: "text-green-600" },
    {
      label: "Completed",
      value: stats?.completed || 0,
      color: "text-purple-600",
    },
    { label: "Cancelled", value: stats?.cancelled || 0, color: "text-red-600" },
  ];

  const statCards = isProvider ? providerStatCards : userStatCards;
  const statGridCols = isProvider
    ? "grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7"
    : "grid-cols-1 md:grid-cols-3";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isProvider ? "Appointments" : "My Appointments"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isProvider
              ? "Manage your appointments"
              : "View and manage your bookings"}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={handleRefresh}
          loading={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/*---------------------- Error Display ----------------------------------*/}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <div className="text-red-700 text-sm">Error: {error}</div>
        </Card>
      )}

      {/*---------------------- View Type Tabs for Users ------------------------------- */}
      {!isProvider && (
        <div className="flex border-b">
          {userTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewType(tab.id)}
              className={`
                px-4 py-2 text-sm font-medium border-b-2 -mb-px
                ${
                  viewType === tab.id
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              {tab.label}
              <span
                className={`
                ml-2 px-2 py-0.5 text-xs rounded-full
                ${
                  viewType === tab.id
                    ? "bg-primary-100 text-primary-800"
                    : "bg-gray-100 text-gray-600"
                }
              `}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/*---------------------- Statistics ----------------------------------*/}
      <div className={`grid ${statGridCols} gap-4`}>
        {statCards.map((stat, index) => (
          <Card key={index} className="text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/*---------------------- Appointments List ----------------------------------*/}
      {loading && !refreshing ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : appointments.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Calendar className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No appointments found
          </h3>
          <p className="text-gray-600 mb-4">
            {isProvider
              ? "No appointments scheduled yet"
              : viewType === "upcoming"
                ? "You have no upcoming appointments"
                : "No appointments found"}
          </p>
          {!isProvider && viewType === "upcoming" && (
            <a href="/book" className="inline-block ml-4">
              <Button>Book New Appointment</Button>
            </a>
          )}
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment._id}
                appointment={appointment}
                onCancel={handleCancel}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>

          {/*---------------------- Pagination ----------------------------------*/}
          {pagination.totalPages > 1 && (
            <Card className="mt-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {(pagination.currentPage - 1) * pagination.limit + 1}{" "}
                  to{" "}
                  {Math.min(
                    pagination.currentPage * pagination.limit,
                    pagination.totalItems,
                  )}{" "}
                  of {pagination.totalItems} appointments
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-1 text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default MyAppointments;
