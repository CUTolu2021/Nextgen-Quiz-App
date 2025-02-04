const { Schema, model } = require('mongoose');
const QuestionSchema = require('./question');

const quizSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
    },
    questions: [
        {
          type: { type: Schema.Types.ObjectId, ref: 'Question' },
        },
      ],
    creatorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    settings: {
        timer: {
            type: Number,
            default: 0,
        },
        points: {
            type: Number,
            default: 1,
        },    
    },
    active_status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    status: {
        type: String,
        enum: ['Published', 'Draft'],
        default: 'Draft',
    },
}, {
    timestamps: true,
});
// Fetching all quizzes

const quiz = new mongoose.Schema({
  questions: { type: String, required: true },
  title: [{ type: String, required: true }],
  description: { type: String, required: true },
});



//Implement GET /quiz/:quizId/score to calculate the user’s score during or after the quiz.
const quizScores = new mongoose.Schema({
    title: String,
    questions: [
        {
            questionText: String,
            options: [String],
            correctAnswer: String,
        }
    ]
});



//Creating quiz attempt, this model tracks each user's quiz attempts and stores the final score.
const quizAttemptSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    completedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model(quizAttemptSchema, quiz, quizScores);


module.exports = model('Quiz', quizSchema);
