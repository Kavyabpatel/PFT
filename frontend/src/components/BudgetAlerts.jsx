import React from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const BudgetAlerts = ({ alerts }) => {
    const { formatAmount } = useCurrency();
    
    if (!alerts || alerts.length === 0) return null;

    return (
        <div className="glass card glass-shadow" style={{ 
            marginBottom: '24px', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            background: 'linear-gradient(to right, rgba(239, 68, 68, 0.02), rgba(239, 68, 68, 0.05))',
            animation: 'fadeIn 0.4s ease'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertCircle color="#ef4444" size={24} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ef4444' }}>Critical Budget Alerts</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {alerts.map((alert, index) => (
                    <div key={index} style={{ 
                        padding: '14px 16px', 
                        borderRadius: '12px', 
                        background: 'var(--bg-dark)',
                        borderLeft: '4px solid #ef4444',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                        fontSize: '15px',
                        color: 'var(--text-main)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        animation: `slideUp 0.3s ease ${index * 0.1}s backwards`
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <AlertTriangle size={16} color="#f59e0b" />
                            <span>Warning: <strong>{alert.category}</strong> budget exceeded limit.</span>
                        </div>
                        <span style={{ fontWeight: '800', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 10px', borderRadius: '8px' }}>
                            -{formatAmount(alert.overAmount)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BudgetAlerts;
