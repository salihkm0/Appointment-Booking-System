import LoadingSpinner from '../common/LoadingSpinner';

const TimeSlotPicker = ({ slots = [], selectedSlot, onSelect, loading }) => {
  const formatTime = (time) => {
    const [hour, minute] = time.split(':');
    const date = new Date();
    date.setHours(hour, minute);
    const options = { hour: 'numeric', minute: '2-digit', hour12: true };
    return date.toLocaleTimeString('en-US', options);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
        <span className="ml-3 text-gray-600">Loading time slots...</span>
      </div>
    );
  }

  if (!slots || !Array.isArray(slots) || slots.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No available time slots for this date
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {slots.map((slot, index) => (
        <button
          key={index}
          onClick={() => slot.available && onSelect(slot)}
          disabled={!slot.available}
          className={`
            p-3 rounded-lg border text-center transition-all
            ${selectedSlot?.startTime === slot.startTime
              ? 'bg-primary-600 text-white border-primary-600 transform scale-105'
              : slot.available
              ? 'bg-white text-gray-700 border-gray-300 hover:border-primary-500 hover:bg-primary-50 hover:shadow'
              : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            }
          `}
        >
          <div className="font-medium">
            {formatTime(slot.startTime)}
          </div>
          <div className="text-xs mt-1">
            {formatTime(slot.endTime)}
          </div>
        </button>
      ))}
    </div>
  );
};

export default TimeSlotPicker;