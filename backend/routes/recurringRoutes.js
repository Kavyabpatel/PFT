const express = require('express');
const router = express.Router();
const {
    getRecurringTransactions,
    createRecurringTransaction,
    deleteRecurringTransaction,
    processDueTransactions
} = require('../controllers/recurringController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getRecurringTransactions)
    .post(protect, createRecurringTransaction);

router.post('/process', protect, processDueTransactions);

router.route('/:id')
    .delete(protect, deleteRecurringTransaction);

module.exports = router;
