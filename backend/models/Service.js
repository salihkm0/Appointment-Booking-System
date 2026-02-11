const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const serviceSchema = new mongoose.Schema({
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    duration: {
        type: Number,
        required: true,
        min: 15,
        max: 480
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

//! Add pagination plugin
serviceSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Service', serviceSchema);