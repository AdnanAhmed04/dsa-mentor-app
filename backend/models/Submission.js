const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true // Can be Quiz or MockTest
  },
  type: {
    type: String,
    enum: ['quiz', 'mock'],
    required: true
  },
  answers: [{
    questionIndex: Number,
    selectedOption: Number,
    isCorrect: Boolean
  }],
  score: {
    type: Number,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  timeTaken: {
    type: Number, // In seconds
    default: 0
  },
  topicBreakdown: [{
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    correct: Number,
    total: Number
  }]
}, {
  timestamps: true
});

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
