import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { availabilityApi } from "../api/availabilityApi";
import toast from "react-hot-toast";
import { DAYS_OF_WEEK, TIME_SLOTS } from "../utils/constants";

const Availability = () => {
  const [availability, setAvailability] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset } = useForm();
  const { user } = useSelector((state) => state.auth);

  const isProvider = user?.role === "provider";

  useEffect(() => {
    if (isProvider) {
      fetchAvailability();
    }
  }, [isProvider]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await availabilityApi.getMyAvailability();
      setAvailability(response.weekly || []);
      setBlockedDates(response.blockedDates || []);
    } catch (error) {
      toast.error("Failed to load availability");
    } finally {
      setLoading(false);
    }
  };

  const handleDayAvailability = async (dayId, startTime, endTime) => {
    try {
      await availabilityApi.setAvailability({
        dayOfWeek: dayId,
        startTime,
        endTime,
      });
      await fetchAvailability();
      toast.success("Availability updated");
    } catch (error) {
      toast.error("Failed to update availability");
    }
  };

  const handleSetDefaultAvailability = async () => {
    if (
      !window.confirm(
        "Set default availability (9 AM - 5 PM) for all weekdays?",
      )
    ) {
      return;
    }

    try {
      const promises = [1, 2, 3, 4, 5].map((dayId) =>
        availabilityApi.setAvailability({
          dayOfWeek: dayId,
          startTime: "09:00",
          endTime: "17:00",
        }),
      );

      await Promise.all(promises);
      await fetchAvailability();
      toast.success("Default availability set successfully");
    } catch (error) {
      toast.error("Failed to set default availability");
    }
  };

  const handleBlockDate = async (data) => {
    try {
      await availabilityApi.blockDate({
        date: data.date,
        reason: data.reason,
      });
      reset();
      await fetchAvailability();
      toast.success("Date blocked successfully");
    } catch (error) {
      toast.error("Failed to block date");
    }
  };

  const getAvailabilityForDay = (dayId) => {
    return availability.find((a) => a.dayOfWeek === dayId);
  };

  const hasAnyAvailability = availability.length > 0;

  if (!isProvider) {
    return (
      <Card className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Provider Access Required
        </h2>
        <p className="text-gray-600">
          Only service providers can manage availability.
        </p>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manage Availability
          </h1>
          <p className="text-gray-600 mt-1">
            Set your working hours and block dates
          </p>
        </div>

        {!hasAnyAvailability && (
          <Button onClick={handleSetDefaultAvailability}>
            Set Default Availability
          </Button>
        )}
      </div>

      {!hasAnyAvailability && (
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                No availability set yet
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You need to set your availability before clients can book
                  appointments.
                </p>
                <p className="mt-1">
                  Click "Set Default Availability" or set hours for each day
                  below.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/*-------------------- Weekly Availability ---------------------------*/}
      <Card>
        <div className="space-y-4">
          {DAYS_OF_WEEK.map((day) => {
            const dayAvailability = getAvailabilityForDay(day.id);
            const isAvailable = dayAvailability && !dayAvailability.isBlocked;

            return (
              <div
                key={day.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-800 w-28">
                    {day.name}
                  </span>
                  {isAvailable ? (
                    <span className="text-green-600 text-sm">
                      {dayAvailability.startTime} - {dayAvailability.endTime}
                    </span>
                  ) : (
                    <span className="text-red-600 text-sm">Not available</span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      defaultValue={
                        isAvailable ? dayAvailability.startTime : "09:00"
                      }
                      onChange={(e) => {
                        const startTime = e.target.value;
                        const endTime = isAvailable
                          ? dayAvailability.endTime
                          : "17:00";
                        handleDayAvailability(day.id, startTime, endTime);
                      }}
                    >
                      <option value="">Select Start Time</option>
                      {TIME_SLOTS.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>

                    <span className="text-gray-500 hidden sm:inline">to</span>

                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      defaultValue={
                        isAvailable ? dayAvailability.endTime : "17:00"
                      }
                      onChange={(e) => {
                        const endTime = e.target.value;
                        const startTime = isAvailable
                          ? dayAvailability.startTime
                          : "09:00";
                        handleDayAvailability(day.id, startTime, endTime);
                      }}
                    >
                      <option value="">Select End Time</option>
                      {TIME_SLOTS.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    variant={isAvailable ? "danger" : "primary"}
                    size="small"
                    onClick={() => {
                      if (isAvailable) {
                        // Mark as not available
                        handleDayAvailability(day.id, "00:00", "00:00");
                      } else {
                        // Set default hours
                        handleDayAvailability(day.id, "09:00", "17:00");
                      }
                    }}
                  >
                    {isAvailable ? "Mark Unavailable" : "Set Available"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/*-------------------- Block Dates ---------------------------*/}
      <Card>
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          Block Dates
        </h2>

        <form onSubmit={handleSubmit(handleBlockDate)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date to Block
              </label>
              <Input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                {...register("date", { required: true })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason (Optional)
              </label>
              <Input
                type="text"
                placeholder="e.g., Holiday, Personal day"
                {...register("reason")}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit">Block Date</Button>
          </div>
        </form>

        {blockedDates.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium text-gray-800 mb-3">Blocked Dates</h3>
            <div className="space-y-2">
              {blockedDates.map((blocked, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded"
                >
                  <span>{new Date(blocked.date).toLocaleDateString()}</span>
                  <span className="text-red-700">
                    {blocked.reason || "No reason provided"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Availability;
