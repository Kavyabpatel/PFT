import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Transactions from './pages/Transactions';
import AddTransaction from './pages/AddTransaction';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Summary from './pages/Summary';
import Analytics from './pages/Analytics';
import BudgetPlanner from './pages/BudgetPlanner';
import EmergencyFundTracker from './pages/EmergencyFundTracker';
import RecurringTransactions from './pages/RecurringTransactions';
import SplitExpenses from './pages/SplitExpenses';
import SavingsGoals from './pages/SavingsGoals';
import NetWorthTracker from './pages/NetWorthTracker';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div style={{ color: 'white', padding: '100px', textAlign: 'center' }}>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
            
            {/* Dashboard & Summary Routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/summary" element={<ProtectedRoute><Summary /></ProtectedRoute>} />
            
            {/* Core Feature Routes */}
            <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="/add-transaction" element={<ProtectedRoute><AddTransaction /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/net-worth" element={<ProtectedRoute><NetWorthTracker /></ProtectedRoute>} />
            <Route path="/networth" element={<ProtectedRoute><NetWorthTracker /></ProtectedRoute>} />
            <Route path="/budgets" element={<ProtectedRoute><BudgetPlanner /></ProtectedRoute>} />
            <Route path="/emergency-fund" element={<ProtectedRoute><EmergencyFundTracker /></ProtectedRoute>} />
            <Route path="/recurring" element={<ProtectedRoute><RecurringTransactions /></ProtectedRoute>} />
            <Route path="/split-expenses" element={<ProtectedRoute><SplitExpenses /></ProtectedRoute>} />
            <Route path="/savings" element={<ProtectedRoute><SavingsGoals /></ProtectedRoute>} />
            <Route path="/savings-goals" element={<ProtectedRoute><SavingsGoals /></ProtectedRoute>} />
            
            {/* Catch-all 404 Route */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;
