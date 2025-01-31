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

//Implement GET /quiz/:quizId/score to calculate the user’s scoreduring or after the quiz.
const express = require("express");
const mongoose = require("mongoose");
const Quiz = require("../models/quiz"); // Assume this stores quiz questions & correct answers
const UserResponse = require("../models/UserResponse"); // Assume this stores user answers

const router = express.Router();


const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
    title: String,
    questions: [
        {
            questionText: String,
            options: [String],
            correctAnswer: String,
        }
    ]
});

module.exports = mongoose.model("Quiz", quizSchema);

//Creating quiz attempt, this model tracks each user's quiz attempts and stores the final score.
const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    completedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);

