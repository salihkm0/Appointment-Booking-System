const Availability = require('../../models/Availability');

//! Block Date
exports.blockDate = async (req, res) => {
    try {
        const { date, reason } = req.body;

        const blockedDate = await Availability.create({
            provider: req.user._id,
            dayOfWeek: -1,
            startTime: '00:00',
            endTime: '23:59',
            isBlocked: true,
            blockedReason: reason,
            blockedDate: date
        });

        res.json(blockedDate);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};