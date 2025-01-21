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
    if (!question || !options || !answer) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    const newQuiz = new Quiz({ question, options, answer });
    await newQuiz.save();
    
    res.status(201).json(newQuiz);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getQuizzes, createQuiz };
