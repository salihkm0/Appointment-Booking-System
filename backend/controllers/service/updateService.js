const Service = require('../../models/Service');

//! Update Service
exports.updateService = async (req, res) => {
    try {
        const service = await Service.findOne({
            _id: req.params.id,
            provider: req.user._id
        });

        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        Object.assign(service, req.body);
        await service.save();

        res.json(service);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};