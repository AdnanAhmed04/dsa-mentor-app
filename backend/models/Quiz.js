const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // Index of the option
  explanation: String,
  type: {
    type: String,
    enum: ['MCQ', 'Code Output', 'Complexity', 'Concept'],
    default: 'MCQ'
  }
});

const quizSchema = new mongoose.Schema({
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  questions: [questionSchema],
  totalMarks: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
