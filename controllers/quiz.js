const Quiz = require('../models/quiz');
const Question = require('../models/question');
const fs = require('fs');
const csv = require('csv-parser');

// Create a new quiz
const createQuiz = async (req, res) => {
    try {
        const { title, description, settings } = req.body;
        if (!title || !description || !settings) {
            return res.status(400).json({ message: 'Title, description, and settings are required' });
        }
        const quiz = await Quiz.create({ title, description, settings, creatorId: req.user.userId });
        req.session.quizId = quiz._id; // Save the quiz ID in the session
        console.log(req.session);
        res.status(201).json({ message: 'Quiz created successfully', quiz });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Upload CSV and create questions
const uploadCSV = async (req, res) => {
    const quizId = req.session.quizId;  // Get the quiz ID from the user object
    const results = [];

    //check if the user logged in is the one that created the quiz
    const quiz = await Quiz.findById(quizId, 'creatorId questions');
    if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
    }
    if (quiz.creatorId.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Unauthorized to update this quiz' });
    }
    console.log("Current", quiz)

    // Check if a file was uploaded
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // Parse the CSV file
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                // Create questions from the parsed data
                const questions = results.map(item => ({
                    question: item.question,
                    options: [item.option1, item.option2, item.option3, item.option4],
                    correctAnswers: item.correctAnswers, // Split by comma for multiple answers
                    isMultipleChoice: item.isMultipleChoice === 'true',
                    imageUrl: item.imageUrl || null, // Optional image URL
                    videoUrl: item.videoUrl || null,  // Optional video URL
                    quizId
                }));

                let checkQuestion = await Question.create(questions);
                console.log(checkQuestion)

                quiz.questions.push(...checkQuestion.map(question => question._id));
                await quiz.save();

                // Clean up the uploaded file
                fs.unlinkSync(req.file.path); // Delete the file after processing

                res.status(200).json({ message: 'Questions added successfully', quiz });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
};

//new function for upload questions using a patch request
const uploadQuestions = async (req, res) => {
    const quizId = req.params.quizId;
    const results = [];

    //check if the user logged in is the one that created the quiz
    const quiz = await Quiz.findById(quizId, 'creatorId questions');
    if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
    }
    if (quiz.creatorId.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Unauthorized to update this quiz' });
    }
    console.log("Current", quiz)

    // Check if a file was uploaded
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    // Parse the CSV file
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                // Create questions from the parsed data
                const questions = results.map(item => ({
                    question: item.question,
                    options: [item.option1, item.option2, item.option3, item.option4],
                    correctAnswers: item.correctAnswers, // Split by comma for multiple answers
                    isMultipleChoice: item.isMultipleChoice === 'true',
                    imageUrl: item.imageUrl || null, // Optional image URL
                    videoUrl: item.videoUrl || null,  // Optional video URL
                    quizId
                }));
                console.log(questions)

                //upload the question in the question db and add them to the question array from the quiz model
                let checkQuestion = await Question.create(questions);
                console.log(checkQuestion)

                quiz.questions.push(...checkQuestion.map(question => question._id));
                await quiz.save();
                // Clean up the uploaded file
                fs.unlinkSync(req.file.path); // Delete the file after processing
                res.status(200).json({ message: 'Questions added successfully', quiz });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
};

//find a question from a specify quiz and update the image link
const updateQuestionImage = async (req, res) => {
    try {
        const { quizId, questionId } = req.params;
        const result = await uploadToCloudinary(req.file.path);
        const newImage = new Image({ url: result.url, publicId: result.publicId });
        await newImage.save();
        const imageUrl = newImage.url;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const question = quiz.questions.find(q => q._id.toString() === questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        question.imageUrl = imageUrl;
        await quiz.save();

        res.status(200).json({ message: 'Question image updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Monica Updated
const getQuizzes = async (req, res) => {
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

        // Fetch quizzes with pagination
       // const quizzes = await Quiz.find().skip(skip).limit(limit);
        const quizzes = await Quiz.find()
            .sort({ createdAt: -1 }) // Sort by newest first
            .skip(skip)
            .limit(limit);

        // Get total count for pagination metadata
        const total = await Quiz.countDocuments();

        res.json({
            message:`Total number of quizzes is ${total}. You are on page ${page}, a page is limited to ${limit} items, There are ${Math.ceil(total/limit)} pages in total.`,
            data: quizzes
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching quizzes", error });
    }
};

const getQuestionByQuizId = async (req, res) => {
    try { 
        const { quizId } = req.params;
        const quiz = await Quiz.findById(quizId).populate('questions', '');
        //populate only shows the id of each question i need the actual question
        
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.json(quiz.questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Find quiz by ID
const getQuizById = async (req,res) =>{
    const {id} = req.params; 
    try {
        const quiz = await Quiz.findById(id);
        if (!quiz) {
            return res.status(404).json({message: 'Quiz not found'});
        }
        res.status(200).json(quiz);
    } catch (error) {
        console.error(error);
        res.status(500).json ({message: 'Server error'});
    }
}



module.exports = {
    createQuiz, uploadCSV, updateQuestionImage, uploadQuestions, getQuizzes, getQuestionByQuizId, getQuizById
}






// post route to create a new quiz** IRENE
// app.post('/quizzes', async (req, res) => {
//     try {
//         const { title, questions } = req.body;

//         //validate the title and qeuestions provided
//         if (!title || !Array.isArray(questions) || questions.length === 0) {
//             return res.status(400).json({ message: 'Title and questions are required' });
//         }

//         //  Ensure each question contains text data
//         for (const question of questions) {
//             if (!question.questionText || !question.answerText) {
//                 return res.status(400).json({ message: 'Each question must have both qeustionText and answerText.' });
//             }
//         }

//         // create a new quiz document and save it
//         const newQuiz = newQuiz({ title, questions });
//         await newQuiz.save();
//         res.status(201).json(newQuiz); //Respond with the created Quiz
//     }
//     catch (error) {
//         res.status(500).json({ message: 'An error occured while creating the quiz.', error });
//     }
// })



// controller function for fetching the all the quizzes MONICA
/*const Quiz = require("../models/Quiz");
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
*/