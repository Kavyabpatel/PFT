const RecurringTransaction = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');

// @desc    Get all recurring transactions
// @route   GET /api/recurring
// @access  Private
const getRecurringTransactions = async (req, res) => {
    try {
        const recurring = await RecurringTransaction.find({ userId: req.user.id });
        res.status(200).json(recurring);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create recurring transaction
// @route   POST /api/recurring
// @access  Private
const createRecurringTransaction = async (req, res) => {
    const { title, amount, category, type, frequency } = req.body;

    if (!title || !amount || !category || !type || !frequency) {
        res.status(400).json({ message: 'Please add all fields' });
        return;
    }

    try {
        const recurring = await RecurringTransaction.create({
            userId: req.user.id,
            title,
            amount,
            category,
            type,
            frequency,
            lastGenerated: new Date()
        });

        // Also create the initial transaction
        await Transaction.create({
            userId: req.user.id,
            title,
            amount,
            category,
            type,
            date: new Date(),
            notes: 'Initial recurring transaction'
        });

        res.status(201).json(recurring);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete recurring transaction
// @route   DELETE /api/recurring/:id
// @access  Private
const deleteRecurringTransaction = async (req, res) => {
    try {
        const recurring = await RecurringTransaction.findById(req.params.id);

        if (!recurring) {
            res.status(404).json({ message: 'Recurring transaction not found' });
            return;
        }

        if (recurring.userId.toString() !== req.user.id) {
            res.status(401).json({ message: 'User not authorized' });
            return;
        }

        await recurring.deleteOne();
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Process due recurring transactions
// @route   POST /api/recurring/process
// @access  Private
const processDueTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const recurringTransactions = await RecurringTransaction.find({ userId, isActive: true });
        const now = new Date();
        let count = 0;

        for (const rt of recurringTransactions) {
            const lastGen = new Date(rt.lastGenerated);
            let nextDue = new Date(lastGen);

            if (rt.frequency === 'weekly') {
                nextDue.setDate(lastGen.getDate() + 7);
            } else if (rt.frequency === 'monthly') {
                nextDue.setMonth(lastGen.getMonth() + 1);
            }

            if (now >= nextDue) {
                // Generate transaction
                await Transaction.create({
                    userId: rt.userId,
                    title: rt.title,
                    amount: rt.amount,
                    category: rt.category,
                    type: rt.type,
                    date: now,
                    notes: `Automatically generated from recurring: ${rt.title}`
                });

                // Update lastGenerated
                rt.lastGenerated = now;
                await rt.save();
                count++;
            }
        }

        res.status(200).json({ message: `Processed ${count} transactions.`, count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getRecurringTransactions,
    createRecurringTransaction,
    deleteRecurringTransaction,
    processDueTransactions
};
