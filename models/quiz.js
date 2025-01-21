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
// Fetching all quizzes
const mongoose = require("mongoose");

const quiz = new mongoose.Schema({
  questions: { type: String, required: true },
  title: [{ type: String, required: true }],
  description: { type: String, required: true },
});

module.exports = mongoose.model("Quiz", quiz);


