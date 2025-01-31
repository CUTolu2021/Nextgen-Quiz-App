const quizAttemptSchema = require('../models/quizAttempt')

// checking if user has an active quiz attept
const checkActiveQuizAttempt = async (req, res) => {
    const {userId} = req.user;
    try{
        const ActiveQuizAttempt = await quizAttemptSchema.findone({
            userId,
            isCompleted: false
        });
        if (!ActiveQuizAttempt) {
            return res.status(400).json({message: "No active quiz found. Please start  a quiz first."});
        }
    } catch (error) {
        console.error('Error checking active quiz attempt:', error);
        return res.status(500).json({message: "Server error"});
    }
    
};

module.exports = { checkActiveQuizAttempt}