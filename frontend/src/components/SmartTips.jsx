import React from 'react';
import { Lightbulb } from 'lucide-react';

const SmartTips = ({ transactions, savingsRate }) => {
    const getTips = () => {
        const tips = [];
        if (savingsRate < 20) {
            tips.push("Try saving at least 20% of your income by reducing non-essential expenses.");
        } else {
            tips.push("Great job! You are maintaining a healthy savings rate.");
        }

        const shoppingExp = transactions
            .filter(t => t.category.toLowerCase().includes('shop'))
            .reduce((acc, t) => acc + t.amount, 0);

        if (shoppingExp > 5000) {
            tips.push("Your shopping expenses are quite high this month. Consider setting a stricter budget.");
        }

        if (transactions.length > 0) {
            tips.push("Review your recurring subscriptions to see if there's anything you can cancel.");
        }

        return tips;
    };

    const tips = getTips();

    return (
        <div className="glass card glass-shadow" style={{ flex: '1', minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Lightbulb size={20} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>Smart Financial Tips</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tips.map((tip, index) => (
                    <div key={index} style={{ 
                        fontSize: '13px', 
                        color: 'var(--text-muted)',
                        paddingLeft: '12px',
                        borderLeft: '2px solid #f59e0b'
                    }}>
                        {tip}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SmartTips;
