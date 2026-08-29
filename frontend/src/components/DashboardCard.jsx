import React from 'react';

const DashboardCard = ({ title, amount, icon, color, type }) => {
    return (
        <div className="glass card glass-shadow stat-card" style={{ flex: 1, minWidth: '240px', '--card-color': color }}>
            <div className="flex-between" style={{ marginBottom: '20px' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `${color}20`,
                    color: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {icon}
                </div>
                <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: type === 'expense' ? 'var(--expense)' : 'var(--income)',
                    background: type === 'expense' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    padding: '4px 8px',
                    borderRadius: '6px'
                }}>
                    {type === 'expense' ? '-12.5%' : '+18.2%'}
                </span>
            </div>

            <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '4px' }}>{title}</p>
                <h2 style={{ fontSize: '28px', fontWeight: '800' }}>
                    ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                    Compared to last month
                </p>
            </div>
        </div>
    );
};

export default DashboardCard;
