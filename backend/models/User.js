const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
        },
        monthlyIncome: {
            type: Number,
            default: 0
        },
        preferredCurrency: {
            type: String,
            default: 'INR'
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        loginOtpCode: String,
        loginOtpExpire: Date
    },
    {
        timestamps: true,
    }
);

// Hash password before saving (Async hook in Mongoose 6+ does not use next callback)
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash 6-digit OTP verification code for password reset
userSchema.methods.getResetPasswordToken = function () {
    // Generate random 6-digit numeric OTP code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash 6-digit OTP code and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetCode)
        .digest('hex');

    // Set token expire time (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetCode;
};

// Generate 6-digit 2FA Login Verification OTP Code
userSchema.methods.generateLoginOtp = function () {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    this.loginOtpCode = crypto
        .createHash('sha256')
        .update(otpCode)
        .digest('hex');

    // Set token expire time (10 minutes)
    this.loginOtpExpire = Date.now() + 10 * 60 * 1000;

    return otpCode;
};

module.exports = mongoose.model('User', userSchema);
