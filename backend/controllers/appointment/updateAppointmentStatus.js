const Appointment = require('../../models/Appointment');

//! Update Appointment Status (Provider Only)
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findOne({
            _id: req.params.id,
            provider: req.user._id
        });

        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        appointment.status = status;
        await appointment.save();

        res.json(appointment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};