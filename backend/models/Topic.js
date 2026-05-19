const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Topic title is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Topic description is required']
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  content: {
    type: String,
    required: [true, 'Topic content is required']
  },
  codeExamples: {
    python: { type: String, default: '' },
    cpp: { type: String, default: '' },
    java: { type: String, default: '' }
  },
  commonMistakes: [String],
  practiceQuestions: [{
    title: String,
    url: String
  }],
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;
