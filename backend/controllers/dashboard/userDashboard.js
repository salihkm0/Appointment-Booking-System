const Appointment = require('../../models/Appointment');
const moment = require('moment');

//! Get User Dashboard Statistics
exports.getUserDashboard = async (req, res) => {
    try {
        const userId = req.user._id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        //------------------ Count total appointments --------------
        const totalAppointments = await Appointment.countDocuments({
            user: userId
        });

        //-------------------- Count today's appointments -----------------
        const todayAppointments = await Appointment.countDocuments({
            user: userId,
            date: { $gte: today, $lt: tomorrow },
            status: 'booked'
        });

        //----------------- Count upcoming appointments ---------------
        const upcomingAppointments = await Appointment.countDocuments({
            user: userId,
            status: 'booked',
            date: { $gte: today }
        });

        //----------- Count appointments by status -------------
        const bookedCount = await Appointment.countDocuments({
            user: userId,
            status: 'booked'
        });

        const completedCount = await Appointment.countDocuments({
            user: userId,
            status: 'completed'
        });

        const cancelledCount = await Appointment.countDocuments({
            user: userId,
            status: 'cancelled'
        });

        //------------ Get recent appointments (last 5) ----------
        const recentAppointments = await Appointment.find({
            user: userId
        })
        .populate('provider', 'name email phone')
        .populate('service', 'name duration price')
        .sort({ date: -1, startTime: -1 })
        .limit(5);

        //----------- Get upcoming appointments for the next 7 days -------------
        const weekAppointments = await Appointment.find({
            user: userId,
            status: 'booked',
            date: { $gte: today }
        })
        .populate('provider', 'name')
        .populate('service', 'name')
        .sort({ date: 1, startTime: 1 })
        .limit(10);

        //---------------- Calculate statistics --------------
        const total = totalAppointments;
        const completionRate = total > 0 ? (completedCount / total) * 100 : 0;
        const cancellationRate = total > 0 ? (cancelledCount / total) * 100 : 0;

        res.json({
            success: true,
            data: {
                stats: {
                    total,
                    today: todayAppointments,
                    upcoming: upcomingAppointments,
                    booked: bookedCount,
                    completed: completedCount,
                    cancelled: cancelledCount,
                    completionRate: Math.round(completionRate * 10) / 10,
                    cancellationRate: Math.round(cancellationRate * 10) / 10
                },
                recentAppointments,
                upcomingAppointments: weekAppointments,
                summary: {
                    hasUpcoming: upcomingAppointments > 0,
                    hasRecent: recentAppointments.length > 0,
                }
            }
        });
    } catch (error) {
        console.error('User Dashboard Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load dashboard data',
            message: error.message
        });
    }
};

//! Get User Dashboard Trends (for charts)
exports.getUserDashboardTrends = async (req, res) => {
    try {
        const userId = req.user._id;
        const { period = 'week' } = req.query;
        
        let startDate;
        const endDate = new Date();
        
        switch (period) {
            case 'week':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'year':
                startDate = new Date();
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default:
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
        }

        //---------------- Get appointments in the period ---------------
        const appointments = await Appointment.find({
            user: userId,
            date: { $gte: startDate, $lte: endDate }
        });

        //-------------------- Group by date -------------------
        const appointmentsByDate = {};
        const statusCounts = {
            booked: 0,
            completed: 0,
            cancelled: 0,
        };

        appointments.forEach(app => {
            const dateStr = app.date.toISOString().split('T')[0];
            if (!appointmentsByDate[dateStr]) {
                appointmentsByDate[dateStr] = {
                    booked: 0,
                    completed: 0,
                    cancelled: 0,
                    total: 0
                };
            }
            appointmentsByDate[dateStr][app.status]++;
            appointmentsByDate[dateStr].total++;
            statusCounts[app.status]++;
        });

        //-------------- Format for chart ----------------------
        const chartData = Object.keys(appointmentsByDate).map(date => ({
            date,
            ...appointmentsByDate[date]
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json({
            success: true,
            data: {
                period: {
                    start: startDate,
                    end: endDate
                },
                chartData,
                statusCounts,
                total: appointments.length
            }
        });
    } catch (error) {
        console.error('User Trends Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load trends data'
        });
    }
};