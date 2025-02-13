const {QuizAttempt, Quiz, QuizResponse} = require('../models/quiz');
const User = require('../models/user');
const Question = require('../models/question');
const Leaderboard = require('../models/leaderboard');

const startQuiz = async (req, res) => {
    const { quizId } = req.params;
    const userId = '678e6ab2f3311781752a6cd2'; //req.user.userId; 

    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz || quiz.active_status === "inactive") {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const attempt = new QuizAttempt({
            userId,
            quizId,
            startTime: new Date(),
            score: 0,
            currentQuestion: 1,
        });

        await attempt.save();
        res.status(200).json({ message: 'Quiz started', attemptId: attempt._id });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
const endQuiz = async (req, res) => {
    const { quizId } = req.params;
    const { score,endTime,timeUsed } = req.body;
    const userId = req.user.userId; // Assuming user ID is available in req.user

    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const attempt = await QuizAttempt.findOne({ userId, quizId });
        if (!attempt) {
            return res.status(404).json({ message: 'Attempt not found' });
        }
        if(attempt.score !== 0){
            return res.status(200).json({ message: `Quiz already attempted, you scored ${score} in this quiz compared to your previous score ${attempt.score} <br> You used ${timeUsed} min compared to your previous ${attempt.timeUsed} min`});
        }

        // Update the end time and status
        attempt.isCompleted = true; 
        attempt.endTime = endTime; // Set end time
        attempt.timeUsed = timeUsed;
        attempt.score = score;
        await attempt.save();

        await updateLeaderboard(userId, score);

        res.status(200).json({ message: 'Quiz ended', score: attempt.score });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateLeaderboard = async (userId, score) => {
    try {
        const attempts = await QuizAttempt.find({ userId });
        const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);

        let leaderboardEntry = await Leaderboard.findOne({ userId });

        if (leaderboardEntry) {
            // Update the existing entry with the new total score
            leaderboardEntry.score = totalScore;
            await leaderboardEntry.save();
        } else {
            // Create a new entry if it doesn't exist
            leaderboardEntry = new Leaderboard({ userId, score: totalScore, createdAt: new Date() });
            await leaderboardEntry.save();
        }

        // Recalculate rankings
        await recalculateRankings();
    } catch (error) {
        console.error('Error updating leaderboard:', error.message);
    }
};

// Function to recalculate rankings
const recalculateRankings = async () => {
    try {
        const leaderboardEntries = await Leaderboard.find().sort({ score: -1, createdAt: 1 });

        for (let i = 0; i < leaderboardEntries.length; i++) {
            leaderboardEntries[i].rank = i + 1;
            await leaderboardEntries[i].save();
        }
    } catch (error) {
        console.error('Error recalculating rankings:', error.message);
    }
};

const submitAnswer = async (req, res) => {
    const { quizId } = req.params;
    const { questionId, selectedAnswer, correctAnswer } = req.body;
    const userId = req.user.id; // Assuming user ID is available in req.user

    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const attempt = await QuizAttempt.findOne({ userId, quizId });
        if (!attempt) {
            return res.status(404).json({ message: 'Attempt not found' });
        }

        // Check if the time limit has been exceeded
        const currentTime = new Date();
        const elapsedTime = (currentTime - attempt.startTime) / 60000; // Convert to minutes
        if (elapsedTime > quiz.time_limit) {
            attempt.isCompleted = true; 
            attempt.endTime = currentTime; // Set end time
            await attempt.save();
            return res.status(200).json({ message: 'Quiz ended due to time limit', score: attempt.score });
        }

        // Find the question to validate the answer
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }


        const response = new QuizResponse({
            userId,
            quizId,
            questionId,
            selectedAnswer,
            correctAnswer
        });

        await response.save();

        res.status(200).json({ message: 'Answer submitted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { startQuiz, endQuiz, submitAnswer };