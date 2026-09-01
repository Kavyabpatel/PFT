import React, { useState } from 'react';
import api from '../services/api';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const CSVImportModal = ({ isOpen, onClose, onSuccess }) => {
    const [csvText, setCsvText] = useState('');
    const [parsedItems, setParsedItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const parseCSVData = (text) => {
        try {
            const lines = text.trim().split('\n');
            if (lines.length < 2) {
                setError('CSV must contain at least a header row and 1 data row.');
                return;
            }

            const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
            const dateIdx = header.findIndex(h => h.includes('date'));
            const titleIdx = header.findIndex(h => h.includes('title') || h.includes('desc') || h.includes('particular') || h.includes('narrat') || h.includes('payee'));
            const amountIdx = header.findIndex(h => h.includes('amount') || h.includes('sum') || h.includes('val') || h.includes('debit') || h.includes('credit'));
            const typeIdx = header.findIndex(h => h.includes('type') || h.includes('trans'));
            const categoryIdx = header.findIndex(h => h.includes('cat'));

            const items = [];
            for (let i = 1; i < lines.length; i++) {
                const row = lines[i].split(',').map(cell => cell.trim().replace(/^["']|["']$/g, ''));
                if (row.length < 2 || !row.some(c => c)) continue;

                const rawDate = dateIdx !== -1 ? row[dateIdx] : new Date().toISOString().split('T')[0];
                const rawTitle = titleIdx !== -1 ? row[titleIdx] : `Imported Txn #${i}`;
                const rawAmount = amountIdx !== -1 ? parseFloat(row[amountIdx].replace(/[^0-9.-]+/g, '')) : 0;
                const rawType = typeIdx !== -1 ? row[typeIdx].toLowerCase() : (rawAmount < 0 ? 'expense' : 'income');
                const rawCategory = categoryIdx !== -1 ? row[categoryIdx] : 'Others';

                if (!isNaN(rawAmount) && rawAmount !== 0) {
                    items.push({
                        title: rawTitle || 'Bank Transaction',
                        amount: Math.abs(rawAmount),
                        category: rawCategory || 'Others',
                        type: rawType.includes('inc') || rawType.includes('cr') ? 'income' : 'expense',
                        date: rawDate,
                        notes: 'Imported via CSV file'
                    });
                }
            }

            if (items.length === 0) {
                setError('Could not extract any valid transaction rows. Please ensure your CSV has Date, Title, and Amount columns.');
                setParsedItems([]);
            } else {
                setError('');
                setParsedItems(items);
            }
        } catch (e) {
            setError('Failed to parse CSV string. Please check formatting.');
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const content = evt.target.result;
            setCsvText(content);
            parseCSVData(content);
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        if (parsedItems.length === 0) return;
        setLoading(true);
        try {
            await api.post('/transactions/import-csv', { items: parsedItems });
            onSuccess(parsedItems.length);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to import transactions.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileSpreadsheet color="var(--primary)" size={24} />
                        <h2>Bank CSV Importer</h2>
                    </div>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
                        Select or drop your bank statement CSV file, or paste raw CSV text below to auto-import transactions.
                    </p>

                    <div style={{ border: '2px dashed var(--glass-border)', padding: '24px', borderRadius: '16px', textAlign: 'center', background: 'var(--glass-bg)' }}>
                        <Upload size={32} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
                        <p style={{ margin: 0, fontWeight: '600', color: 'var(--text-main)' }}>Click to upload bank CSV file</p>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            style={{ marginTop: '12px', cursor: 'pointer', fontSize: '13px' }}
                        />
                    </div>

                    <div>
                        <label className="modal-label">Or Paste CSV Text directly:</label>
                        <textarea
                            rows={4}
                            className="modal-input-field"
                            placeholder="Date,Title,Amount,Type,Category&#10;2026-08-25,Salary Credit,50000,income,Salary&#10;2026-08-26,Grocery Supermarket,2500,expense,Food"
                            value={csvText}
                            onChange={(e) => {
                                setCsvText(e.target.value);
                                parseCSVData(e.target.value);
                            }}
                            style={{ fontFamily: 'monospace', fontSize: '12px' }}
                        />
                    </div>

                    {error && (
                        <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    {parsedItems.length > 0 && (
                        <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckCircle2 size={18} /> Ready to import {parsedItems.length} valid transactions
                            </span>
                        </div>
                    )}

                    <button
                        onClick={handleImport}
                        disabled={parsedItems.length === 0 || loading}
                        className="save-transaction-btn"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: parsedItems.length === 0 ? 0.5 : 1 }}
                    >
                        {loading ? <Loader2 size={18} className="spin" /> : null}
                        Import {parsedItems.length > 0 ? `${parsedItems.length} Transactions` : 'CSV Data'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CSVImportModal;
