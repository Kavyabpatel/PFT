const SavingsGoal = require('../models/SavingsGoal');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Add a new savings goal
// @route   POST /api/savings
// @access  Private
const addSavingsGoal = async (req, res) => {
    try {
        const { goalName, targetAmount, category } = req.body;
        const goal = await SavingsGoal.create({
            userId: req.user._id,
            goalName,
            targetAmount,
            category
        });
        res.status(201).json(goal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user savings goals
// @route   GET /api/savings
// @access  Private
const getSavingsGoals = async (req, res) => {
    try {
        const goals = await SavingsGoal.find({ userId: req.user._id });
        res.json(goals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update saved amount
// @route   PUT /api/savings/:id
// @access  Private
const updateSavedAmount = async (req, res) => {
    try {
        const { amount } = req.body; // Amount to ADD
        const goal = await SavingsGoal.findById(req.params.id);

        if (!goal) return res.status(404).json({ message: 'Goal not found' });
        if (goal.userId.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Unauthorized' });

        const previousAmount = goal.savedAmount;
        goal.savedAmount += Number(amount);

        const progressPercent = (goal.savedAmount / goal.targetAmount) * 100;
        const oldPercent = (previousAmount / goal.targetAmount) * 100;

        // Check milestones
        if (progressPercent >= 100 && oldPercent < 100) {
            goal.isCompleted = true;
            createNotification(req.user._id, `Congratulations! You've reached your goal: ${goal.goalName}!`, 'success');
        } else if (progressPercent >= 80 && oldPercent < 80) {
            createNotification(req.user._id, `Great job! You're 80% there for your goal: ${goal.goalName}`, 'success');
        } else if (progressPercent >= 50 && oldPercent < 50) {
            createNotification(req.user._id, `Halfway there! 50% reached for your goal: ${goal.goalName}`, 'info');
        }

        await goal.save();
        res.json(goal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addSavingsGoal,
    getSavingsGoals,
    updateSavedAmount
};
