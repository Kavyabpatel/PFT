const mongoose = require('mongoose');

const budgetSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        category: {
            type: String,
            required: [true, 'Please add a category'],
        },
        budgetAmount: {
            type: Number,
            required: [true, 'Please add a budget amount'],
        },
        month: {
            type: String, // format: YYYY-MM
            required: [true, 'Please add a month'],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Budget', budgetSchema);
