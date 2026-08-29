const mongoose = require('mongoose');

const emergencyFundSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        targetAmount: {
            type: Number,
            required: [true, 'Please add a target amount'],
            default: 0
        },
        savedAmount: {
            type: Number,
            required: [true, 'Please add a saved amount'],
            default: 0
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('EmergencyFund', emergencyFundSchema);
