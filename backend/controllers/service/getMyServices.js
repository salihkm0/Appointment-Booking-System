const Service = require('../../models/Service');

//! Get Provider Services with Pagination
exports.getMyServices = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10,
            search = '',
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = { 
            provider: req.user._id, 
            isActive: true 
        };

        //-------------- Search functionality --------------
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        //---------- Sorting -------------------
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort
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