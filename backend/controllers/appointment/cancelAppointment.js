const Appointment = require('../../models/Appointment');

//! Cancel Appointment
exports.cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findOne({
            _id: req.params.id,
            user: req.user._id,
            status: 'booked'
        });

        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found or cannot be cancelled' });
        }

        //------------------- Check if appointment is in the past ----------------------
        if (new Date(appointment.date) < new Date()) {
            return res.status(400).json({ error: 'Cannot cancel past appointments' });
        }

        appointment.status = 'cancelled';
        appointment.cancelledAt = new Date();
        appointment.cancelledBy = 'user';
        await appointment.save();

        res.json({ message: 'Appointment cancelled successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};