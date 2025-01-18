const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { sendEmail } = require('../utils/emailService');

const generateToken = (user) => {
    return jwt.sign(
        {
            username: user.username,
            userId: user._id,
            role: user.role,
        },
        process.env.JWT_KEY,
        { expiresIn: "10m" }
    );
};

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10); // Increased salt rounds for better security
    return await bcrypt.hash(password, salt);
};

const signup = async (req, res) => {
    const { username, email, password, role } = req.body;

    // Validation
    if (!username || !password || !email) {
        return res.status(400).json({ message: "Missing fields" });
    }
    if (password.length < 4) {
        return res.status(400).json({ message: "Password must be at least 4 characters" });
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Invalid email address' });
    }

    try {
        const hashedPassword = await hashPassword(password);
        const user = await User.create({ username, password: hashedPassword, email, role });
        const token = generateToken(user);
        
        return res.status(201).json({
            message: "User successfully created",
            token,
            user,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "User not successfully created",
            error: err.message,
        });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username }, "password");
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Username or Password" });
        }

        const token = generateToken(user);
        return res.status(200).json({
            message: "Authentication successful",
            token,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Authentication failed",
            error: err.message,
        });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User  not found" });
        }
        const token = generateToken(user); 
        const resetLink = `${req.protocol}://${req.get('host')}auth/reset-password?token=${token}`; // Reset link

        await sendEmail(user.email, 'Quizzy Password Reset', `Click the link to reset your quizzy application password: ${resetLink}\n\nThis link is valid for 10 minutes. If you did not request this please ignore this email.`);

        return res.status(200).json({
            message: "Reset link sent to your email, Check your spam folder if you can't find it",
            token,
            user,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Failed to send reset link",
            error: err.message,
        });
    }
};

const resetPassword = async (req, res) => {
    const { password } = req.body;
    const { token } = req.query;

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_KEY);
        const user = await User.findById(decodedToken.userId, "password email");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (password.length < 4) {
            return res.status(400).json({ message: "Password must be at least 4 characters" });
        }
        user.password = await hashPassword(password);
        await user.save();

        await sendEmail(user.email, 'Password Reset Confirmation', 'Your password has been successfully reset.');

        return res.status(200).json({ message: "Password reset successful" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Reset Password failed. Token may have expired",
            error: err.message,
        });
    }
};

const getProfile = async (req, res) => {
    const { userId } = req.user 
    try {
        const user = await User.findById(userId, { password: 0, __v: 0, createdAt: 0, updatedAt: 0, _id: 0 });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Failed to get profile",
            error: err.message,
        });
    }
};

module.exports = {
    signup,
    login,
    forgotPassword,
    resetPassword,
    getProfile,
    hashPassword
};