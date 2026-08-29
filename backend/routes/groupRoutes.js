const express = require('express');
const router = express.Router();
const { createGroup, getGroups, addSplitExpense, getBalances } = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createGroup);
router.get('/', getGroups);
router.post('/:id/splits', addSplitExpense);
router.get('/:id/balances', getBalances);

module.exports = router;
