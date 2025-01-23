const { Schema, model } = require('mongoose');
const quiz = require('./quiz');

const QuestionSchema = new Schema({
    question: { type: String, required: true },
    options: [{ type: String, required: true }], // For multiple-choice options
    correctAnswers: { type: String, required: true }, // Store the correct answer
    isMultipleChoice: { type: Boolean, default: false },
    imageUrl: { type: String }, // Field for image URL
    videoUrl: { type: String },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  });
  
  module.exports = model('Question', QuestionSchema);