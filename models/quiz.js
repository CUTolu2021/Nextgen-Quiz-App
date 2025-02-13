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
        time_limit: {
            type: Number,
            default: 5,
        },
        total_points: {
            type: Number,
            default: 0,
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
 

// //Creating quiz attempt, this model tracks each user's quiz attempts and stores the final score.
// const quizAttemptSchema = new mongoose.Schema({
//     userId: { type: String, required: true },
//     quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
//     score: { type: Number, required: true },
//     totalQuestions: { type: Number, required: true },
//     completedAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model(quizAttemptSchema, quiz, quizScores);



//Defining the schema for quiz attempt
const quizAttemptSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quizId: {
        type: Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    score: {
        type: Number,
        default: 0
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    timeUsed: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

const quizResponseSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questionId: {
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    quizId: {
        type: Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    selectedAnswer: {
        type: String,
        required: true
    },
    correctAnswer: {
        type: String,
        required: true
    },
})
module.exports = {
    Quiz: model('Quiz', quizSchema),
    QuizAttempt: model('QuizAttempt', quizAttemptSchema),
    QuizResponse: model('QuizResponse', quizResponseSchema)
  };




  questionId: {
    type: Schema.Types.ObjectId,
  };
  
 // The following code creates a quiz attempt, this model tracks each user's quiz attempts and stores the final score.