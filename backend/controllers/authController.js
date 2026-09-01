const User = require('../models/User');
const Transaction = require('../models/Transaction');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');
const { 
    sendEmail, 
    getWelcomeEmailTemplate, 
    getLoginEmailTemplate, 
    getOtpEmailTemplate,
    get2FALoginOtpEmailTemplate
} = require('../utils/sendEmail');

// @desc    Register new user & send account details email
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const cleanEmail = email ? email.trim().toLowerCase() : '';
        const userExists = await User.findOne({ email: cleanEmail });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email: cleanEmail,
            password,
        });

        if (user) {
            // Dispatch Registration & Credentials Email Notification
            sendEmail({
                to: user.email,
                name: user.name,
                subject: '🎉 Welcome to Personal Finance Tracker! Your Account Credentials',
                html: getWelcomeEmailTemplate({
                    name: user.name,
                    email: user.email,
                    password: password
                }),
                text: `Welcome to Personal Finance Tracker, ${user.name}! Your account email: ${user.email}, Password: ${password}`
            }).catch(err => console.error('Welcome email error:', err));

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & send 6-digit 2FA Login OTP verification email
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const cleanEmail = email ? email.trim().toLowerCase() : '';
        const user = await User.findOne({ email: cleanEmail });

        if (user && (await user.matchPassword(password))) {
            // Generate 6-digit 2FA Login OTP Code
            const loginOtp = user.generateLoginOtp();
            await user.save({ validateBeforeSave: false });

            // Dispatch 6-digit 2FA Login Code Email
            await sendEmail({
                to: user.email,
                name: user.name,
                otpCode: loginOtp,
                subject: '🔐 2FA Login Verification Code - Personal Finance Tracker',
                html: get2FALoginOtpEmailTemplate({
                    name: user.name,
                    otpCode: loginOtp
                }),
                text: `Hello ${user.name}, your 6-digit 2FA login verification code is: ${loginOtp}`
            });

            res.json({
                requires2FA: true,
                email: user.email,
                message: `6-digit 2FA verification code has been sent to ${user.email}.`
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify 6-digit 2FA Login OTP Code & Return Token
// @route   POST /api/auth/verify-login-otp
// @access  Public
const verifyLoginOTP = async (req, res) => {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
        return res.status(400).json({ message: 'Email and 6-digit verification code are required.' });
    }

    try {
        const cleanEmail = email.trim().toLowerCase();
        const codeToVerify = otpCode.trim();

        // Hash code to match database
        const loginOtpCode = crypto
            .createHash('sha256')
            .update(codeToVerify)
            .digest('hex');

        const user = await User.findOne({
            email: cleanEmail,
            loginOtpCode,
            loginOtpExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired 6-digit 2FA verification code.' });
        }

        // Clear 2FA OTP code
        user.loginOtpCode = undefined;
        user.loginOtpExpire = undefined;
        await user.save({ validateBeforeSave: false });

        const timeStr = new Date().toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        // Dispatch Login Alert Security Email
        sendEmail({
            to: user.email,
            name: user.name,
            subject: '🔐 Account Security Alert: Successful Login on Personal Finance Tracker',
            html: getLoginEmailTemplate({
                name: user.name,
                email: user.email,
                time: timeStr
            }),
            text: `Hello ${user.name}, you successfully logged into Personal Finance Tracker at ${timeStr}. Email: ${user.email}`
        }).catch(err => console.error('Login email error:', err));

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
            message: '2FA authentication successful!'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                monthlyIncome: user.monthlyIncome,
                preferredCurrency: user.preferredCurrency,
                createdAt: user.createdAt
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.monthlyIncome = req.body.monthlyIncome !== undefined ? req.body.monthlyIncome : user.monthlyIncome;
            user.preferredCurrency = req.body.preferredCurrency || user.preferredCurrency;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                monthlyIncome: updatedUser.monthlyIncome,
                preferredCurrency: updatedUser.preferredCurrency,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot password - Send 6-Digit OTP Verification Code Email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const cleanEmail = email ? email.trim().toLowerCase() : '';
        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            return res.status(404).json({ message: 'No account found with that email address.' });
        }

        // Get 6-digit OTP code
        const otpCode = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        try {
            await sendEmail({
                to: user.email,
                name: user.name,
                otpCode: otpCode,
                subject: '🔑 6-Digit Password Reset Verification Code - Personal Finance Tracker',
                html: getOtpEmailTemplate({ name: user.name, otpCode }),
                text: `Hello ${user.name}, your 6-digit password reset verification code is: ${otpCode}`
            });

            res.json({ message: `6-digit verification code has been sent to ${user.email}.` });
        } catch (emailError) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ message: 'Email could not be sent. Please try again.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password with 6-Digit OTP Verification Code
// @route   POST /api/auth/reset-password & PUT /api/auth/reset-password/:resetToken
// @access  Public
const resetPassword = async (req, res) => {
    const { email, otpCode, password } = req.body;
    const tokenFromParam = req.params?.resetToken;

    const codeToVerify = (otpCode || tokenFromParam || '').trim();

    if (!codeToVerify) {
        return res.status(400).json({ message: 'Please enter the 6-digit verification code.' });
    }

    try {
        // Hash 6-digit OTP code to match database
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(codeToVerify)
            .digest('hex');

        const query = {
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        };

        if (email) {
            query.email = email.trim().toLowerCase();
        }

        const user = await User.findOne(query);

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired 6-digit verification code.' });
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
            message: 'Password updated successfully! Please login with your new password.'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    verifyLoginOTP,
    getUserProfile,
    updateUserProfile,
    forgotPassword,
    resetPassword
};
