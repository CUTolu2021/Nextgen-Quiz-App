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

// get route to get all quizzes