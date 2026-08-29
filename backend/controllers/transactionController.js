const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user._id }).sort({ date: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add new transaction
// @route   POST /api/transactions
// @access  Private
const addTransaction = async (req, res) => {
    const { title, amount, category, type, date, notes } = req.body;

    try {
        const transaction = await Transaction.create({
            userId: req.user._id,
            title,
            amount,
            category,
            type,
            date,
            notes,
        });

        // Smart Budget Alert Logic
        if (type === 'expense') {
            const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
            const budget = await Budget.findOne({ userId: req.user._id, category, month: currentMonth });

            if (budget) {
                // Calculate total spent in this category this month
                const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
                const results = await Transaction.aggregate([
                    {
                        $match: {
                            userId: req.user._id,
                            category,
                            type: 'expense',
                            date: { $gte: startOfMonth }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalSpent: { $sum: '$amount' }
                        }
                    }
                ]);

                const totalSpent = results.length > 0 ? results[0].totalSpent : 0;
                const percentage = (totalSpent / budget.budgetAmount) * 100;

                if (percentage >= 100) {
                    await createNotification(req.user._id, `CRITICAL: You have exceeded your ${category} budget! (Spent: ₹${totalSpent} / ₹${budget.budgetAmount})`, 'error');
                } else if (percentage >= 80) {
                    await createNotification(req.user._id, `ALERt: You have reached 80% of your ${category} budget. (Spent: ₹${totalSpent} / ₹${budget.budgetAmount})`, 'warning');
                }
            }
            
            // Notify on expense added
            await createNotification(req.user._id, `New expense added: ${title} (₹${amount})`, 'info');
        } else {
            // Notify on income added
            await createNotification(req.user._id, `Income added: ${title} (₹${amount})`, 'success');
        }

        res.status(201).json(transaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Check user ownership
        if (transaction.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedTransaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedTransaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Check user ownership
        if (transaction.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await transaction.deleteOne();
        res.json({ message: 'Transaction removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
};
