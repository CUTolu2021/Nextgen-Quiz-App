const {QuizAttempt, Quiz, QuizResponse} = require('../models/quiz');
const User = require('../models/user');
const Question = require('../models/question');

const startQuiz = async (req, res) => {
    const { quizId } = req.params;
    const userId = req.user.userId; 

    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz || quiz.active_status === "inactive") {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const attempt = new quizAttemptSchema({
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
    const userId = req.user.userId; // Assuming user ID is available in req.user

    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const attempt = await quizAttemptSchema.findOne({ userId, quizId });
        if (!attempt) {
            return res.status(404).json({ message: 'Attempt not found' });
        }

        // Check if the time limit has been exceeded
        const currentTime = new Date();
        const elapsedTime = (currentTime - attempt.startTime) / 1000; // Convert to seconds
        if (elapsedTime > quiz.time_limit) {
            attempt.isCompleted = true; 
            attempt.endTime = currentTime; // Set end time
            await attempt.save();
            return res.status(200).json({ message: 'Quiz ended due to time limit', score: participation.score });
        }

        // Update the end time and status
            attempt.isCompleted = true; 
            attempt.endTime = currentTime; // Set end time
        await participation.save();

        res.status(200).json({ message: 'Quiz ended', score: participation.score });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
const submitAnswer = async (req, res) => {
    const { quizId } = req.params;
    const { questionId, selectedAnswer } = req.body;
    const userId = req.user.id; // Assuming user ID is available in req.user

    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const attempt = await quizAttemptSchema.findOne({ userId, quizId });
        if (!attempt) {
            return res.status(404).json({ message: 'Attempt not found' });
        }

        // Check if the time limit has been exceeded
        const currentTime = new Date();
        const elapsedTime = (currentTime - attempt.startTime) / 1000; // Convert to seconds
        if (elapsedTime > quiz.time_limit) {
            attempt.isCompleted = true; 
            attempt.endTime = currentTime; // Set end time
            await attempt.save();
            return res.status(200).json({ message: 'Quiz ended due to time limit', score: participation.score });
        }

        // Find the question to validate the answer
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const isCorrect = selectedAnswer === question.correctAnswer;

        const response = new Response({
            userId,
            quizId,
            questionId,
            selectedAnswer,
            isCorrect
        });

        await response.save();

        // Update the user's score
        if (isCorrect) {
            participation.score += question.points; // Add points if correct
        }

        await participation.save();

        res.status(200).json({ message: 'Answer submitted', isCorrect });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};