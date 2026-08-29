const mongoose = require('mongoose');

const splitSchema = mongoose.Schema(
    {
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
            required: true,
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
            trim: true,
        },
        amount: {
            type: Number,
            required: [true, 'Please add an amount'],
        },
        paidBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        participants: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                share: {
                    type: Number,
                    required: true,
                },
            },
        ],
        date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Split', splitSchema);
