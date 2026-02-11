const Appointment = require('../../models/Appointment');

//! Get Provider Appointments with Pagination
exports.getProviderAppointments = async (req, res) => {
    try {
        const { 
            date, 
            status, 
            page = 1, 
            limit = 10,
            sortBy = 'date',
            sortOrder = 'desc',
            startDate,
            endDate,
            userId,
            serviceId
        } = req.query;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let query = { provider: req.user._id };

        //--------------- Date filtering ----------------
        if (date) {
            const selectedDate = new Date(date);
            query.date = {
                $gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
                $lt: new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)
            };
        }
        
        //--------------- Date range filtering ----------------
        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                query.date.$gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.date.$lte = end;
            }
        }

        //------------- Status filtering ------------
        if (status) {
            query.status = status;
        }
        
        //------------- User filtering --------------
        if (userId) {
            query.user = userId;
        }
        
        //------------ Service filtering --------------
        if (serviceId) {
            query.service = serviceId;
        }
        
        //---------------- Get stats for provider --------------
        const statsQuery = { provider: req.user._id };
        const stats = await Promise.all([
            Appointment.countDocuments(statsQuery),
            Appointment.countDocuments({
                ...statsQuery,
                date: { 
                    $gte: today,
                    $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                }
            }),
            Appointment.countDocuments({
                ...statsQuery,
                date: { $gte: today },
                status: 'booked'
            }),
            Appointment.countDocuments({
                ...statsQuery,
                $or: [
                    { date: { $lt: today } },
                    { status: { $in: ['completed', 'cancelled'] } }
                ]
            }),
            
            //----------------- By status -----------------
            Appointment.countDocuments({ ...statsQuery, status: 'booked' }),
            Appointment.countDocuments({ ...statsQuery, status: 'completed' }),
            Appointment.countDocuments({ ...statsQuery, status: 'cancelled' }),
            Appointment.countDocuments({
                ...statsQuery,
                date: { $lt: today },
                status: 'booked'
            }),
            Appointment.aggregate([
                {
                    $match: {
                        ...statsQuery,
                        status: 'completed'
                    }
                },
                {
                    $lookup: {
                        from: 'services',
                        localField: 'service',
                        foreignField: '_id',
                        as: 'serviceDetails'
                    }
                },
                {
                    $unwind: '$serviceDetails'
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$serviceDetails.price' }
                    }
                }
            ])
        ]);
        
        const totalRevenue = stats[8] && stats[8][0] ? stats[8][0].totalRevenue : 0;
        
        //------------ Sorting -------------------
        const sort = {};
        const validSortFields = ['date', 'createdAt', 'startTime', 'status'];
        const field = validSortFields.includes(sortBy) ? sortBy : 'date';
        sort[field] = sortOrder === 'desc' ? -1 : 1;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort,
            populate: [
                { 
                    path: 'user', 
                    select: 'name email phone' 
                },
                { 
                    path: 'service', 
                    select: 'name duration price' 
                }
            ]
        };

        const result = await Appointment.paginate(query, options);

        res.json({
            success: true,
            data: result.docs,
            pagination: {
                totalItems: result.totalDocs,
                totalPages: result.totalPages,
                currentPage: result.page,
                hasNextPage: result.hasNextPage,
                hasPrevPage: result.hasPrevPage,
                nextPage: result.nextPage,
                prevPage: result.prevPage,
                limit: result.limit
            },
            stats: {
                total: stats[0],
                today: stats[1],
                upcoming: stats[2],
                past: stats[3],
                booked: stats[4],
                completed: stats[5],
                cancelled: stats[6],
                noShow: stats[7],
                pastBooked: stats[7], 
                totalRevenue: totalRevenue
            }
        });
    } catch (error) {
        console.error('Error fetching provider appointments:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};