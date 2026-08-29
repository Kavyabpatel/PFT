import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Charts = ({ transactions = [] }) => {
    // Process data for Bar Chart (Monthly Income vs Expense)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
        last6Months.push(months[(currentMonthIndex - i + 12) % 12]);
    }

    const incomeData = new Array(6).fill(0);
    const expenseData = new Array(6).fill(0);

    transactions.forEach(t => {
        const date = new Date(t.date);
        const monthName = months[date.getMonth()];
        const index = last6Months.indexOf(monthName);
        if (index !== -1) {
            if (t.type === 'income') incomeData[index] += t.amount;
            else expenseData[index] += t.amount;
        }
    });

    const barData = {
        labels: last6Months,
        datasets: [
            {
                label: 'Income',
                data: incomeData,
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                borderRadius: 10,
                borderWidth: 0,
            },
            {
                label: 'Expense',
                data: expenseData,
                backgroundColor: 'rgba(239, 68, 68, 0.5)',
                borderRadius: 10,
                borderWidth: 0,
            },
        ],
    };

    // Process data for Line Chart (Daily Spending - Last 7 Days)
    const last7Days = [];
    const dailySpending = new Array(7).fill(0);
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7Days.push(d.toLocaleDateString(undefined, { weekday: 'short' }));

        const dateStr = d.toISOString().split('T')[0];
        transactions.forEach(t => {
            if (t.type === 'expense' && t.date.split('T')[0] === dateStr) {
                dailySpending[6 - i] += t.amount;
            }
        });
    }

    const lineData = {
        labels: last7Days,
        datasets: [
            {
                label: 'Daily Spending',
                data: dailySpending,
                borderColor: 'rgba(99, 102, 241, 0.8)',
                backgroundColor: 'rgba(99, 102, 241, 0.05)',
                fill: true,
                tension: 0.45,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#6366f1',
                borderWidth: 3,
            },
        ],
    };

    // Process data for Pie Chart (Category Breakdown)
    const categoryTotals = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const pieData = {
        labels: Object.keys(categoryTotals),
        datasets: [
            {
                data: Object.values(categoryTotals),
                backgroundColor: [
                    'rgba(99, 102, 241, 0.6)',
                    'rgba(236, 72, 153, 0.6)',
                    'rgba(245, 158, 11, 0.6)',
                    'rgba(16, 185, 129, 0.6)',
                    'rgba(139, 92, 246, 0.6)',
                    'rgba(251, 113, 133, 0.6)',
                    'rgba(45, 212, 191, 0.6)',
                ],
                borderWidth: 2,
                borderColor: '#fff',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    color: '#64748b',
                    font: { size: 10 }
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#64748b',
                    font: { size: 10 }
                },
            },
        },
    };

    return (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
            <div className="glass card glass-shadow" style={{ flex: 1, minWidth: '300px', height: '350px' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>Income vs Expense</h3>
                <div style={{ height: '260px' }}>
                    <Bar data={barData} options={options} />
                </div>
            </div>

            <div className="glass card glass-shadow" style={{ flex: 1, minWidth: '300px', height: '350px' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>Daily Spending</h3>
                <div style={{ height: '260px' }}>
                    <Line data={lineData} options={options} />
                </div>
            </div>

            <div className="glass card glass-shadow" style={{ flex: 1, minWidth: '300px', height: '350px' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>Category Breakdown</h3>
                <div style={{ height: '260px', display: 'flex', justifyContent: 'center' }}>
                    {Object.keys(categoryTotals).length > 0 ? (
                        <Pie data={pieData} options={{ ...options, scales: {} }} />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                            No expense data available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Charts;
