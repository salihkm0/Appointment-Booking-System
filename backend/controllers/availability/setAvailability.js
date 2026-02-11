const Availability = require('../../models/Availability');

//! Set Availability
exports.setAvailability = async (req, res) => {
    try {
        const { dayOfWeek, startTime, endTime } = req.body;

        //---------------- Check for existing availability for same day ----------------
        let availability = await Availability.findOne({
            provider: req.user._id,
            dayOfWeek
        });

        if (availability) {
            //--------------------- Update existing ----------------------
            availability.startTime = startTime;
            availability.endTime = endTime;
            availability.isBlocked = false;
            await availability.save();
        } else {
            //----------------- Create new --------------------
            availability = await Availability.create({
                provider: req.user._id,
                dayOfWeek,
                startTime,
                endTime
            });
        }

        res.json(availability);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};










