const Appointment = require('../../models/Appointment');
const User = require('../../models/User');

//! Get User Reports
exports.getUserReports = async (req, res) => {
    try {
        const userId = req.user._id;

        const totalBooked = await Appointment.countDocuments({
            user: userId,
            status: 'booked'
        });

        const totalCompleted = await Appointment.countDocuments({
            user: userId,
            status: 'completed'
        });

        const totalCancelled = await Appointment.countDocuments({
            user: userId,
            status: 'cancelled'
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const upcomingAppointments = await Appointment.countDocuments({
            user: userId,
            status: 'booked',
            date: { $gte: today }
        });

        //------------ Get today's appointments ------------
        const todayAppointments = await Appointment.countDocuments({
            user: userId,
            date: { $gte: today, $lt: tomorrow },
            status: 'booked'
        });

        res.json({
            totalBooked,
            totalCompleted,
            totalCancelled,
            upcomingAppointments,
            todayAppointments,
            cancellationRate: totalCancelled / Math.max(1, totalBooked + totalCompleted + totalCancelled),
            totalAll: totalBooked + totalCompleted + totalCancelled
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};