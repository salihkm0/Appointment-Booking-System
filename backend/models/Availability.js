const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dayOfWeek: {
        type: Number,
        required: true,
        min: -1, 
        max: 6
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
    isBlocked: {
        type: Boolean,
        default: false
    },
    blockedReason: String,
    blockedDate: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

//! Add validation to check dayOfWeek constraints
availabilitySchema.pre('validate', function(next) {
    if (this.dayOfWeek === -1) {
        if (!this.blockedDate) {
            this.invalidate('blockedDate', 'blockedDate is required when dayOfWeek is -1');
        }
        this.isBlocked = true;
    } else {
        if (this.dayOfWeek < 0 || this.dayOfWeek > 6) {
            this.invalidate('dayOfWeek', 'dayOfWeek must be between 0 and 6 for regular availability');
        }
    }
    next();
});

module.exports = mongoose.model('Availability', availabilitySchema);