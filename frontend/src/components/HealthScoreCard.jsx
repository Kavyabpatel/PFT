import React, { useEffect, useState } from 'react';
import { Activity, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';

const HealthScoreCard = ({ score }) => {
    // Local state to animate score bar purely visually on mount
    const [visualScore, setVisualScore] = useState(0);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setVisualScore(score || 0);
        }, 100);
        return () => clearTimeout(timeout);
    }, [score]);

    const getStatus = (s) => {
        if (s >= 80) return { text: 'Excellent', color: '#10b981', Icon: Zap };
        if (s >= 60) return { text: 'Good', color: '#6366f1', Icon: ShieldCheck };
        if (s >= 40) return { text: 'Average', color: '#f59e0b', Icon: Activity };
        return { text: 'Poor', color: '#ef4444', Icon: AlertTriangle };
    };

    const safeScore = score || 0;
    const { text, color, Icon } = getStatus(safeScore);

    return (
        <div className="glass card glass-shadow stat-card" style={{ flex: '1', minWidth: '240px', transition: 'transform 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div className="flex-between" style={{ marginBottom: '20px' }}>
                <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: `linear-gradient(135deg, ${color}20, ${color}10)`,
                    color: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 12px ${color}15`
                }}>
                    <Icon size={24} />
                </div>
                <span style={{ 
                    fontSize: '13px', 
                    fontWeight: '800', 
                    color: color,
                    background: `${color}15`,
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${color}30`,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>{text}</span>
            </div>
            
            <h3 style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '600' }}>Overall Financial Health</h3>
            
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-main)' }}>{safeScore}</span>
                <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: '500' }}>/ 100</span>
            </div>
            
            <div style={{ width: '100%', height: '8px', background: 'var(--glass-border)', borderRadius: '4px', marginTop: '16px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ 
                    width: `${visualScore}%`, 
                    height: '100%', 
                    background: `linear-gradient(90deg, ${color}aa, ${color})`, 
                    borderRadius: '4px',
                    transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: `0 0 10px ${color}80`
                }}></div>
            </div>
        </div>
    );
};

export default HealthScoreCard;
