const Appointment = require('../../models/Appointment');

//! Cancel Appointment - Customer can cancel anytime BEFORE the appointment time
exports.cancelAppointment = async (req, res) => {
    try {
        // Find the appointment
        const appointment = await Appointment.findOne({
            _id: req.params.id,
            user: req.user._id,
            status: 'booked'
        }).populate('service');

        if (!appointment) {
            return res.status(404).json({ 
                success: false,
                error: 'Appointment not found or cannot be cancelled' 
            });
        }

        // Create appointment date-time object
        const appointmentDate = new Date(appointment.date);
        const [hours, minutes] = appointment.startTime.split(':').map(Number);
        
        // Set the exact appointment start time
        const appointmentDateTime = new Date(appointmentDate);
        appointmentDateTime.setHours(hours, minutes, 0, 0);
        
        // Get current date-time
        const now = new Date();
        
        // Debug logs
        console.log('=== CANCELLATION DEBUG ===');
        console.log('Appointment Date (from DB):', appointment.date);
        console.log('Appointment Start Time:', appointment.startTime);
        console.log('Appointment DateTime:', appointmentDateTime);
        console.log('Current DateTime:', now);
        console.log('Is appointment in future?', appointmentDateTime > now);
        console.log('Time difference (minutes):', (appointmentDateTime - now) / (1000 * 60));
        console.log('=========================');

        // Check if appointment has already started or passed
        if (appointmentDateTime <= now) {
            return res.status(400).json({ 
                success: false,
                error: 'Cannot cancel appointments that have already started or passed' 
            });
        }

        // No time restriction - customer can cancel anytime before the appointment
        // (Remove any 24-hour restriction if you had it before)

        // Update appointment status
        appointment.status = 'cancelled';
        appointment.cancelledAt = new Date();
        appointment.cancelledBy = 'user';
        
        await appointment.save();

        // Populate for response
        await appointment.populate([
            { path: 'provider', select: 'name email phone' },
            { path: 'service', select: 'name duration price' }
        ]);

        res.json({ 
            success: true,
            message: 'Appointment cancelled successfully',
            data: appointment
        });
    } catch (error) {
        console.error('Cancel appointment error:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || 'Failed to cancel appointment' 
        });
    }
};