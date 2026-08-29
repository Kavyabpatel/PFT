const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
    try {
        // Suppress Mongoose strictQuery warnings for cleaner exact seeds
        mongoose.set('strictQuery', false);
        
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🌱 MongoDB Connected for seeding sequence...');

        // 1. Seed Core Test User
        let user = await User.findOne({ email: 'kavya123@gmail.com' });
        if (user) {
            console.log('👤 Root user detected. Validating auth credentials...');
            user.password = 'password123';
            await user.save();
        } else {
            user = await User.create({
                name: 'Kavya',
                email: 'kavya123@gmail.com',
                password: 'password123',
            });
            console.log('✅ Core user successfully provisioned.');
        }

        // 2. Clear existing transactions for this user to start fresh
        await Transaction.deleteMany({ userId: user._id });
        console.log('🧹 Purged legacy transactions to inject fresh metrics.');

        // 3. Seed Transactions with logical temporal dates relative to *now* for perfect analytics charts
        const now = new Date();
        const transactions = [
            // Substantial Income
            { userId: user._id, title: 'Corporate Salary (Base)', amount: 6500.00, category: 'Salary', type: 'income', date: new Date(now.getFullYear(), now.getMonth(), 1) },
            { userId: user._id, title: 'Freelance Software Project', amount: 1400.00, category: 'Salary', type: 'income', date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) },
            { userId: user._id, title: 'Dividend Yields', amount: 350.00, category: 'Other', type: 'income', date: new Date(now.getFullYear(), now.getMonth() - 1, 15) },

            // Typical Expenses
            { userId: user._id, title: 'Premium Apartment Rent', amount: 1500.00, category: 'Rent', type: 'expense', date: new Date(now.getFullYear(), now.getMonth(), 2) },
            { userId: user._id, title: 'Whole Foods Market', amount: 280.50, category: 'Food', type: 'expense', date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) },
            { userId: user._id, title: 'Bistro Dining Out', amount: 110.00, category: 'Food', type: 'expense', date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
            { userId: user._id, title: 'Amazon Essentials & Tech', amount: 560.00, category: 'Shopping', type: 'expense', date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000) },
            { userId: user._id, title: 'Digital Streaming Subs', amount: 45.00, category: 'Entertainment', type: 'expense', date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) },
            { userId: user._id, title: 'Shell Fuel Top-up', amount: 75.00, category: 'Transport', type: 'expense', date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
            { userId: user._id, title: 'Healthcare Premium Plan', amount: 250.00, category: 'Healthcare', type: 'expense', date: new Date(now.getFullYear(), now.getMonth(), 15) },
            { userId: user._id, title: 'Fiber Gigabit Internet', amount: 85.00, category: 'Bills', type: 'expense', date: new Date(now.getFullYear(), now.getMonth(), 10) },
        ];

        await Transaction.insertMany(transactions);
        console.log('📈 Successfully injected robust analytical ledger dataset!');

        process.exit();
    } catch (error) {
        console.error(`🚨 Fatal Engine Error: ${error.message}`);
        process.exit(1);
    }
};

seedData();
