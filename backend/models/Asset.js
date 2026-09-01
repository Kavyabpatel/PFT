const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        name: {
            type: String,
            required: [true, 'Please add an asset name or description'],
            trim: true
        },
        type: {
            type: String,
            required: [true, 'Please select asset type'],
            enum: ['stocks', 'mutual_funds', 'crypto', 'gold', 'fixed_deposit', 'real_estate', 'cash_savings', 'loan_liability'],
            default: 'stocks'
        },
        currentValue: {
            type: Number,
            required: [true, 'Please add the current value'],
            default: 0
        },
        initialInvestment: {
            type: Number,
            default: 0
        },
        institution: {
            type: String,
            default: ''
        },
        notes: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Asset', assetSchema);
