const Notification = require('../models/Notification');

/**
 * Helper to create a notification and handle potential errors
 * @param {string} userId - ID of the user to notify
 * @param {string} message - Notification message
 * @param {string} type - Notification type (info, success, warning, error)
 */
const createNotification = async (userId, message, type = 'info') => {
    try {
        await Notification.create({
            userId,
            message,
            type
        });
    } catch (error) {
        console.error('Error creating notification:', error.message);
    }
};

module.exports = { createNotification };
