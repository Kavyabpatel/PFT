import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

const currencies = {
    INR: { symbol: '₹', factor: 1 },
    USD: { symbol: '$', factor: 0.012 },
    EUR: { symbol: '€', factor: 0.011 },
    GBP: { symbol: '£', factor: 0.0095 },
    AUD: { symbol: 'A$', factor: 0.018 }
};

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState(() => {
        try {
            return localStorage.getItem('currency') || 'INR';
        } catch {
            return 'INR';
        }
    });

    useEffect(() => {
        localStorage.setItem('currency', currency);
    }, [currency]);

    const formatAmount = (amount) => {
        // Safe fallback in case of invalid data types
        const safeAmount = Number(amount) || 0;
        
        // Ensure graceful fallback if a stale currency is in localStorage
        const currencyData = currencies[currency] || currencies['INR'];
        const { symbol, factor } = currencyData;
        
        return `${symbol}${(safeAmount * factor).toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        })}`;
    };

    return (
        <CurrencyContext.Provider value={{ 
            currency, 
            setCurrency, 
            formatAmount, 
            symbol: (currencies[currency] || currencies['INR']).symbol 
        }}>
            {children}
        </CurrencyContext.Provider>
    );
};
