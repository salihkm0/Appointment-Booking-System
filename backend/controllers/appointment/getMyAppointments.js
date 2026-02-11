const Appointment = require('../../models/Appointment');

//! Get User Appointments with Pagination
exports.getMyAppointments = async (req, res) => {
    try {
        const { 
            status, 
            type, 
            page = 1, 
            limit = 10,
            sortBy = 'date',
            sortOrder = 'desc',
            startDate,
            endDate
        } = req.query;
        
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let query = { user: req.user._id };
        
        //-------------- Status filtering ----------------
        if (status) {
            query.status = status;
        }
        
        //-------------- Date type filtering (upcoming/past) ----------------
        if (type === 'upcoming') {
            query.date = { $gte: today };
            query.status = 'booked';
        } else if (type === 'past') {
            query.$or = [
                { date: { $lt: today } },
                { status: { $in: ['completed', 'cancelled'] } }
            ];
        }
        
        //--------------------- Date range filtering ----------------------
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
        
        //------------------------- Remove $or if we have date range filtering (can't mix) ------------------------
        if (query.date && query.date.$gte && query.date.$lte) {
            delete query.$or;
        }
        
        //----------------- Get total counts for stats ----------------
        const statsQuery = { user: req.user._id };
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

            Appointment.countDocuments({ ...statsQuery, status: 'booked' }),
            Appointment.countDocuments({ ...statsQuery, status: 'completed' }),
            Appointment.countDocuments({ ...statsQuery, status: 'cancelled' }),
        ]);
        
        //------------- Sorting ----------------
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
                    path: 'provider',
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
                noShow: stats[7]
            }
        });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

