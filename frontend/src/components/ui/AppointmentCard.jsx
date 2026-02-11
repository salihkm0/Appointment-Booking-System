import { format } from 'date-fns';
import { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useSelector } from 'react-redux';
import { ChevronDown } from 'lucide-react';

const AppointmentCard = ({ appointment, onCancel, onStatusUpdate }) => {
  const { user } = useSelector((state) => state.auth);
  const isProvider = user?.role === 'provider';
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  
  const formatTime = (time) => {
    const [hour, minute] = time.split(':');
    const date = new Date();
    date.setHours(hour, minute);
    return format(date, 'h:mm a');
  };

  const getStatusColor = (status) => {
    const colors = {
      booked: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const appointmentDate = new Date(appointment.date);
  const appointmentDateTime = new Date(appointment.date);
  const [hours, minutes] = appointment.startTime.split(':').map(Number);
  appointmentDateTime.setHours(hours, minutes, 0, 0);
  
  const now = new Date();
  
  const isPastBookingTime = now >= appointmentDateTime;
  
  const isBooked = appointment.status === 'booked';
  
  const canUserCancel = !isPastBookingTime && isBooked && !isProvider;

  const canProviderUpdate = isProvider && (isBooked || appointment.status === 'completed');

  const statusOptions = [
    { 
      value: 'completed', 
      label: 'Mark as Completed', 
      icon: '✓',
      color: 'text-green-600 hover:bg-green-50'
    },
    { 
      value: 'cancelled', 
      label: 'Cancel Appointment', 
      icon: '✗',
      color: 'text-red-600 hover:bg-red-50'
    },
  ];

  const handleStatusChange = (status) => {
    setShowStatusDropdown(false);
    onStatusUpdate(appointment._id, status);
  };

  const isPastDate = appointmentDate < new Date(now.setHours(0, 0, 0, 0));

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-gray-800">
              {appointment.service?.name || 'Service'}
            </h3>
            <div className="flex flex-col items-end gap-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </span>
              {isPastBookingTime && isBooked && !isProvider && (
                <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">
                  Booking time passed
                </span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                {format(appointmentDate, 'PPP')}
              </p>
              <p className="text-sm text-gray-600">
                {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
              </p>
            </div>
            
            <div className="space-y-1">
               <p className="text-sm text-gray-600">
                {isProvider ? `${appointment.user?.name || 'Client'}` : `${appointment.provider?.name || 'Provider'}`}
              </p>
              <p className="text-sm text-gray-600">
                ${appointment.service?.price || '0'}
              </p>
            </div>
          </div>
          
          {appointment.notes && (
            <div className="mt-3 p-2 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Notes:</span> {appointment.notes}
              </p>
            </div>
          )}
          
          {isPastBookingTime && isBooked && !isProvider && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-100 rounded">
              <p className="text-xs text-yellow-700">
                The booking time for this appointment has passed. 
                Please contact the provider directly if you need assistance.
              </p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 min-w-[180px]">
          {canUserCancel && (
            <Button
              variant="danger"
              size="small"
              onClick={() => onCancel(appointment._id)}
            >
              Cancel Appointment
            </Button>
          )}

          {!isProvider && isBooked && isPastBookingTime && (
            <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded border border-gray-200">
              Cancellation is no longer available as the booking time has passed.
            </div>
          )}
          
          {canProviderUpdate && (
            <div className="relative">
              <Button
                variant="primary"
                size="small"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="w-full flex items-center justify-between gap-2"
              >
                <span>Update Status</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
              </Button>
              
              {showStatusDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="py-1">
                    {statusOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleStatusChange(option.value)}
                        className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${option.color} hover:bg-gray-50 transition-colors`}
                      >
                        <span className="w-4">{option.icon}</span>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {isProvider && isBooked && isPastDate && (
            <div className="text-xs text-gray-500 p-2 bg-yellow-50 rounded border border-yellow-100">
              This appointment has passed but is still marked as "booked".
              Please update the status using the dropdown above.
            </div>
          )}

          {appointment.status === 'cancelled' && appointment.cancelledBy && (
            <div className="text-xs text-gray-500 mt-2 p-1 bg-gray-100 rounded">
              Cancelled by: {appointment.cancelledBy === 'user' ? 'Customer' : 'Provider'}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AppointmentCard;