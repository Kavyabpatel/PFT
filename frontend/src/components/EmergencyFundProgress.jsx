import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const EmergencyFundProgress = ({ target, saved }) => {
    const { formatAmount } = useCurrency();
    const progress = Math.min(100, Math.round((saved / target) * 100) || 0);
    const remaining = Math.max(0, target - saved);

    return (
        <div className="glass card glass-shadow" style={{ flex: '1.5', minWidth: '300px' }}>
            <div className="flex-between" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <ShieldCheck size={20} />
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>Emergency Fund</h3>
                </div>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>{progress}%</span>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <div className="flex-between" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    <span>Target: {formatAmount(target)}</span>
                    <span>Saved: {formatAmount(saved)}</span>
                </div>
                <div style={{ width: '100%', height: '12px', background: 'rgba(0,0,0,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ 
                        width: `${progress}%`, 
                        height: '100%', 
                        background: 'linear-gradient(90deg, #10b981, #34d399)', 
                        borderRadius: '6px',
                        transition: 'width 1s ease-out'
                    }}></div>
                </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {remaining > 0 
                    ? `You need ${formatAmount(remaining)} more to reach your goal.`
                    : "Excellent! You've reached your emergency fund goal!"}
            </p>
        </div>
    );
};

export default EmergencyFundProgress;
