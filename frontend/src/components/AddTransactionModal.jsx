import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';

const AddTransactionModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: '',
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    const categories = ['Food', 'Rent', 'Salary', 'Shopping', 'Entertainment', 'Transport', 'Healthcare', 'Others'];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/transactions', formData);
            if (onSuccess) onSuccess();
            onClose();
            // Reset form
            setFormData({
                title: '',
                amount: '',
                category: '',
                type: 'expense',
                date: new Date().toISOString().split('T')[0],
                notes: ''
            });
        } catch (error) {
            console.error('Error adding transaction', error);
            alert('Failed to save transaction. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add Transaction</h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="modal-label">Type</label>
                        <div className="type-selector-wrapper">
                            <button
                                type="button"
                                className={`type-tab expense ${formData.type === 'expense' ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, type: 'expense' })}
                            >
                                Expense
                            </button>
                            <button
                                type="button"
                                className={`type-tab income ${formData.type === 'income' ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, type: 'income' })}
                            >
                                Income
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="modal-label">Title</label>
                        <input
                            type="text"
                            name="title"
                            className="modal-input-field"
                            placeholder="Grocery shopping"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="modal-row">
                        <div className="modal-col">
                            <div className="form-group">
                                <label className="modal-label">Amount</label>
                                <input
                                    type="number"
                                    name="amount"
                                    className="modal-input-field"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="modal-col">
                            <div className="form-group">
                                <label className="modal-label">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    className="modal-input-field"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="modal-label">Category</label>
                        <select
                            name="category"
                            className="modal-input-field"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>Select category</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="modal-label">Description (Optional)</label>
                        <textarea
                            name="notes"
                            className="modal-input-field"
                            placeholder="Add some details..."
                            style={{ height: '80px', resize: 'none' }}
                            value={formData.notes}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <button type="submit" className="save-transaction-btn" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Transaction'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddTransactionModal;
