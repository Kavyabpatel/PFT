const express = require('express');
const router = express.Router();
const { getEmergencyFund, updateEmergencyFund } = require('../controllers/emergencyFundController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getEmergencyFund).put(protect, updateEmergencyFund);

module.exports = router;
