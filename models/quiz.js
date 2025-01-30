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

module.exports = model('Quiz', quizSchema);