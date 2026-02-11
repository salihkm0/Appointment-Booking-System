import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { getServices, selectServicesArray } from '../redux/slices/serviceSlice';
import { getAvailableSlots, bookAppointment, clearSlots } from '../redux/slices/appointmentSlice';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import TimeSlotPicker from '../components/ui/TimeSlotPicker';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { Calendar, Clock, User, DollarSign, AlertCircle } from 'lucide-react';

const BookAppointment = () => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      serviceId: '',
      date: '',
      notes: ''
    }
  });
  
  const dispatch = useDispatch();
  
  const services = useSelector(selectServicesArray);
  const { loading: servicesLoading } = useSelector((state) => state.services);
  const { availableSlots = [], slotsLoading } = useSelector((state) => state.appointments);
  const { user } = useSelector((state) => state.auth);

  const serviceId = watch('serviceId');
  const date = watch('date');

  useEffect(() => {
    dispatch(getServices());
  }, [dispatch]);

  useEffect(() => {
    if (serviceId && date) {
      const service = services.find(s => s._id === serviceId);
      if (service) {
        setSelectedService(service);
        dispatch(getAvailableSlots({
          providerId: service.provider._id,
          serviceId: service._id,
          date: date
        }));
      }
    } else {
      dispatch(clearSlots());
    }
  }, [serviceId, date, services, dispatch]);

  const handleServiceSelect = () => {
    if (serviceId && date) {
      setStep(2);
    } else {
      toast.error('Please select a service and date');
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const onSubmit = async (data) => {
    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }

    if (!selectedService) {
      toast.error('Please select a service');
      return;
    }

    const appointmentData = {
      providerId: selectedService.provider._id,
      serviceId: selectedService._id,
      date: data.date,
      startTime: selectedSlot.startTime,
      notes: data.notes
    };

    try {
      await dispatch(bookAppointment(appointmentData)).unwrap();
      toast.success('Appointment booked successfully!');
      handleReset();
    } catch (error) {
      toast.error(error.message || 'Booking failed');
    }
  };

  const handleReset = () => {
    reset({
      serviceId: '',
      date: '',
      notes: ''
    });
    setSelectedService(null);
    setSelectedSlot(null);
    setStep(1);
    dispatch(clearSlots());
  };

  const handleBackToStep1 = () => {
    setSelectedService(null);
    setSelectedSlot(null);
    setStep(1);
    dispatch(clearSlots());
  };

  const steps = [
    { number: 1, title: 'Select Service & Date' },
    { number: 2, title: 'Choose Time' },
    { number: 3, title: 'Confirm Booking' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Book Appointment</h1>
          <p className="text-gray-600 mt-1">Schedule your appointment in 3 easy steps</p>
        </div>
        
        {(step > 1 || selectedService) && (
          <Button
            variant="secondary"
            size="small"
            onClick={handleReset}
          >
            Start Over
          </Button>
        )}
      </div>

      {/*-------------------------- Progress Steps -------------------------------*/}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          {steps.map((stepItem, index) => (
            <div key={stepItem.number} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= stepItem.number ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {stepItem.number}
              </div>
              {index < steps.length - 1 && (
                <div className={`h-1 w-16 ${step > stepItem.number ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

{/*-------------------------- Step Content -------------------------------*/}
      <Card>
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Select Service & Date</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose a Service
                </label>
                {servicesLoading ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner />
                  </div>
                ) : !services || services.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No services available at the moment</p>
                    <Button 
                      variant="secondary" 
                      onClick={() => dispatch(getServices())}
                    >
                      Refresh Services
                    </Button>
                  </div>
                ) : (
                  <div>
                    <select
                      {...register('serviceId', { required: 'Please select a service' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={serviceId}
                    >
                      <option value="">Select a service</option>
                      {services.map(service => (
                        <option key={service._id} value={service._id}>
                          {service.name} with {service.provider?.name} - ${service.price} ({service.duration}min)
                        </option>
                      ))}
                    </select>
                    {errors.serviceId && (
                      <p className="mt-1 text-sm text-red-600">{errors.serviceId.message}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      {services.length} service{services.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <Input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  {...register('date', { 
                    required: 'Date is required',
                    validate: value => {
                      if (!value) return 'Date is required';
                      const selectedDate = new Date(value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return selectedDate >= today || 'Date cannot be in the past';
                    }
                  })}
                  error={errors.date?.message}
                  value={date}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleServiceSelect}
                  disabled={!serviceId || !date}
                >
                  Next: Choose Time
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Choose Time Slot</h2>
            
            {selectedService && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 mb-1">{selectedService.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      With <span className="font-medium">{selectedService.provider?.name}</span> on {date ? new Date(date).toLocaleDateString() : 'Select date'}
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {selectedService.duration} minutes
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${selectedService.price}
                      </span>
                      {selectedService.description && (
                        <span className="text-gray-500 italic">
                          "{selectedService.description}"
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {slotsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
                <span className="ml-3 text-gray-600">Loading available time slots...</span>
              </div>
            ) : (
              <TimeSlotPicker
                slots={availableSlots}
                selectedSlot={selectedSlot}
                onSelect={handleSlotSelect}
                loading={false}
              />
            )}

            {availableSlots.length === 0 && !slotsLoading && (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No available time slots for this date</p>
                <p className="text-sm mt-1">Try selecting a different date or contact the provider</p>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button 
                variant="secondary" 
                onClick={() => {
                  setStep(1);
                  setSelectedSlot(null);
                }}
              >
                ← Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!selectedSlot}
              >
                Next: Confirm Booking
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Confirm Booking</h2>
            
            <div className="space-y-6">
              <Card padding={true} className="bg-gray-50">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">{selectedService?.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{selectedService?.provider?.name}</p>
                    </div>
                    <span className="text-lg font-bold text-primary-600">
                      ${selectedService?.price}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{date ? new Date(date).toLocaleDateString() : 'No date selected'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          {selectedSlot?.startTime} - {selectedSlot?.endTime}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{selectedService?.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span>Booked by: {user?.name}</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedService?.description && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Service Description:</span> {selectedService.description}
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  {...register('notes')}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Any special requirements, questions, or notes for the provider..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  This information will be shared with the service provider
                </p>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <p>By booking this appointment, you agree to the provider's terms and conditions.</p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="secondary" 
                    onClick={() => setStep(2)}
                  >
                    ← Back
                  </Button>
                  <Button 
                    onClick={handleSubmit(onSubmit)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Confirm Booking
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BookAppointment;