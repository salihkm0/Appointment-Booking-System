const Appointment = require('../../models/Appointment');
const Service = require('../../models/Service');
const User = require('../../models/User');

//! Get Provider Dashboard Statistics
exports.getProviderDashboard = async (req, res) => {
    try {
        const providerId = req.user._id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        //------------- Count total appointments ---------------
        const totalAppointments = await Appointment.countDocuments({
            provider: providerId
        });

        //--------------- Count today's appointments ----------------
        const todayAppointments = await Appointment.countDocuments({
            provider: providerId,
            date: { $gte: today, $lt: tomorrow },
            status: 'booked'
        });

        //-------------- Count upcoming appointments ------------------
        const upcomingAppointments = await Appointment.countDocuments({
            provider: providerId,
            status: 'booked',
            date: { $gte: today }
        });

        //--------- Count appointments by status -----------
        const bookedCount = await Appointment.countDocuments({
            provider: providerId,
            status: 'booked'
        });

        const completedCount = await Appointment.countDocuments({
            provider: providerId,
            status: 'completed'
        });

        const cancelledCount = await Appointment.countDocuments({
            provider: providerId,
            status: 'cancelled'
        });

        //-------------------- Calculate revenue from completed appointments ---------------------
        const completedAppointments = await Appointment.find({
            provider: providerId,
            status: 'completed'
        }).populate('service', 'price');

        const totalRevenue = completedAppointments.reduce((sum, appointment) => {
            return sum + (appointment.service?.price || 0);
        }, 0);

        //--------------------- Count unique clients -------------------------
        const uniqueClients = await Appointment.distinct('user', {
            provider: providerId
        });

        //-------------- Count active services -----------------------
        const activeServices = await Service.countDocuments({
            provider: providerId,
            isActive: true
        });

        //---------------- Get recent appointments ---------------------
        const recentAppointments = await Appointment.find({
            provider: providerId
        })
        .populate('user', 'name email phone')
        .populate('service', 'name duration price')
        .sort({ date: -1, startTime: -1 })
        .limit(5);

        //---------- Get today's schedule --------------
        const todaysSchedule = await Appointment.find({
            provider: providerId,
            date: { $gte: today, $lt: tomorrow },
            status: 'booked'
        })
        .populate('user', 'name')
        .populate('service', 'name duration')
        .sort({ startTime: 1 });

        //---------------- Get popular services ---------------
        const popularServices = await Appointment.aggregate([
            {
                $match: { 
                    provider: providerId,
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: '$service',
                    count: { $sum: 1 },
                    revenue: { $sum: '$service.price' }
                }
            },
            {
                $lookup: {
                    from: 'services',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'service'
                }
            },
            {
                $unwind: '$service'
            },
            {
                $project: {
                    _id: 0,
                    serviceId: '$_id',
                    serviceName: '$service.name',
                    count: 1,
                    revenue: 1
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 5
            }
        ]);

        //----------------------- Calculate statistics -------------------
        const total = totalAppointments;
        const completionRate = total > 0 ? (completedCount / total) * 100 : 0;
        const cancellationRate = total > 0 ? (cancelledCount / total) * 100 : 0;
        const averageRevenue = completedCount > 0 ? totalRevenue / completedCount : 0;

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
                    cancellationRate: Math.round(cancellationRate * 10) / 10,
                    totalRevenue: Math.round(totalRevenue * 100) / 100,
                    averageRevenue: Math.round(averageRevenue * 100) / 100,
                    activeClients: uniqueClients.length,
                    activeServices
                },
                recentAppointments,
                todaysSchedule,
                popularServices,
                summary: {
                    hasUpcoming: upcomingAppointments > 0,
                    hasScheduleToday: todaysSchedule.length > 0,
                    hasPopularServices: popularServices.length > 0
                }
            }
        });
    } catch (error) {
        console.error('Provider Dashboard Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load dashboard data',
            message: error.message
        });
    }
};

