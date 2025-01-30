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


// Defining the schema for quiz attempt
const quizAttemptSchema =  new mongoose.Schema({
    attemptId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quuiz',
        required: true
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    currentQuestion: {
        type: Number,
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true

})

module.exports = model(quizSchema, quizAttemptSchema);