const Quiz = require('./models/Quiz'); //Import the quiz model

// post route to create a new quiz
app.post('/quizzes', async(req,res) =>{
    try{
        const{title, questions} = req.body;

        //validate the title and qeuestions provided
        if (!title || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: 'Title and questions are required' });
         }

        //  Ensure each question contains text data
        for (const question of questions) {
            if (!question.questionText || !question.answerText){
                return res.status(400).json({ message: 'Each question must have both qeustionText and answerText.' });
            }
        }

        // create a new quiz document and save it
        const newQuiz = newQuiz({title, questions});
        await newQuiz.save();
        res.status(201).json(newQuiz); //Respond with the created Quiz
    } 
    catch (error) {
        res.status(500).json({message: 'An error occured while creating the quiz.', error});
    }
})
// controller function for fetching the all the quizzes
const Quiz = require("../models/Quiz");

// Fetch all quizzes
const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Add a new quiz
const createQuiz = async (req, res) => {
  try {
    const { question, title, description } = req.body;
    if (!question || !title || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    const newQuiz = new Quiz({ question, title, description });
    await newQuiz.save();
    
    res.status(201).json(newQuiz);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getQuizzes, createQuiz };
// updating controller to handle query parameters/ Adding Paginations
const Quiz = require('../models/Quiz');

exports.getQuizzes = async (req, res) => {
    try {
        let { page, limit } = req.query;

        // Convert to numbers and set defaults if not provided
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;

        const skip = (page - 1) * limit;

        // Fetch quizzes with pagination
        const quizzes = await Quiz.find().skip(skip).limit(limit);

        // Get total count for pagination metadata
        const total = await Quiz.countDocuments();

        res.json({
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            data: quizzes
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching quizzes", error });
    }
};
//Implementing error handling for invalid parameters and add sorting by creation date.
const Quiz = require('../models/quiz');

exports.getQuizzes = async (req, res) => {
    try {
        let { page, limit } = req.query;

        // Validate query parameters
        if (page && isNaN(page)) {
            return res.status(400).json({ message: "Invalid 'page' parameter. It must be a number. Please try Again!" });
        }
        if (limit && isNaN(limit)) {
            return res.status(400).json({ message: "Invalid 'limit' parameter. It must be a number. Please try Again!" });
        }

        // Convert to numbers and set defaults
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;

        if (page < 1 || limit < 1) {
            return res.status(400).json({ message: "'page' and 'limit' must be greater than 0." });
        }

        const skip = (page - 1) * limit;

        // Fetch quizzes with pagination and sorting (latest first)
        const quizzes = await Quiz.find()
            .sort({ createdAt: -1 }) // Sort by newest first
            .skip(skip)
            .limit(limit);

        // Get total count for pagination metadata
        const total = await Quiz.countDocuments();

        res.json({
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            data: quizzes
        });

    } catch (error) {
        res.status(500).json({ message: "Error fetching quizzes", error: error.message });
    }
};

// GET /quiz/:quizId/score - Calculate and return user score
module.exports = { getQuizScore };
const express = require("express");
const { getQuizScore } = require("../controllers/quiz");

const router = express.Router();
router.get("/quiz/:quizId/score", getQuizScore);

module.exports = router;

const Quiz = require("../models/quiz");
const UserResponse = require("../models/UserResponse");

const getQuizScore = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { userId } = req.query;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: "Quiz not found" });

        const userResponses = await UserResponse.find({ quizId, userId });
        if (!userResponses.length) return res.status(404).json({ message: "No responses found" });

        let score = 0;
        quiz.questions.forEach(question => {
            const userAnswer = userResponses.find(r => r.questionId.toString() === question._id.toString());
            if (userAnswer && userAnswer.answer === question.correctAnswer) score++;
        });

        res.json({ quizId, userId, score, totalQuestions: quiz.questions.length });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { getQuizScore };

//Update getQuizScore in the Controller
const Quiz = require("../models/quiz");
const UserResponse = require("../models/UserResponse");
const QuizAttempt = require("../models/QuizAttempt"); // Import the new model

const getQuizScore = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { userId } = req.query;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: "Quiz not found" });

        const userResponses = await UserResponse.find({ quizId, userId });
        if (!userResponses.length) return res.status(404).json({ message: "No responses found" });

        let score = 0;
        quiz.questions.forEach(question => {
            const userAnswer = userResponses.find(r => r.questionId.toString() === question._id.toString());
            if (userAnswer && userAnswer.answer === question.correctAnswer) score++;
        });

        // Update or create a quiz attempt record for the user
        await QuizAttempt.findOneAndUpdate(
            { userId, quizId }, // Find by userId & quizId
            { score, totalQuestions: quiz.questions.length, completedAt: new Date() }, // Update values
            { upsert: true, new: true } // Create if not exists, return updated document
        );

        res.json({ quizId, userId, score, totalQuestions: quiz.questions.length });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { getQuizScore };

