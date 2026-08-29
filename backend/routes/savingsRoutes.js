const express = require('express');
const router = express.Router();
const { addSavingsGoal, getSavingsGoals, updateSavedAmount } = require('../controllers/savingsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', addSavingsGoal);
router.get('/', getSavingsGoals);
router.put('/:id', updateSavedAmount);

module.exports = router;
