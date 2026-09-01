const nodemailer = require('nodemailer');
const axios = require('axios');

/**
 * Utility to send emails via Direct Gmail SMTP (Nodemailer) or EmailJS REST API safely
 * Supports both object signature `sendEmail({ to, name, subject, text, html, otpCode })`
 * and positional signature `sendEmail(to, name, text, subject)`
 */
const sendEmail = async (optionsOrTo, nameArg, textArg, subjectArg) => {
    try {
        let to, name, subject, text, html, otpCode;

        if (typeof optionsOrTo === 'object' && optionsOrTo !== null) {
            ({ to, name, subject, text, html, otpCode } = optionsOrTo);
        } else {
            to = optionsOrTo;
            name = nameArg;
            text = textArg;
            subject = subjectArg || '🔑 Password Reset Request - Personal Finance Tracker';
        }

        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;

        const emailJsServiceId = process.env.EMAILJS_SERVICE_ID;
        const emailJsTemplateId = process.env.EMAILJS_TEMPLATE_ID;
        const emailJsPublicKey = process.env.EMAILJS_PUBLIC_KEY;
        const emailJsPrivateKey = process.env.EMAILJS_PRIVATE_KEY;

        const timeStr = new Date().toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        // 🌟 ALWAYS PRINT VERIFICATION CODE TO TERMINAL LOG FOR INSTANT TESTING ACCESS
        if (otpCode) {
            console.log('\n====================================================');
            console.log(`🔑 [SECURITY VERIFICATION OTP CODE GENERATED]`);
            console.log(`To Email: ${to}`);
            console.log(`User Name: ${name || 'Valued User'}`);
            console.log(`6-DIGIT VERIFICATION CODE: >>> ${otpCode} <<<`);
            console.log(`Timestamp: ${timeStr}`);
            console.log('====================================================\n');
        }

        // 1. Direct Gmail SMTP (Nodemailer) Option - Priority #1
        if (emailUser && emailPass) {
            const transporter = nodemailer.createTransport({
                service: process.env.EMAIL_SERVICE || 'gmail',
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: process.env.SMTP_PORT || 587,
                secure: false,
                auth: {
                    user: emailUser,
                    pass: emailPass
                }
            });

            const mailOptions = {
                from: `"Personal Finance Tracker" <${emailUser}>`,
                to,
                subject: subject || 'Personal Finance Tracker Notification',
                text: text || `Hello ${name || 'User'}, your verification code is ${otpCode || ''}`,
                html: html || text
            };

            const info = await transporter.sendMail(mailOptions);
            console.log(`[DIRECT GMAIL SMTP SENT SUCCESS] Message ID: ${info.messageId} to ${to}`);
            return true;
        }

        // 2. EmailJS REST API Fallback Option
        if (emailJsServiceId && emailJsTemplateId && emailJsPublicKey) {
            try {
                const payload = {
                    service_id: emailJsServiceId,
                    template_id: emailJsTemplateId,
                    user_id: emailJsPublicKey,
                    template_params: {
                        to_email: to,
                        name: name || 'Valued User',
                        time: timeStr,
                        message: text || subject,
                        subject: subject || 'Personal Finance Tracker Notification',
                        html_content: html || text,
                        otp_code: otpCode || '',
                        code: otpCode || ''
                    }
                };

                if (emailJsPrivateKey) {
                    payload.accessToken = emailJsPrivateKey;
                }

                await axios.post('https://api.emailjs.com/api/v1.0/email/send', payload, {
                    headers: { 'Content-Type': 'application/json' }
                });

                console.log(`[EMAILJS SENT SUCCESS] Live email with code ${otpCode || ''} dispatched to ${to}`);
                return true;
            } catch (emailJsError) {
                console.error('[EMAILJS DISPATCH WARNING]:', emailJsError.response?.data || emailJsError.message);
                return true;
            }
        }

        // 3. Fallback Mock Terminal Logger (For Development)
        console.log('\n----------------------------------------------------');
        console.log(`[EMAIL NOTIFICATION MOCK]`);
        console.log(`To: ${to}`);
        console.log(`Name: ${name || 'User'}`);
        console.log(`Subject: ${subject || 'Notification'}`);
        console.log(`Content:\n${text || html || 'HTML Email Body'}`);
        console.log('----------------------------------------------------\n');
        return true;
    } catch (error) {
        console.error('[EMAIL SEND ERROR]:', error.message);
        return false;
    }
};

/**
 * HTML Email Template for New User Registration
 */