//! Get Provider Dashboard Trends
exports.getProviderDashboardTrends = async (req, res) => {
    try {
        const providerId = req.user._id;
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

        //--------------------- Get appointments in the period ----------------------
        const appointments = await Appointment.find({
            provider: providerId,
            date: { $gte: startDate, $lte: endDate }
        }).populate('service', 'price');

        //------------------ Group by date and calculate revenue and counts --------------------
        const appointmentsByDate = {};
        const statusCounts = {
            booked: 0,
            completed: 0,
            cancelled: 0,
        };
        let totalRevenue = 0;

        appointments.forEach(app => {
            const dateStr = app.date.toISOString().split('T')[0];
            if (!appointmentsByDate[dateStr]) {
                appointmentsByDate[dateStr] = {
                    booked: 0,
                    completed: 0,
                    cancelled: 0,
                    total: 0,
                    revenue: 0
                };
            }
            appointmentsByDate[dateStr][app.status]++;
            appointmentsByDate[dateStr].total++;
            
            if (app.status === 'completed' && app.service?.price) {
                const revenue = app.service.price;
                appointmentsByDate[dateStr].revenue += revenue;
                totalRevenue += revenue;
            }
            
            statusCounts[app.status]++;
        });

        const chartData = Object.keys(appointmentsByDate).map(date => ({
            date,
            ...appointmentsByDate[date]
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        //----------------- Get revenue by service --------------------------
        const revenueByService = {};
        appointments
            .filter(app => app.status === 'completed' && app.service)
            .forEach(app => {
                const serviceName = app.service.name;
                const revenue = app.service.price || 0;
                if (!revenueByService[serviceName]) {
                    revenueByService[serviceName] = {
                        revenue: 0,
                        count: 0
                    };
                }
                revenueByService[serviceName].revenue += revenue;
                revenueByService[serviceName].count++;
            });

        res.json({
            success: true,
            data: {
                period: {
                    start: startDate,
                    end: endDate
                },
                chartData,
                statusCounts,
                total: appointments.length,
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                revenueByService,
                summary: {
                    averageDailyRevenue: Math.round((totalRevenue / Object.keys(appointmentsByDate).length) * 100) / 100,
                    completionRate: (statusCounts.completed / appointments.length) * 100
                }
            }
        });
    } catch (error) {
        console.error('Provider Trends Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load trends data'
        });
    }
};

//! Get Provider Dashboard Overview (quick stats)
exports.getProviderDashboardOverview = async (req, res) => {
    try {
        const providerId = req.user._id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        //--------- Today's stats ------------------
        const todayStats = await Appointment.aggregate([
            {
                $match: {
                    provider: providerId,
                    date: { $gte: today, $lt: tomorrow }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        //-------------- Yesterday's stats for comparison ----------------
        const yesterdayStats = await Appointment.aggregate([
            {
                $match: {
                    provider: providerId,
                    date: { $gte: yesterday, $lt: today }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        //------------------ This week's appointments -------------
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const weeklyStats = await Appointment.aggregate([
            {
                $match: {
                    provider: providerId,
                    date: { $gte: weekStart, $lt: weekEnd }
                }
            },
            {
                $group: {
                    _id: {
                        day: { $dayOfWeek: '$date' },
                        status: '$status'
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        //---------------- Top clients ----------------
        const topClients = await Appointment.aggregate([
            {
                $match: {
                    provider: providerId,
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: '$user',
                    totalAppointments: { $sum: 1 },
                    totalSpent: { $sum: '$service.price' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    _id: 0,
                    userId: '$_id',
                    name: '$user.name',
                    email: '$user.email',
                    totalAppointments: 1,
                    totalSpent: 1
                }
            },
            {
                $sort: { totalSpent: -1 }
            },
            {
                $limit: 5
            }
        ]);

        res.json({
            success: true,
            data: {
                today: formatStats(todayStats),
                yesterday: formatStats(yesterdayStats),
                weekly: formatWeeklyStats(weeklyStats),
                topClients,
                quickStats: {
                    hasTodayAppointments: todayStats.length > 0,
                    hasWeeklyData: weeklyStats.length > 0,
                    hasTopClients: topClients.length > 0
                }
            }
        });
    } catch (error) {
        console.error('Provider Overview Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load overview data'
        });
    }
};

//! Helper functions
function formatStats(statsArray) {
    const result = {
        booked: 0,
        completed: 0,
        cancelled: 0,
        total: 0
    };
    
    statsArray.forEach(stat => {
        result[stat._id] = stat.count;
        result.total += stat.count;
    });
    
    return result;
}

function formatWeeklyStats(weeklyStats) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const result = {};
    
    days.forEach(day => {
        result[day] = {
            booked: 0,
            completed: 0,
            cancelled: 0,
            total: 0
        };
    });
    
    weeklyStats.forEach(stat => {
        const dayIndex = stat._id.day - 1; // MongoDB dayOfWeek returns 1 (Sunday) to 7 (Saturday)
        const dayName = days[dayIndex];
        const status = stat._id.status;
        
        if (result[dayName]) {
            result[dayName][status] = stat.count;
            result[dayName].total += stat.count;
        }
    });
    
    return result;
}