const mongoose = require('mongoose');

const recurringTransactionSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        title: {
            type: String,
            required: [true, 'Please add a title'],
            trim: true,
            maxlength: [100, 'Title cannot be more than 100 characters']
        },
        amount: {
            type: Number,
            required: [true, 'Please add an amount'],
            min: [0.01, 'Amount must be a positive number']
        },
        category: {
            type: String,
            required: [true, 'Please add a category'],
            trim: true
        },
        type: {
            type: String,
            required: [true, 'Please add a type (income/expense)'],
            enum: {
                values: ['income', 'expense'],
                message: '{VALUE} is not a supported type'
            }
        },
        frequency: {
            type: String,
            required: [true, 'Please add a frequency'],
            enum: {
                values: ['weekly', 'monthly', 'yearly'],
                message: '{VALUE} is not a supported frequency'
            }
        },
        lastGenerated: {
            type: Date,
            default: Date.now
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
    }
);

// Optional: Index for frequent queries to improve performance
recurringTransactionSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('RecurringTransaction', recurringTransactionSchema);