const getWelcomeEmailTemplate = ({ name, email, password }) => {
    return `
    <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 30px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #4f46e5; margin: 0; font-size: 24px;">Personal Finance Tracker</h2>
                <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Welcome to Smart Money Management</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            
            <h3 style="color: #0f172a;">Welcome, ${name}! 👋</h3>
            <p style="font-size: 15px; line-height: 1.6; color: #334155;">
                Your account on <strong>Personal Finance Tracker</strong> has been successfully created.
            </p>

            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #4f46e5;">
                <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 15px;">🔑 Your Account Credentials:</h4>
                <p style="margin: 6px 0; font-size: 14px;"><strong>Username / Email:</strong> ${email}</p>
                <p style="margin: 6px 0; font-size: 14px;"><strong>Password:</strong> ${password}</p>
            </div>

            <p style="font-size: 14px; color: #64748b; line-height: 1.5;">
                Please keep your credentials safe and do not share them with anyone.
            </p>

            <div style="text-align: center; margin-top: 30px;">
                <a href="http://localhost:5173" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block;">Go to Dashboard</a>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0 20px 0;" />
            
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                Generated by PFT — Personal Finance Tracker  |  Confidential & Secure
            </p>
        </div>
    </div>
    `;
};

/**
 * HTML Email Template for User Login Notification
 */
const getLoginEmailTemplate = ({ name, email, time }) => {
    return `
    <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 30px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #4f46e5; margin: 0; font-size: 24px;">Personal Finance Tracker</h2>
                <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Security Login Notification</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            
            <h3 style="color: #0f172a;">Hello, ${name}! 👋</h3>
            <p style="font-size: 15px; line-height: 1.6; color: #334155;">
                You have successfully logged into your <strong>Personal Finance Tracker</strong> account.
            </p>

            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #10b981;">
                <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 15px;">🔐 Login Activity Details:</h4>
                <p style="margin: 6px 0; font-size: 14px;"><strong>Account Email:</strong> ${email}</p>
                <p style="margin: 6px 0; font-size: 14px;"><strong>Login Timestamp:</strong> ${time}</p>
                <p style="margin: 6px 0; font-size: 14px;"><strong>Status:</strong> Successful Login</p>
            </div>

            <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
                If this was you, no further action is required. If you did not perform this login, please change your password immediately.
            </p>

            <div style="text-align: center; margin-top: 30px;">
                <a href="http://localhost:5173" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block;">Open PFT Dashboard</a>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0 20px 0;" />
            
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                Generated by PFT — Personal Finance Tracker  |  Security System
            </p>
        </div>
    </div>
    `;
};

/**
 * HTML Email Template for 6-Digit 2FA Login OTP Code
 */
const get2FALoginOtpEmailTemplate = ({ name, otpCode }) => {
    return `
    <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 30px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #4f46e5; margin: 0; font-size: 24px;">Personal Finance Tracker</h2>
                <p style="color: #64748b; font-size: 14px; margin-top: 4px;">2FA Security Login Verification Code</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            
            <h3 style="color: #0f172a;">Hello, ${name}! 👋</h3>
            <p style="font-size: 15px; line-height: 1.6; color: #334155;">
                A login attempt was made for your <strong>Personal Finance Tracker</strong> account. Use the 6-digit 2FA verification code below to complete your login:
            </p>

            <div style="background-color: #f1f5f9; padding: 24px; border-radius: 16px; margin: 24px 0; text-align: center; border: 1px dashed #cbd5e1;">
                <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px; font-weight: bold; letter-spacing: 1px;">YOUR 2FA LOGIN CODE</p>
                <div style="font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #10b981; margin: 8px 0;">${otpCode}</div>
                <p style="margin: 8px 0 0 0; color: #ef4444; font-size: 12px;">This verification code expires in 10 minutes.</p>
            </div>

            <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
                If you did not attempt to log in, please secure your account and change your password immediately.
            </p>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0 20px 0;" />
            
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                Generated by PFT — Personal Finance Tracker  |  2FA Security Center
            </p>
        </div>
    </div>
    `;
};

/**
 * HTML Email Template for 6-Digit OTP Code Password Reset
 */
const getOtpEmailTemplate = ({ name, otpCode }) => {
    return `
    <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 30px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #4f46e5; margin: 0; font-size: 24px;">Personal Finance Tracker</h2>
                <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Password Reset Verification Code</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            
            <h3 style="color: #0f172a;">Hello, ${name}! 👋</h3>
            <p style="font-size: 15px; line-height: 1.6; color: #334155;">
                We received a request to reset your password for your <strong>Personal Finance Tracker</strong> account. Use the 6-digit verification code below:
            </p>

            <div style="background-color: #f1f5f9; padding: 24px; border-radius: 16px; margin: 24px 0; text-align: center; border: 1px dashed #cbd5e1;">
                <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px; font-weight: bold; letter-spacing: 1px;">YOUR VERIFICATION CODE</p>
                <div style="font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; margin: 8px 0;">${otpCode}</div>
                <p style="margin: 8px 0 0 0; color: #ef4444; font-size: 12px;">This verification code expires in 10 minutes.</p>
            </div>

            <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
                Enter this 6-digit code on the password reset page along with your new password. If you did not request a password reset, please ignore this email.
            </p>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0 20px 0;" />
            
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                Generated by PFT — Personal Finance Tracker  |  Security Center
            </p>
        </div>
    </div>
    `;
};

module.exports = {
    sendEmail,
    getWelcomeEmailTemplate,
    getLoginEmailTemplate,
    getOtpEmailTemplate,
    get2FALoginOtpEmailTemplate
};
