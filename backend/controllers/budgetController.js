const Budget = require('../models/Budget');

// @desc    Get all budgets for a user
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({ userId: req.user.id });
        res.status(200).json(budgets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create or update a budget
// @route   POST /api/budgets
// @access  Private
const setBudget = async (req, res) => {
    const { category, budgetAmount, month } = req.body;

    if (!category || !budgetAmount || !month) {
        res.status(400).json({ message: 'Please add all fields' });
        return;
    }

    try {
        // Check if budget for this category and month already exists
        let budget = await Budget.findOne({
            userId: req.user.id,
            category,
            month
        });

        if (budget) {
            // Update existing budget
            budget.budgetAmount = budgetAmount;
            await budget.save();
            res.status(200).json(budget);
        } else {
            // Create new budget
            budget = await Budget.create({
                userId: req.user.id,
                category,
                budgetAmount,
                month
            });
            res.status(201).json(budget);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id);

        if (!budget) {
            res.status(404).json({ message: 'Budget not found' });
            return;
        }

        // Check for user
        if (budget.userId.toString() !== req.user.id) {
            res.status(401).json({ message: 'User not authorized' });
            return;
        }

        await budget.deleteOne();
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getBudgets,
    setBudget,
    deleteBudget,
};
