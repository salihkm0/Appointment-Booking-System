const Service = require('../../models/Service');

//! Delete Service (Soft Delete)
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findOne({
            _id: req.params.id,
            provider: req.user._id
        });

        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        service.isActive = false;
        await service.save();

        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};