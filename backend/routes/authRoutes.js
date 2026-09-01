const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    verifyLoginOTP,
    getUserProfile,
    updateUserProfile,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-login-otp', verifyLoginOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

module.exports = router;
