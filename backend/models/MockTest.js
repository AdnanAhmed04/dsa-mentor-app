const mongoose = require('mongoose');

const mockTestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Mock test title is required']
  },
  questions: [{
    questionText: String,
    options: [String],
    correctAnswer: Number,
    explanation: String,
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    type: {
      type: String,
      enum: ['MCQ', 'Code Output'],
      default: 'MCQ'
    }
  }],
  duration: {
    type: Number, // In minutes
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const MockTest = mongoose.model('MockTest', mockTestSchema);

module.exports = MockTest;
