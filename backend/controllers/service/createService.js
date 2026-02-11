const Service = require('../../models/Service');

//! Create Service
exports.createService = async (req, res) => {
    try {
        const { name, description, duration, price } = req.body;

        const service = await Service.create({
            provider: req.user._id,
            name,
            description,
            duration,
            price
        });

        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};







