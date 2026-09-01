const express = require('express');
const router = express.Router();
const {
    getTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    importCSVTransactions
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getTransactions)
    .post(protect, addTransaction);

router.post('/import-csv', protect, importCSVTransactions);

router.route('/:id')
    .put(protect, updateTransaction)
    .delete(protect, deleteTransaction);

module.exports = router;
