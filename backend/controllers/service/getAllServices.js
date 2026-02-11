const Service = require('../../models/Service');

//! Get All Services (Public) with Pagination
exports.getAllServices = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search = '',
            sortBy = 'createdAt',
            sortOrder = 'desc',
            minPrice,
            maxPrice,
            minDuration,
            maxDuration 
        } = req.query;

        const query = { isActive: true };
        
        //-------------- Search functionality --------------
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        //--------------- Price filtering ------------------
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        //-------------- Duration filtering ----------------
        if (minDuration || maxDuration) {
            query.duration = {};
            if (minDuration) query.duration.$gte = Number(minDuration);
            if (maxDuration) query.duration.$lte = Number(maxDuration);
        }

        //---------- Sorting -------------------
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort,
            populate: {
                path: 'provider',
                select: 'name email phone'
            },
            select: '-isActive'
        };

        const result = await Service.paginate(query, options);

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
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};



