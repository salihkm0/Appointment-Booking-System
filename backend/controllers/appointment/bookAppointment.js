const Appointment = require('../../models/Appointment');
const Service = require('../../models/Service');
const Availability = require('../../models/Availability');
const { timeToMinutes } = require('../../helpers/timeToMinutes');
const { minutesToTime } = require('../../helpers/minutesToTime');


//! Book Appointment
exports.bookAppointment = async (req, res) => {
    try {
        const { providerId, serviceId, date, startTime } = req.body;

        console.log('📝 Booking appointment with:', { 
            providerId, 
            serviceId, 
            date, 
            startTime,
            userId: req.user._id 
        });

        const service = await Service.findById(serviceId);
        if (!service) {
            console.log('❌ Service not found:', serviceId);
            return res.status(404).json({ error: 'Service not found' });
        }

        console.log('✅ Service found:', service.name);

        //---------------- Calculate end time ----------------
        const startMinutes = timeToMinutes(startTime);
        const endMinutes = startMinutes + service.duration;
        const endTime = minutesToTime(endMinutes);

        console.log('⏰ Time calculated:', { startTime, endTime, duration: service.duration });

        //----------------- Check availability -------------------
        const selectedDate = new Date(date);
        const dayOfWeek = selectedDate.getDay();

        const availability = await Availability.findOne({
            provider: providerId,
            dayOfWeek
        });

        if (!availability || availability.isBlocked) {
            console.log('❌ Provider not available on day:', dayOfWeek);
            return res.status(400).json({ error: 'Provider not available on this day' });
        }

        console.log('✅ Availability found:', availability);

        //---------------- Check if date is blocked -------------------
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const isBlocked = await Availability.findOne({
            provider: providerId,
            dayOfWeek: -1,
            blockedDate: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        });

        if (isBlocked) {
            console.log('❌ Date is blocked');
            return res.status(400).json({ error: 'Date is blocked' });
        }

        //------------------ Check if slot overlaps with existing appointment --------------------
        const existingAppointment = await Appointment.findOne({
            provider: providerId,
            date: {
                $gte: startOfDay,
                $lt: endOfDay
            },
            startTime: startTime,
            status: 'booked'
        });

        if (existingAppointment) {
            console.log('❌ Time slot already booked');
            return res.status(400).json({ error: 'Time slot already booked' });
        }

        console.log('✅ Slot is available');

        //---------------- Create appointment ------------------------
        const appointment = await Appointment.create({
            user: req.user._id,
            provider: providerId,
            service: serviceId,
            date: selectedDate,
            startTime,
            endTime,
            status: 'booked'
        });

        console.log('✅ Appointment created:', appointment._id);

        //------------- Populate details for response ----------------
        await appointment.populate([
            { path: 'provider', select: 'name email phone' },
            { path: 'service', select: 'name duration price' }
        ]);

        console.log('✅ Appointment populated');

        res.status(201).json(appointment);
    } catch (error) {
        console.error('❌ Error booking appointment:', error);
        res.status(500).json({ error: error.message });
    }
};