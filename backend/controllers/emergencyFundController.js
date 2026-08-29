const EmergencyFund = require('../models/EmergencyFund');

// @desc    Get emergency fund details
// @route   GET /api/emergency-fund
// @access  Private
const getEmergencyFund = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        let fund = await EmergencyFund.findOne({ userId: req.user.id });
        
        if (!fund) {
            fund = await EmergencyFund.create({
                userId: req.user.id,
                targetAmount: 0,
                savedAmount: 0
            });
        }
        
        res.status(200).json(fund);
    } catch (error) {
        console.error('Error in getEmergencyFund:', error.message);
        res.status(500).json({ message: 'Server Error: Failed to fetch emergency fund info' });
    }
};

// @desc    Update emergency fund
// @route   PUT /api/emergency-fund
// @access  Private
const updateEmergencyFund = async (req, res) => {
    const { targetAmount, savedAmount } = req.body;

    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        // Basic validation for numbers
        if (targetAmount !== undefined && targetAmount < 0) {
            return res.status(400).json({ message: 'Target amount cannot be negative' });
        }
        if (savedAmount !== undefined && savedAmount < 0) {
            return res.status(400).json({ message: 'Saved amount cannot be negative' });
        }

        let fund = await EmergencyFund.findOne({ userId: req.user.id });

        if (!fund) {
            fund = await EmergencyFund.create({
                userId: req.user.id,
                targetAmount: targetAmount !== undefined ? targetAmount : 0,
                savedAmount: savedAmount !== undefined ? savedAmount : 0
            });
        } else {
            if (targetAmount !== undefined) {
                fund.targetAmount = Number(targetAmount);
            }
            if (savedAmount !== undefined) {
                fund.savedAmount = Number(savedAmount);
            }
            await fund.save();
        }

        res.status(200).json(fund);
    } catch (error) {
        console.error('Error in updateEmergencyFund:', error.message);
        res.status(500).json({ message: 'Server Error: Failed to update emergency fund' });
    }
};

module.exports = {
    getEmergencyFund,
    updateEmergencyFund
};
