const mongoose = require('mongoose');

const savingsGoalSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        goalName: {
            type: String,
            required: [true, 'Please add a goal name'],
            trim: true,
        },
        targetAmount: {
            type: Number,
            required: [true, 'Please add a target amount'],
        },
        savedAmount: {
            type: Number,
            default: 0,
        },
        category: {
            type: String,
            enum: ['Emergency', 'Health', 'Travel', 'Education', 'Gadgets', 'Home', 'Vehicle', 'Other'],
            default: 'Other',
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
