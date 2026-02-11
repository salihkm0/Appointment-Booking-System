const Appointment = require('../../models/Appointment');
const User = require('../../models/User');

//! Get Provider Reports
exports.getProviderReports = async (req, res) => {
    try {
        const providerId = req.user._id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        //--------------- Today's appointments ---------------
        const todayAppointments = await Appointment.countDocuments({
            provider: providerId,
            date: { $gte: today, $lt: tomorrow },
            status: 'booked'
        });

        //-------------- Total appointments ----------------
        const totalAppointments = await Appointment.countDocuments({
            provider: providerId
        });

        const completedAppointments = await Appointment.countDocuments({
            provider: providerId,
            status: 'completed'
        });

        const cancelledAppointments = await Appointment.countDocuments({
            provider: providerId,
            status: 'cancelled'
        });

        const bookedAppointments = await Appointment.countDocuments({
            provider: providerId,
            status: 'booked'
        });

        //-------------- Calculate revenue from completed appointments -------------
        const completedAppointmentsWithPrice = await Appointment.find({
            provider: providerId,
            status: 'completed'
        }).populate('service', 'price');

        const totalRevenue = completedAppointmentsWithPrice.reduce((sum, appointment) => {
            return sum + (appointment.service?.price || 0);
        }, 0);

        //------------ Count unique clients ------------
        const uniqueClients = await Appointment.distinct('user', {
            provider: providerId
        });

        //---------------- Calculate busiest times of the day ----------------
        const busiestTimes = await getBusiestTimes(providerId);

        res.json({
            todayAppointments,
            totalAppointments,
            completedAppointments,
            cancelledAppointments,
            bookedAppointments,
            totalRevenue,
            activeClients: uniqueClients.length,
            completionRate: completedAppointments / Math.max(1, totalAppointments),
            busiestTimes
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//! Helper function to get busiest times
async function getBusiestTimes(providerId) {
    try {
        //-------------- Get all completed and booked appointments -----------------
        const appointments = await Appointment.find({
            provider: providerId,
            status: { $in: ['completed', 'booked'] }
        }).select('startTime');

        //--------------- Group appointments by hour --------------
        const hourCounts = {};
        
        appointments.forEach(appointment => {
            const hour = appointment.startTime.split(':')[0];
            const hourInt = parseInt(hour);
            
            let hour12 = hourInt;
            let period = 'AM';
            
            if (hourInt === 0) {
                hour12 = 12;
            } else if (hourInt === 12) {
                hour12 = 12;
                period = 'PM';
            } else if (hourInt > 12) {
                hour12 = hourInt - 12;
                period = 'PM';
            }
            
            const timeSlot = `${hour12} ${period}`;
            
            if (hourCounts[timeSlot]) {
                hourCounts[timeSlot]++;
            } else {
                hourCounts[timeSlot] = 1;
            }
        });

        //-------------- Convert to array and sort by count (descending) -------------
        const timeSlots = Object.keys(hourCounts).map(time => ({
            time,
            count: hourCounts[time]
        }));

        //-------------- Sort by count (descending) --------------
        timeSlots.sort((a, b) => b.count - a.count);

        //------------ Get top 5 busiest times ------------
        const top5Busiest = timeSlots.slice(0, 5);

        //----------- Calculate total appointments for percentages -----------
        const totalAppointmentsCount = appointments.length;

        //------------ Add percentage to each time slot ------------
        const busiestTimesWithPercentage = top5Busiest.map(slot => ({
            ...slot,
            percentage: totalAppointmentsCount > 0 
                ? Math.round((slot.count / totalAppointmentsCount) * 100)
                : 0
        }));

        return {
            timeSlots: busiestTimesWithPercentage,
            totalCount: totalAppointmentsCount
        };
    } catch (error) {
        console.error('Error calculating busiest times:', error);
        return {
            timeSlots: [],
            totalCount: 0
        };
    }
}