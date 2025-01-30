const Quiz = require('../models/quiz');
const Question = require('../models/question');
const fs = require('fs');
const csv = require('csv-parser');

// Create a new quiz
const createQuiz = async (req, res) => {
    const { title, description, settings } = req.body;

    // Validation
    if (!title || !description || !settings) {
        return res.status(400).json({ message: 'Title, description, and settings are required' });
    }

    try {
        const quiz = await Quiz.create({ title, description, settings, creatorId: req.user.userId });
        req.session.quizId = quiz._id; // Save the quiz ID in the session
        res.status(201).json({ message: 'Quiz created successfully', quiz });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create quiz', error: error.message });
    }
};

// Add new questions through the form
const addQuestions = async (req, res) => {
    const { question, option1, option2, option3, option4, correctAnswer } = req.body;
    const quizId = req.session.quizId;

    // Validation
    if (!question || !option1 || !option2 || !option3 || !option4 || !correctAnswer) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const questionData = await Question.create({
            question,
            options: [option1, option2, option3, option4],
            correctAnswers: correctAnswer,
            quizId
        });
        res.status(201).json({ message: 'Question added successfully', questionData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add question', error: error.message });
    }
};

// Upload CSV and create questions
const uploadCSV = async (req, res) => {
    const quizId = req.session.quizId;

    // Check if the quiz exists and the user is authorized
    const quiz = await Quiz.findById(quizId, 'creatorId questions');
    if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
    }
    if (quiz.creatorId.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Unauthorized to update this quiz' });
    }

    // Check if a file was uploaded
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const results = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                const questions = results.map(item => ({
                    question: item.question,
                    options: [item.option1, item.option2, item.option3, item.option4],
                    correctAnswers: item.correctAnswers, // Assuming correctAnswers is a comma-separated string
                    isMultipleChoice: item.isMultipleChoice === 'true',
                    imageUrl: item.imageUrl || null,
                    videoUrl: item.videoUrl || null,
                    quizId
                }));

                const createdQuestions = await Question.insertMany(questions);
                quiz.questions.push(...createdQuestions.map(q => q._id));
                await quiz.save();

                // Clean up the uploaded file
                fs.unlinkSync(req.file.path);

                res.status(200).json({ message: 'Questions added successfully', quiz });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Failed to process CSV', error: error.message });
            }
        });
};

// Upload questions using a patch request to update questions
const uploadQuestions = async (req, res) => {
    const quizId = req.params.quizId;

    // Check if the quiz exists and the user is authorized
    const quiz = await Quiz.findById(quizId, 'creatorId questions');
    if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
    }
    if (quiz.creatorId.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Unauthorized to update this quiz' });
    }

    // Check if a file was uploaded
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const results = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                const questions = results.map(item => ({
                    question: item.question,
                    options: [item.option1, item.option2, item.option3, item.option4],
                    correctAnswers: item.correctAnswers, // Assuming correctAnswers is a comma-separated string
                    isMultipleChoice: item.isMultipleChoice === 'true',
                    imageUrl: item.imageUrl || null,
                    videoUrl: item.videoUrl || null,
                    quizId
                }));

                const createdQuestions = await Question.insertMany(questions);
                quiz.questions.push(...createdQuestions.map(q => q._id));
                await quiz.save();

                // Clean up the uploaded file
                fs.unlinkSync(req.file.path);

                res.status(200).json({ message: 'Questions added successfully', quiz });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Failed to process CSV', error: error.message });
            }
        });
};

// Find a question from a specific quiz and update the image link
const updateQuestionImage = async (req, res) => {
    const { quizId, questionId } = req.params;

    try {
        const result = await uploadToCloudinary(req.file.path);
        const newImage = new Image({ url: result.url, publicId: result.publicId });
        await newImage.save();

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const question = quiz.questions.find(q => q._id.toString() === questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        question.imageUrl = newImage.url;
        await quiz.save();

        res.status(200).json({ message: 'Question image updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update image', error: error.message });
    }
};

// Get quizzes with pagination
const getQuizzes = async (req, res) => {
    let { page, limit } = req.query;

    // Validate query parameters
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    if (page < 1 || limit < 1) {
        return res.status(400).json({ message: "'page' and 'limit' must be greater than 0." });
    }

    const skip = (page - 1) * limit;

    try {
        const quizzes = await Quiz.find({ active_status: 'active' })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Quiz.countDocuments({ active_status: 'active' });

        res.json({
            message: `Total number of quizzes is ${total}. You are on page ${page}, a page is limited to ${limit} items, There are ${Math.ceil(total / limit)} pages in total.`,
            data: quizzes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching quizzes', error: error.message });
    }
};

// Get questions by quiz ID
const getQuestionByQuizId = async (req, res) => {
    const { quizId } = req.params;
    console.log(quizId);
    let result = [];

    try {
        const quiz = await Quiz.findById(quizId).populate('questions');
        if (!quiz || quiz.active_status === 'inactive') {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        for (const question of quiz.questions) {
            result.push(await Question.findById(question._id, 'question options correctAnswers isMultipleChoice imageUrl videoUrl'));
        }
        res.json({
            message: 'Questions fetched successfully',
            data: result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching questions', error: error.message });
    }
};

//Get Quiz by ID (GET /quizzes/:id)
const getQuizById = async (req, res) => {
    //Controller function to fetch a quiz by its ID
    const { quizId } = req.params;
    console.log(quizId);

    try {
        //Fetch quiz with questions
        const quiz = await Quiz.findById(quizId)
            .populate({
                path: 'questions',
                model: 'Question'
            });
        console.log(quiz);

        // Check if quiz exists
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        // Prepare full quiz response with complete question details
        res.status(200).json({
            success: true,
            quiz: {
                ...quiz.toObject(), // Convert Mongoose document to plain object
                questions: quiz.questions // Include full questions array
            }
        });


    } catch (error) {
        //Comprehensive error handling
        console.error('Error fetching quiz:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the quiz',
            error: error.message
        });
    }
};

//update quiz 
const updateQuiz = async (req, res) => {
    const { quizId } = req.params; // quizId = req.params.id;
    const { userId } = req.user; // userId = req.user.userId;
    try {
        const quiz = await Quiz.findById(quizId);
       
        if (!quiz || quiz.active_status === 'inactive') {
            return res.status(404).json({ message: 'Quiz not found' })
        }
        if (quiz.creatorId.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorised to update this quiz' });
        }
        const updatedQuiz = await Quiz.findByIdAndUpdate(quizId, req.body, { new: true });
        return res.json ({
            message: 'Quiz updated successfully', 
            data: updatedQuiz
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// checkQuizCreator, async (req, res) => {
//     try {
//         const quizId = req.params.quizId;
//         const updatedData = req.body;
//         const updatedQuiz = await Quiz.findByIdAndUpdate(quizId, updatedData, {new: true});
//         if (!updatedQuiz) {
//             return res.status(404).json({message: 'Quiz not found'});
//         }
//         return res.json (updatedQuiz);

//     } catch (error) {
//         return res.status(500).json({message: 'Error updating quiz'});
//  }
// }






//delete quiz by id
const deleteQuizById = async (req, res) => {
    const { quizId } = req.params;

    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        if (quiz.creatorId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized to delete this quiz' });
        }

        quiz.active_status = 'inactive';
        await quiz.save();
        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete quiz', error: error.message });
    }
};

module.exports = {
    createQuiz,
    uploadCSV,
    updateQuestionImage,
    uploadQuestions,
    getQuizzes,
    getQuestionByQuizId,
    addQuestions,
    deleteQuizById,
    getQuizById,
    updateQuiz
};