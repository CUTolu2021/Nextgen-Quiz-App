const { Schema, model } = require('mongoose');
const QuestionSchema = require('./question');
const question = require('./question');

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
 

 
//Defining the schema for quiz attempt
const quizAttemptSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
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
    correct: {
        type: Number,
        default: 0
    },
    points: {
        type: Number,
        default: 0
    },
    wrong: {
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
    },
    questionId: {
        type: Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    question: {
        type: String,
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
    point: {
        type: Number,
        default: 0
    },
    isCorrect: {
        type: Boolean,
        required: true
    }
})
module.exports = {
    Quiz: model('Quiz', quizSchema),
    QuizAttempt: model('QuizAttempt', quizAttemptSchema),
    QuizResponse: model('QuizResponse', quizResponseSchema)
  };