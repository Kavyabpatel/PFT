const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, clearNotifications } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.delete('/', clearNotifications);

module.exports = router;
