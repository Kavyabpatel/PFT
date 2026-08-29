const cron = require('node-cron');
const RecurringTransaction = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');
const { createNotification } = require('./notificationHelper');

const initCronJobs = () => {
    // Fire every day meticulously precisely at midnight (00:00 server time)
    cron.schedule('0 0 * * *', async () => {
        console.log('🔄 [CRON] Initiating automated recurring transactions resolver...');
        
        try {
            const now = new Date();
            const recurring = await RecurringTransaction.find({ isActive: true });
            let processedCount = 0;

            for (const item of recurring) {
                let shouldGenerate = false;
                const lastGen = new Date(item.lastGenerated);
                
                // Meticulous mathematical offset calculations protecting against leap years and month variances
                const diffTime = Math.abs(now - lastGen);
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                const diffMonths = (now.getFullYear() - lastGen.getFullYear()) * 12 + (now.getMonth() - lastGen.getMonth());
                const diffYears = now.getFullYear() - lastGen.getFullYear();

                if (item.frequency === 'weekly' && diffDays >= 7) shouldGenerate = true;
                // Pure month-based check rather than naive 30 days
                if (item.frequency === 'monthly' && diffMonths >= 1) shouldGenerate = true;
                // Pure year check rather than 365 days
                if (item.frequency === 'yearly' && diffYears >= 1) shouldGenerate = true;

                if (shouldGenerate) {
                    await Transaction.create({
                        userId: item.userId,
                        title: `[Auto] ${item.title}`,
                        amount: item.amount,
                        category: item.category,
                        type: item.type,
                        date: now,
                        notes: `Automatically parsed by the platform scheduler (${item.frequency})`
                    });

                    item.lastGenerated = now;
                    await item.save();
                    processedCount++;

                    // Send asynchronous contextual notification securely
                    try {
                        await createNotification(
                            item.userId, 
                            `Automatic execution logged: ${item.title} (Amount: ${item.amount.toFixed(2)})`, 
                            'success'
                        );
                    } catch (notifErr) {
                        console.warn(`[CRON] Notification failure for user ${item.userId}:`, notifErr.message);
                    }
                }
            }
            
            console.log(`✅ [CRON] Resolver finished. Total recurring ledgers processed today: ${processedCount}`);
            
        } catch (error) {
            console.error('🚨 [CRON] Fatal core execution error:', error.message);
        }
    });
};

module.exports = { initCronJobs };
