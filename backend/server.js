const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { initCronJobs } = require('./utils/cronJobs');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to database
connectDB();

// Initialize Cron Jobs
initCronJobs();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Health Check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'API is running successfully', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/emergency-fund', require('./routes/emergencyFundRoutes'));
app.use('/api/recurring', require('./routes/recurringRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/savings', require('./routes/savingsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));
app.use('/api/assets', require('./routes/assetRoutes'));

// 404 Handler for Unmatched API Endpoints
app.use('/api', (req, res) => {
    res.status(404).json({ success: false, message: `API endpoint ${req.originalUrl} not found` });
});

// Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
