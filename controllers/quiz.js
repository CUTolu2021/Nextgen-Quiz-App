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
    const { question, options, answer } = req.body;
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
const Quiz = require('../models/Quiz');

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
