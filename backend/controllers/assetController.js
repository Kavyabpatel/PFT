const Asset = require('../models/Asset');

// @desc    Get all assets for logged-in user & Net Worth calculation
// @route   GET /api/assets
// @access  Private
const getAssets = async (req, res) => {
    try {
        const assets = await Asset.find({ userId: req.user._id }).sort({ createdAt: -1 });

        const totalAssets = assets
            .filter(a => a.type !== 'loan_liability')
            .reduce((acc, a) => acc + (Number(a.currentValue) || 0), 0);

        const totalLiabilities = assets
            .filter(a => a.type === 'loan_liability')
            .reduce((acc, a) => acc + (Number(a.currentValue) || 0), 0);

        const netWorth = totalAssets - totalLiabilities;

        res.json({
            assets,
            summary: {
                totalAssets,
                totalLiabilities,
                netWorth
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add new asset or liability
// @route   POST /api/assets
// @access  Private
const addAsset = async (req, res) => {
    const { name, type, currentValue, initialInvestment, institution, notes } = req.body;

    try {
        const asset = await Asset.create({
            userId: req.user._id,
            name,
            type,
            currentValue: Number(currentValue) || 0,
            initialInvestment: Number(initialInvestment) || Number(currentValue) || 0,
            institution: institution || '',
            notes: notes || ''
        });

        res.status(201).json(asset);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update asset or liability
// @route   PUT /api/assets/:id
// @access  Private
const updateAsset = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);

        if (!asset) {
            return res.status(404).json({ message: 'Asset not found' });
        }

        if (asset.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedAsset = await Asset.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedAsset);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete asset or liability
// @route   DELETE /api/assets/:id
// @access  Private
const deleteAsset = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);

        if (!asset) {
            return res.status(404).json({ message: 'Asset not found' });
        }

        if (asset.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await asset.deleteOne();
        res.json({ message: 'Asset item removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAssets,
    addAsset,
    updateAsset,
    deleteAsset
};
