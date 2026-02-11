const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const appointmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/
    },
    endTime: {
        type: String,
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/
    },
    status: {
        type: String,
        enum: ['booked', 'completed', 'cancelled'],
        default: 'booked'
    },
    notes: String,
    cancelledAt: Date,
    cancelledBy: {
        type: String,
        enum: ['user', 'provider']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

appointmentSchema.index({ provider: 1, date: 1, startTime: 1 });
appointmentSchema.index({ user: 1, date: 1 });

//------------ Add pagination plugin ----------
appointmentSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Appointment', appointmentSchema);