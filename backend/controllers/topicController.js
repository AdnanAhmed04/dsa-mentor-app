const Topic = require('../models/Topic');
const Quiz = require('../models/Quiz');
const MockTest = require('../models/MockTest');
const Submission = require('../models/Submission');
const User = require('../models/User');

exports.getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find().sort('order');
    res.status(200).json({
      status: 'success',
      results: topics.length,
      data: { topics }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getTopic = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({
        status: 'fail',
        message: 'No topic found with that ID'
      });
    }
    res.status(200).json({
      status: 'success',
      data: { topic }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.createTopic = async (req, res) => {
  try {
    const newTopic = await Topic.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { topic: newTopic }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.updateTopic = async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!topic) {
      return res.status(404).json({
        status: 'fail',
        message: 'No topic found with that ID'
      });
    }
    res.status(200).json({
      status: 'success',
      data: { topic }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findByIdAndDelete(req.params.id);
    if (!topic) {
      return res.status(404).json({
        status: 'fail',
        message: 'No topic found with that ID'
      });
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Quiz related functions within Topic controller for convenience
exports.getTopicQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ topicId: req.params.topicId });
    if (!quiz) {
      return res.status(404).json({
        status: 'fail',
        message: 'No quiz found for this topic'
      });
    }
    res.status(200).json({
      status: 'success',
      data: { quiz }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    const newQuiz = await Quiz.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { quiz: newQuiz }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.createMockTest = async (req, res) => {
  try {
    console.log('Received Mock Test Data:', JSON.stringify(req.body, null, 2));
    const newMockTest = await MockTest.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { mockTest: newMockTest }
    });
  } catch (err) {
    console.error('Error creating Mock Test:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getAllMockTests = async (req, res) => {
  try {
    const mockTests = await MockTest.find().sort('-createdAt');
    res.status(200).json({
      status: 'success',
      results: mockTests.length,
      data: { mockTests }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.updateMockTest = async (req, res) => {
  try {
    const mockTest = await MockTest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!mockTest) {
      return res.status(404).json({
        status: 'fail',
        message: 'No mock test found with that ID'
      });
    }
    res.status(200).json({
      status: 'success',
      data: { mockTest }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.deleteMockTest = async (req, res) => {
  try {
    const mockTest = await MockTest.findByIdAndDelete(req.params.id);
    if (!mockTest) {
      return res.status(404).json({
        status: 'fail',
        message: 'No mock test found with that ID'
      });
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalMockTests = await MockTest.countDocuments();
    const totalQuizzes = await Quiz.countDocuments();
    const totalAttempts = await Submission.countDocuments();

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        totalMockTests,
        totalQuizzes,
        totalAttempts
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
