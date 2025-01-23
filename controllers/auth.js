const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { sendEmail } = require('../utils/emailService');
const quiz = require('../models/quiz');

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            username: user.username,
            userId: user._id,
            role: user.role,
            email: user.email,
            validationToken: user.validationToken,
        },
        process.env.JWT_KEY,
        { expiresIn: "10m" }
    );
};

const generateTokenLoggedIn = (user) => {
    return jwt.sign(
        {
            username: user.username,
            userId: user._id,
            role: user.role,    
            email: user.email,
        },
        process.env.JWT_KEY,
        { expiresIn: "3d" }
    );
}

// Generate a random validation toke
const generateValidationToken = () => {
    return Math.random().toString(36).substr(2, 10);
};

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// User signup
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

        const existingUser  = await User.findOne({ email }, { password: 0 , __v: 0, createdAt: 0, updatedAt: 0 });
        if (existingUser ) {
            if (existingUser.emailVerified) {
                return res.status(200).json({ message: "User  already exists" });
            } else {
                // User exists but not verified, resend verification email
                const token = generateToken(existingUser );
                const verificationLink = `${req.protocol}://${req.get('host')}/auth/verify?token=${token}`;
                await sendEmail(existingUser .email, 'Quizzy Email Verification', `Click the link to verify your email: ${verificationLink}\n\nThis link is valid for 10 minutes.`);
                return res.status(200).json({ message: "Please verify your email. A verification link has been sent to your email." });
            }
        }

        const hashedPassword = await hashPassword(password);
        const validationToken = generateValidationToken();
        const newUser  = await User.create({ username, password: hashedPassword, email, role, validationToken });

        const token = generateToken(newUser);
        const verificationLink = `${req.protocol}://${req.get('host')}/auth/verify?token=${token}`;
        await sendEmail(newUser.email, 'Quizzy Email Verification', `Click the link to verify your email: ${verificationLink}\n\nThis link is valid for 10 minutes.`);
=======
        const validationToken = generateValidationToken();

        const token = jwt.sign(
            {
                username: username,
                email: email,
                userId: null,
                validationToken: validationToken,
            },
            process.env.JWT_KEY,
            { expiresIn: "10m" }
        );

        const checkUser = await User.findOne({ email }, "email emailVerified validationToken");
        if (checkUser && checkUser.emailVerified) {
            return res.status(200).json({ message: "User already exists" });
        }

        if (checkUser && !checkUser.emailVerified) {
            const token = jwt.sign(
                {
                    username: username,
                    email: email,
                    userId: checkUser._id,
                    validationToken: checkUser.validationToken,
                },
                process.env.JWT_KEY,
                { expiresIn: "10m" }
            );

            const verificationLink = `${req.protocol}://${req.get('host')}/auth/verify?token=${token}`;
            await sendEmail(checkUser.email, 'Quizzy Email Verification', `Click the link to verify your quizzy application email: ${verificationLink}\n\nThis link is valid for 10 minutes. If you did not request this please ignore this email.`);
            return res.status(200).json({ message: "Please verify your email. A verification link has been sent to your email." });
        }

        const hashedPassword = await hashPassword(password);
        const user = await User.create({ username, password: hashedPassword, email, role, validationToken });

        const verificationLink = `${req.protocol}://${req.get('host')}/auth/verify?token=${token}`;

        await sendEmail(user.email, 'Quizzy Email Verification', `Click the link to verify your quizzy application email: ${verificationLink}\n\nThis link is valid for 10 minutes. If you did not request this please ignore this email.`);



        return res.status(201).json({
            message: "Please verify your email. A verification link has been sent to your email.",
            token,

        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "User  not successfully created",
            error: err.message,
        });
    }
};

// Email verification
const verifyEmail = async (req, res) => {
    const { token } = req.query;

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_KEY);
        console.log(decodedToken);
        const user = await User.findOne({ email: decodedToken.email }, "emailVerified validationToken");
        console.log(user);
        if (!user) {
            return res.status(404).json({ message: "User  not found" });
        }

        if (user.emailVerified) {
            return res.status(400).json({ message: "Email already verified" });
        }

        if (decodedToken.validationToken !== user.validationToken) {
            return res.status(401).json({ message: "Invalid validation token" });
        }

        user.emailVerified = true;
        await user.save();
        return res.status(200).json({ message: "Email successfully verified" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Email verification failed",
            error: err.message,
        });
    }
};


// User login
=======
const verifyEmail = async (req, res) => {
    const { token } = req.query;

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_KEY);
        const user = await User.findOne({ email: decodedToken.email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.emailVerified) {
            return res.status(400).json({ message: "Email already verified" });
        }

        if (decodedToken.validationToken !== user.validationToken) {
            return res.status(401).json({ message: "Invalid validation token" });
        }

        user.emailVerified = true;
        await user.save();
        return res.status(200).json({ message: "Email successfully verified" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Email verification failed",
            error: err.message,
        });
    }
};


const login = async (req, res) => {
    const { username, password } = req.body;

    try {

        const user = await User.findOne({ username }, "password role email emailVerified");
=======

        if (!user) {
            return res.status(401).json({ message: "User  not found" });
        }
        if (!user.emailVerified) {
            return res.status(401).json({ message: "Email not verified, please register again to get a new verification link" });
        }
        if (!user.emailVerified) {
            return res.status(401).json({ message: "Email not verified, Please register again to get a new verification link" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Username or Password" });
        }

        const token = generateTokenLoggedIn(user);
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

// Password reset request
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email }, "email username");
        if (!user) {
            return res.status(404).json({ message: "User  not found" });
        }
        const token = generateToken(user);

        const resetLink = `${req.protocol}://${req.get('host')}/auth/reset-password?token=${token}`;


        await sendEmail(user.email, 'Quizzy Password Reset', `Hi ${user.username},\n\nClick the link to reset your password: ${resetLink}\n\nThis link is valid for 10 minutes. If you did not request this, please ignore this email.`);

        return res.status(200).json({
            message: "Reset link sent to your email. Check your spam folder if you can't find it.",
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Failed to send reset link",
            error: err.message,
        });
    }
};

// Reset user password
const resetPassword = async (req, res) => {
    const { password } = req.body;
    const { token } = req.query;

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_KEY);
        const user = await User.findById(decodedToken.userId, "password email");
        if (!user) {
            return res.status(404).json({ message: "User   not found" });
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

// Get user profile
const getProfile = async (req, res) => {

    const { userId } = req.user;


    try {
        const user = await User.findById(userId, { password: 0, __v: 0, createdAt: 0, updatedAt: 0 });
        if (!user) {
            return res.status(404).json({ message: "User   not found" });
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
    hashPassword,
    verifyEmail
};