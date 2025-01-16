const { Schema, model } = require('mongoose');

const quizSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    questions: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Question',
        },
    ],
    creator_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    settings: {
        type: Object,
        required: true,
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