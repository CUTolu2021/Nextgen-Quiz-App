const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { sendEmail } = require("../utils/emailService");

// Generate JWT token
const generateToken = (user, expiresIn = "10m") => {
  return jwt.sign(
    {
      username: user.username,
      userId: user._id || user.userId,
      role: user.role,
      email: user.email,
      emailVerificationToken: user.emailVerificationToken,
    },
    process.env.JWT_KEY,
    { expiresIn }
  );
};

// Generate a random validation token of length 6 mix of digits and letters
const generateValidationToken = () => {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
};

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const getBaseUrl = (req) => {
  const configuredBaseUrl =
    process.env.APP_BASE_URL || process.env.PUBLIC_BASE_URL;

  if (configuredBaseUrl) {
    try {
      return new URL(configuredBaseUrl).origin;
    } catch (error) {
      console.error("Invalid APP_BASE_URL/PUBLIC_BASE_URL:", error.message);
      return null;
    }
  }

  if (process.env.NODE_ENV !== "production") {
    return `${req.protocol}://${req.get("host")}`;
  }

  return null;
};

const buildAppLink = (req, path, token) => {
  const baseUrl = getBaseUrl(req);

  if (!baseUrl) {
    return null;
  }

  const link = new URL(path, baseUrl);
  link.searchParams.set("token", token);
  return link.toString();
};

// User signup
const signup = async (req, res) => {
  const { username, email, password, role } = req.body;
  const requestedRole = role === "Creator" ? "Creator" : "Participant";
  const assignedRole =
    process.env.ALLOW_CREATOR_SIGNUP === "true" ? requestedRole : "Participant";

  // Validation
  if (!username || !password || !email) {
    return res.status(400).json({ message: "Missing fields" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (!existingUser.active_status) {
        return res
          .status(401)
          .json({ message: "Account is inactive, please contact admin" });
      }
      if (existingUser.emailVerified && username === existingUser.username) {
        return res
          .status(200)
          .json({ message: "User already exists, please login" });
      }
      if (existingUser.emailVerified && username !== existingUser.username) {
        return res.status(200).json({ message: "Email already exists" });
      }

      const token = generateToken(existingUser, "10m");
      const verificationLink = buildAppLink(req, "/verify-email", token);

      if (!verificationLink) {
        return res.status(500).json({
          message:
            "Unable to generate verification link. Set APP_BASE_URL in environment variables.",
        });
      }

      await sendEmail(
        existingUser.email,
        "Quizzy Email Verification",
        `Click the link to verify your email: ${verificationLink}\n\nThis link is valid for 10 minutes.`
      );
      return res.status(200).json({
        message:
          "Email already exists, please verify your email. A verification link has been sent to your email.",
      });
    }

    const hashedPassword = await hashPassword(password);
    const validationToken = generateValidationToken();

    const newUser = await User.create({
      username,
      password: hashedPassword,
      email,
      role: assignedRole,
      emailVerificationToken: validationToken,
    });

    const token = generateToken(newUser);
    const verificationLink = buildAppLink(req, "/verify-email", token);

    if (!verificationLink) {
      return res.status(500).json({
        message:
          "Unable to generate verification link. Set APP_BASE_URL in environment variables.",
      });
    }

    await sendEmail(
      newUser.email,
      "Quizzy Email Verification",
      `Click the link to verify your email: ${verificationLink}\n\nThis link is valid for 10 minutes.`
    );

    return res.status(201).json({
      message:
        "Please verify your email. A verification link has been sent to your email.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

// Email verification
const verifyEmail = async (req, res) => {
  const { token } = req.query;
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    const user = await User.findOne(
      { email: decodedToken.email },
      "emailVerified emailVerificationToken"
    );

    if (!user) {
      return res.status(404).json({ message: "User  not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (decodedToken.emailVerificationToken !== user.emailVerificationToken) {
      return res.status(403).json({ message: "Invalid validation token" });
    }
    user.emailVerified = true;
    user.emailVerificationToken = null;
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
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    if (!user.emailVerified) {
      return res.status(401).json({
        message:
          "Email not verified, please register again to get a new verification link",
      });
    }
    if (!user.active_status) {
      return res
        .status(401)
        .json({ message: "Account is inactive, please contact admin" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Username or Password" });
    }

    const token = generateToken(user, "3d");
    return res.status(200).json({
      message: "Authentication successful",
      role: user.role,
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
    const user = await User.findOne(
      { email },
      "email username emailVerificationToken"
    );
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found, please register" });
    }

    const OTP = generateValidationToken();
    user.emailVerificationToken = OTP;
    await user.save();

    const token = generateToken(user, "10m");
    const resetLink = buildAppLink(req, "/codeVerification", token);

    if (!resetLink) {
      return res.status(500).json({
        message:
          "Unable to generate reset link. Set APP_BASE_URL in environment variables.",
      });
    }

    await sendEmail(
      user.email,
      "Quizzy Password Reset",
      `Hi ${user.username},\n\nClick the link to reset your password: ${resetLink}\n\nThis link is valid for 10 minutes.\nYour OTP is: ${OTP}\n\nIf you did not request this, please ignore this email.`
    );

    return res.status(200).json({
      message:
        "Reset link sent to your email. Check your spam folder if you can't find it.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Failed to send reset link, please try again",
      error: err.message,
    });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  const { OTP } = req.body;
  const { token } = req.query;

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    const user = await User.findById(
      decodedToken.userId,
      "password email emailVerificationToken"
    );

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found, please register" });
    }

    if (user.emailVerificationToken !== OTP) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    user.emailVerificationToken = null;
    await user.save();

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Reset Password failed. Token may have expired",
      error: err.message,
    });
  }
};

// Reset user password
const resetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const { token } = req.query;

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    const user = await User.findById(
      decodedToken.userId,
      "password email emailVerificationToken"
    );

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found, please register" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    user.password = await hashPassword(password);

    await user.save();

    await sendEmail(
      user.email,
      "Quizzy Application, Password Reset Confirmation",
      "Your password has been successfully reset."
    );

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
    const user = await User.findById(userId, {
      password: 0,
      __v: 0,
      createdAt: 0,
      updatedAt: 0,
    });
    if (!user) {
      return res.status(404).json({ message: "User  not found" });
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
  verifyEmail,
  verifyOTP,
  generateToken,
  hashPassword,
};
