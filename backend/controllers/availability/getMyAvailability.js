const Availability = require('../../models/Availability');

//! Get Provider Availability
exports.getMyAvailability = async (req, res) => {
    try {
        const availability = await Availability.find({
            provider: req.user._id,
            dayOfWeek: { $gte: 0, $lte: 6 }
        }).sort('dayOfWeek');

        const blockedDates = await Availability.find({
            provider: req.user._id,
            dayOfWeek: -1,
            isBlocked: true
        });

        res.json({
            weekly: availability,
            blockedDates: blockedDates.map(bd => ({
                date: bd.blockedDate,
                reason: bd.blockedReason
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};