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

// Import the Quiz model
const Quiz = require('../models/quizModel'); // Adjust the path to your model file

// Controller function to find a quiz by ID
const findQuizById = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the request parameters

    // Validate the ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid quiz ID format.' });
    }

    // Find the quiz by ID
    const quiz = await Quiz.findById(id);

    // Check if the quiz exists
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    // Respond with the quiz
    res.status(200).json(quiz);
  } catch (error) {
    // Handle any server errors
    console.error(error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

module.exports = findQuizById;