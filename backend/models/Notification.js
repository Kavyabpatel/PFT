const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
            index: true
        },
        message: {
            type: String,
            required: [true, 'Notification message is required'],
            trim: true,
            maxlength: [500, 'Notification message cannot exceed 500 characters']
        },
        type: {
            type: String,
            enum: {
                values: ['info', 'success', 'warning', 'error'],
                message: '{VALUE} is not a valid notification type'
            },
            default: 'info',
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Optimize repeated queries (e.g. fetching unread notifications or ordering by latest)
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 }); // Descending index for fast latest feed

module.exports = mongoose.model('Notification', notificationSchema);
