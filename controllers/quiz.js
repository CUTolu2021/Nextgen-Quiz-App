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
        const quiz =  await Quiz.create({ title, description, settings, creatorId: req.user.userId });
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
    console.log("in the uploadCSV function:", req.session);

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
                    text: item.question,
                    options: [item.option1, item.option2, item.option3, item.option4],
                    correctAnswers: item.correctAnswers.split(','), // Split by comma for multiple answers
                    isMultipleChoice: item.isMultipleChoice === 'true',
                    imageUrl: item.imageUrl || null, // Optional image URL
                    videoUrl: item.videoUrl || null,  // Optional video URL
                    quizId
                }));

                // Find the quiz and update it with the new questions
                const quiz = await Quiz.findById(quizId);
                if (!quiz) {
                    return res.status(404).json({ message: 'Quiz not found' });
                }

                quiz.questions.push(...questions);
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
                    text: item.question,
                    options: [item.option1, item.option2, item.option3, item.option4],
                    correctAnswers: item.correctAnswers.split(','), // Split by comma for multiple answers
                    isMultipleChoice: item.isMultipleChoice === 'true',
                    imageUrl: item.imageUrl || null, // Optional image URL
                    videoUrl: item.videoUrl || null,  // Optional video URL
                    quizId
                }));
                // Find the quiz and update it with the new questions
                const quiz = await Quiz.findById(quizId);
                if (!quiz) {
                    return res.status(404).json({ message: 'Quiz not found' });
                }
                quiz.questions.push(...questions);
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

// post route to create a new quiz
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

module.exports = {
    createQuiz, uploadCSV, updateQuestionImage
}