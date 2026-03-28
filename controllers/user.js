const { Leaderboard } = require("../models/leaderboard");
const { QuizAttempt } = require("../models/quiz");
const User = require("../models/user");
const { hashPassword } = require("./auth");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(
      {},
      { password: 0, __v: 0, createdAt: 0, updatedAt: 0 }
    );
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get All users",
      error: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id, {
      password: 0,
      __v: 0,
      createdAt: 0,
      updatedAt: 0,
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get user",
      error: error.message,
    });
  }
};

const getUserStats = async (req, res) => {
  const { userId } = req.params;
  try {
    const leaderboardEntry = await Leaderboard.findOne({ userId });
    if (!leaderboardEntry) {
      return res.status(404).json({ message: "User not found on leaderboard" });
    }
    const user = await User.findById(userId, {
      password: 0,
      __v: 0,
      createdAt: 0,
      updatedAt: 0,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const quizAttempts = await QuizAttempt.find({ userId });

    const totalAttempts = quizAttempts.length;
    const totalCompleted = quizAttempts.filter(
      (attempt) => attempt.isCompleted
    ).length;
    const completionRate =
      totalAttempts === 0 ? 0 : (totalCompleted / totalAttempts) * 100;

    const allQuizScores = quizAttempts.map((attempt) => attempt.score);
    const highestScore = allQuizScores.length ? Math.max(...allQuizScores) : 0;
    const totalQuizTime = quizAttempts.reduce(
      (acc, attempt) => acc + (attempt.timeUsed || 0),
      0
    );

    res.status(200).json({
      globalRank: leaderboardEntry.rank,
      completionRate,
      highestScore,
      totalQuizTime,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get user stats",
      error: error.message,
    });
  }
};

const updateUserById = async (req, res) => {
  try {
    const { userId } = req.user;
    const { username, password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (typeof username === "string") {
      const trimmedUsername = username.trim();
      if (trimmedUsername.length < 3) {
        return res.status(400).json({
          message: "Username must be at least 3 characters long",
        });
      }
      user.username = trimmedUsername;
    }

    if (typeof password === "string") {
      if (password.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters long",
        });
      }
      user.password = await hashPassword(password);
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        active_status: user.active_status,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update user",
      error: error.message,
    });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.active_status = false;
    await user.save();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  getUserStats,
};
