const {QuizAttempt, Quiz, QuizResponse} = require('../models/quiz');
const {QuizLeaderboard,Leaderboard} = require('../models/leaderboard');
const { generateToken } = require('./auth');

const startQuiz = async (req, res) => {
    const { quizId } = req.params;
    const userId = req.user.userId; 

    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz || quiz.active_status === "inactive") {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const attempt = new QuizAttempt({
            userId,
            quizId,
            startTime: new Date(),
        });

        await attempt.save();
        res.status(200).json({ message: 'Quiz started', attemptId: attempt._id });
    } catch (error) {
        console.error('Error starting quiz:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
const endQuiz = async (req, res) => {
    const { quizId } = req.params;
    const { score,points,correct,wrong,timeUsed } = req.body;
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
        attempt.endTime = new Date(); // Set end time
        attempt.timeUsed = timeUsed;
        attempt.score = score;
        attempt.correct = correct;
        attempt.wrong = wrong;
        attempt.points = points;
        await attempt.save();
        if(userId !== null){
            await updateLeaderboard(userId, quizId, points,timeUsed);
        }

        res.status(200).json({ message: 'Quiz ended', score: attempt.score });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateLeaderboard = async (userId, quizId, points,timeUsed) => {
    try {
        const existingEntry = await QuizLeaderboard.findOne({ userId, quizId });

        if (existingEntry) {
            // Update the existing entry with the new score
            existingEntry.score = points;
            await existingEntry.save();
        } else {
            // Create a new entry if it doesn't exist
            const newEntry = new QuizLeaderboard({
                userId,
                quizId,
                score: points,
                timeUsed,
                createdAt: new Date()
            });
            await newEntry.save();
        }

        // Recalculate rankings for this specific quiz
        const leaderboardEntries = await QuizLeaderboard.find({ quizId }).sort({ score: -1, createdAt: 1 });

        // Reset the ranks for this quiz
        await QuizLeaderboard.updateMany({ quizId }, { $set: { rank: 0 } });

        // Assign new ranks based on the sorted scores
        for (let i = 0; i < leaderboardEntries.length; i++) {
            leaderboardEntries[i].rank = i + 1;
            await leaderboardEntries[i].save();
        }
    } catch (error) {
        console.error('Error updating leaderboard:', error.message);
    }
};

const getQuizAttemptByUserId = async (req, res) => {
    const userId = req.user.userId;
    try {
        const attempts = await QuizAttempt.find({ userId });
        res.status(200).json(attempts);
    } catch (error) {
        console.error('Error fetching quiz attempts:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getLeaderboard = async (req, res) => {
    try {
        const attempts = await QuizAttempt.find();
        console.log(attempts);
        const leaderboardEntries = {};
        attempts.forEach(attempt => {
            const userId = attempt.userId.toString();
            if (!leaderboardEntries[userId]) {
                leaderboardEntries[userId] = {
                    userId,
                    score: 0,
                };
            }
            leaderboardEntries[userId].score += attempt.points;
        });

        const sortedLeaderboard = Object.values(leaderboardEntries).sort((a, b) => b.score - a.score);
        sortedLeaderboard.forEach((entry, index) => {
            entry.rank = index + 1;
        });

        const leaderboardPromises = sortedLeaderboard.map(async (entry, index) => {
            const leaderboardEntry = await Leaderboard.findOneAndUpdate(
                { userId: entry.userId },
                {
                    userId: entry.userId,
                    score: entry.score,
                    rank: index + 1,
                },
                { upsert: true, new: true }
            );
            return leaderboardEntry;
        });

        const leaderboard = await Promise.all(leaderboardPromises);

        res.status(200).json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getLeaderboardByQuizId = async (req, res) => {
    const { quizId } = req.params;
    try {
        const leaderboardEntries = await QuizLeaderboard.find({ quizId }).sort({ score: -1, createdAt: 1 });
        console.log(leaderboardEntries);
        res.status(200).json(leaderboardEntries);
    } catch (error) {
        console.error('Error fetching leaderboard:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getLeaderboardByUserId = async (req, res) => {
    const { userId } = req.params;
    try {
        const leaderboard = await Leaderboard.find({ userId });
        console.log(leaderboard);
        res.status(200).json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getQuizAttemptByQuizId = async (req, res) => {
    const { quizId } = req.params;
    const { userId } = req.user;
    try {
        const attempts = await QuizAttempt.find({ quizId, userId });
        res.status(200).json(attempts);

        // Remove user from database if they don't have an email 20 minutes later
        if(req.user.email === null){
            setTimeout(async () => {
                await QuizLeaderboard.deleteMany({ userId });
                await QuizResponse.deleteMany({ userId });
                await QuizAttempt.deleteMany({ userId });
            }, 20 * 60 * 1000);
        }
    } catch (error) {
        console.error('Error fetching quiz attempts:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getQuizResults = async (req, res) => {
    const { quizId } = req.params;
    const { userId } = req.user;
    try {
        const attempts = await QuizResponse.find({ quizId, userId });
        res.status(200).json(attempts);
    } catch (error) {
        console.error('Error fetching quiz attempts:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const submitAnswer = async (req, res) => {
    const { quizId } = req.params;
    const { questionId, question,selectedAnswer, correctAnswer } = req.body;
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

        // Check if the time limit has been exceeded
        const currentTime = new Date();
        const elapsedTime = (currentTime - attempt.startTime) / 60000; // Convert to minutes
        if (elapsedTime > quiz.time_limit) {
            attempt.isCompleted = true; 
            attempt.endTime = currentTime; // Set end time
            await attempt.save();
            return res.status(200).json({ message: 'Quiz ended due to time limit', score: attempt.score, points: attempt.points });
        }

        // Find existing response to update
        let response = await QuizResponse.findOne({ userId, quizId, questionId });

        if (response) {
            // If the user has already answered this question, update the answer
            response.selectedAnswer = selectedAnswer;
            response.correctAnswer = correctAnswer;
            response.question = question;

        } else {
            // If no previous answer exists, create a new one
            response = new QuizResponse({
                userId,
                quizId,
                questionId,
                selectedAnswer,
                correctAnswer,
                question
            });
        }
        if(selectedAnswer === correctAnswer){
            response.isCorrect = true;
        }else{
            response.isCorrect = false;
        }

        await response.save();

        res.status(200).json({ message: 'Answer saved/updated successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const allowUnregisteredUsersToTakeQuiz = async (req, res) => {
    const tempUser = {
        userId: null,
        username: `Unregistered_User_${Date.now()}`,
        email: null,
        role: "Participant",
    };
    const token = generateToken(tempUser, "30m");
    res.status(200).json({ token });
}


module.exports = { startQuiz,getLeaderboardByUserId,allowUnregisteredUsersToTakeQuiz,getQuizResults, endQuiz, submitAnswer, getQuizAttemptByUserId, getLeaderboardByQuizId, getQuizAttemptByQuizId, getLeaderboard };