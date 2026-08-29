const Group = require('../models/Group');
const Split = require('../models/Split');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
    try {
        const { name, members } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ message: 'Group name is required' });
        }

        if (!members || !Array.isArray(members)) {
            return res.status(400).json({ message: 'Members list must be an array' });
        }

        // Ensure creator is smoothly integrated into members set universally without duplicates
        const groupMembers = Array.from(new Set([...members, req.user._id.toString()]));
        
        const group = await Group.create({
            name: name.trim(),
            members: groupMembers,
            createdBy: req.user._id
        });

        res.status(201).json(group);
    } catch (error) {
        console.error('Create Group Error:', error);
        res.status(500).json({ message: 'Failed to create the group. Please try again.' });
    }
};

// @desc    Get user groups
// @route   GET /api/groups
// @access  Private
const getGroups = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'User not authorized.' });
        }

        const groups = await Group.find({ members: req.user._id }).populate('members', 'name email').sort({ createdAt: -1 });
        res.status(200).json(groups);
    } catch (error) {
        console.error('Get Groups Error:', error);
        res.status(500).json({ message: 'Failed to retrieve groups.' });
    }
};

// @desc    Add a split expense
// @route   POST /api/groups/:id/splits
// @access  Private
const addSplitExpense = async (req, res) => {
    try {
        const { description, amount, participants } = req.body;
        const groupId = req.params.id;

        // Validations
        if (!description || description.trim().length === 0) return res.status(400).json({ message: 'Description is necessary for clarity' });
        if (!amount || amount <= 0) return res.status(400).json({ message: 'Amount must be greater than zero' });
        if (!participants || !Array.isArray(participants) || participants.length === 0) {
            return res.status(400).json({ message: 'An expense must involve participants to split.' });
        }

        // Checking if total share roughly matches amount to prevent exploits
        const totalShare = participants.reduce((acc, p) => acc + (Number(p.share) || 0), 0);
        if (Math.abs(totalShare - amount) > 0.1) {
            return res.status(400).json({ message: 'The sum of participants shares must perfectly match the total amount.' });
        }

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: 'Target group not found.' });

        const split = await Split.create({
            groupId,
            description: description.trim(),
            amount: Number(amount),
            paidBy: req.user._id,
            participants
        });

        // Notify participants securely
        for (const p of participants) {
            if (p.user.toString() !== req.user._id.toString()) {
                // Ignore failure if one notification fails so we don't break the whole request cycle
                try {
                    await createNotification(p.user, `${req.user.name} added a shared expense: ${description} (₹${Number(p.share).toFixed(2)})`, 'info');
                } catch (notifErr) {
                    console.warn(`Failed to dispatch notification to user ${p.user}`, notifErr);
                }
            }
        }

        res.status(201).json(split);
    } catch (error) {
        console.error('Add Split Expense Error:', error);
        res.status(500).json({ message: 'Internal servers threw an error while splitting the expense.' });
    }
};

// @desc    Get balances for a group
// @route   GET /api/groups/:id/balances
// @access  Private
const getBalances = async (req, res) => {
    try {
        const groupId = req.params.id;
        const splits = await Split.find({ groupId });

        let balances = {}; // { userId: netAmount }

        splits.forEach(split => {
            // Amount paid by user represents a credit towards them
            balances[split.paidBy] = (balances[split.paidBy] || 0) + split.amount;
            
            // Subtract shares logic translates liability natively
            split.participants.forEach(p => {
                balances[p.user] = (balances[p.user] || 0) - p.share;
            });
        });

        // Clean floats to prevent weird JS precision artifacts
        for (let user in balances) {
            balances[user] = Number(balances[user].toFixed(2));
        }

        res.status(200).json(balances);
    } catch (error) {
        console.error('Get Balances Error:', error);
        res.status(500).json({ message: 'Could not compute balances at this time.' });
    }
};

module.exports = {
    createGroup,
    getGroups,
    addSplitExpense,
    getBalances
};
